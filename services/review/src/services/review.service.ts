import axios from "axios";
import { cloudinary } from "../config/cloudinary.js";
import { env } from "../config/env.js";
import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import Kitchen from "../models/kitchen.model.js";
import {
  CreateReviewDto,
  PaginatedReviews,
  RatingSummary,
} from "../interfaces/review.interface.js";

export class ReviewService {
  // ──────────────────────────────────────────────
  // 1. Create a review (buyer only, once per order)
  // ──────────────────────────────────────────────
  async createReview(buyerId: string, dto: CreateReviewDto) {
    // Verify the order exists and is DELIVERED — query DB directly (same MongoDB)
    const orderDoc = await Order.findOne({ orderId: dto.orderId }).lean();
    if (!orderDoc) throw new Error("Order not found");

    if ((orderDoc as any).userId !== buyerId) {
      throw new Error("You are not the buyer of this order");
    }

    const orderStatus: string = ((orderDoc as any).status ?? "").toUpperCase();
    if (orderStatus !== "DELIVERED") {
      throw new Error(
        `Order must be DELIVERED before leaving a review (current status: ${(orderDoc as any).status})`
      );
    }

    // Only one review per order (unique index will also enforce this)
    const existing = await Review.findOne({ orderId: dto.orderId });
    if (existing) {
      throw new Error("You have already submitted a review for this order");
    }

    // Look up the real cookId from the Kitchen collection
    // (don't trust the frontend-supplied cookId — it may be the kitchenId due to a legacy bug)
    const kitchen = await Kitchen.findById(dto.kitchenId).lean();
    const realCookId: string = kitchen ? (kitchen as any).cookId : dto.cookId;

    // Compute overall as average of the three sub-ratings
    const { taste, portion, hygiene } = dto.rating;
    const overall = parseFloat(((taste + portion + hygiene) / 3).toFixed(2));

    const review = await Review.create({
      orderId: dto.orderId,
      kitchenId: dto.kitchenId,
      buyerId,
      cookId: realCookId,
      rating: { taste, portion, hygiene, overall },
      dishRatings: dto.dishRatings ?? [],
      comment: dto.comment ?? "",
      photos: [],
      isVerified: true,
    });

    // Notify cook — fire-and-forget
    this.notifyCook(realCookId, review._id.toString()).catch(() => {
      /* intentionally swallowed */
    });

    return review;
  }

  // ──────────────────────────────────────────────
  // 2. Upload photos to Cloudinary and attach them
  // ──────────────────────────────────────────────
  async uploadReviewPhotos(
    reviewId: string,
    buyerId: string,
    files: Express.Multer.File[]
  ) {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error("Review not found");
    if (review.buyerId !== buyerId) throw new Error("Not your review");

    if (review.photos.length + files.length > 5) {
      throw new Error(
        `Cannot add ${files.length} photo(s): would exceed the 5-photo limit (currently ${review.photos.length})`
      );
    }

    const uploadedUrls: string[] = await Promise.all(
      files.map((file) => this.uploadBufferToCloudinary(file.buffer, file.mimetype))
    );

    review.photos.push(...uploadedUrls);
    await review.save();

    return review;
  }

  // ──────────────────────────────────────────────
  // 3. Get paginated reviews for a kitchen
  // ──────────────────────────────────────────────
  async getKitchenReviews(
    kitchenId: string,
    page: number,
    limit: number
  ): Promise<PaginatedReviews> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ kitchenId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Review.countDocuments({ kitchenId }),
    ]);

    return {
      reviews: reviews as any,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ──────────────────────────────────────────────
  // 4. Get all reviews left by a buyer
  // ──────────────────────────────────────────────
  async getMyReviews(buyerId: string) {
    return Review.find({ buyerId }).sort({ createdAt: -1 }).lean();
  }

  // ──────────────────────────────────────────────
  // 5. Cook replies to a review
  // ──────────────────────────────────────────────
  async addCookReply(reviewId: string, cookId: string, reply: string) {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error("Review not found");
    await this.assertCookOwnsKitchen(review, cookId);
    if (review.cookReply) {
      throw new Error("A reply has already been submitted for this review");
    }

    review.cookReply = reply;
    review.cookRepliedAt = new Date();
    await review.save();

    return review;
  }

  // ──────────────────────────────────────────────
  // 6. Buyer edits their review (only if no cook reply yet)
  // ──────────────────────────────────────────────
  async updateReview(reviewId: string, buyerId: string, updates: { comment?: string; rating?: { taste?: number; portion?: number; hygiene?: number }; dishRatings?: any[] }) {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error("Review not found");
    if (review.buyerId !== buyerId) throw new Error("You can only edit your own reviews");
    if (review.cookReply) throw new Error("Cannot edit review after the cook has replied");

    if (updates.comment !== undefined) review.comment = updates.comment;
    if (updates.dishRatings !== undefined) review.dishRatings = updates.dishRatings;
    if (updates.rating) {
      const t = updates.rating.taste ?? review.rating.taste;
      const p = updates.rating.portion ?? review.rating.portion;
      const h = updates.rating.hygiene ?? review.rating.hygiene;
      review.rating.taste = t;
      review.rating.portion = p;
      review.rating.hygiene = h;
      review.rating.overall = parseFloat(((t + p + h) / 3).toFixed(2));
      (review as any).markModified("rating"); // Mongoose 5: nested sub-doc changes must be flagged
    }
    await review.save();
    return review;
  }

  // ──────────────────────────────────────────────
  // Shared ownership check: cook must own the kitchen
  // ──────────────────────────────────────────────
  private async assertCookOwnsKitchen(review: any, cookId: string) {
    const kitchen = await Kitchen.findOne({ _id: review.kitchenId, cookId }).lean();
    if (!kitchen) throw new Error("You can only manage replies for your kitchen");
  }

  // ──────────────────────────────────────────────
  // 7. Cook edits their reply
  // ──────────────────────────────────────────────
  async updateCookReply(reviewId: string, cookId: string, reply: string) {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error("Review not found");
    await this.assertCookOwnsKitchen(review, cookId);
    if (!review.cookReply) throw new Error("No existing reply to update. Use add reply instead.");
    review.cookReply = reply;
    review.cookRepliedAt = new Date();
    await review.save();
    return review;
  }

  // ──────────────────────────────────────────────
  // 8. Cook deletes their reply
  // ──────────────────────────────────────────────
  async deleteCookReply(reviewId: string, cookId: string) {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error("Review not found");
    await this.assertCookOwnsKitchen(review, cookId);
    if (!review.cookReply) throw new Error("No reply to delete");
    await Review.updateOne({ _id: reviewId }, { $unset: { cookReply: 1, cookRepliedAt: 1 } });
    review.cookReply = undefined;
    review.cookRepliedAt = undefined;
    return review;
  }

  // ──────────────────────────────────────────────
  // 9. Delete a review (buyer only)
  // ──────────────────────────────────────────────
  async deleteReview(reviewId: string, buyerId: string) {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error("Review not found");
    if (review.buyerId !== buyerId) {
      throw new Error("You can only delete your own reviews");
    }

    await review.deleteOne();
    return { message: "Review deleted successfully" };
  }

  // ──────────────────────────────────────────────
  // 7. Aggregated rating summary for a kitchen
  // ──────────────────────────────────────────────
  async getKitchenRatingSummary(kitchenId: string): Promise<RatingSummary> {
    const [aggregation, distribution] = await Promise.all([
      Review.aggregate([
        { $match: { kitchenId } },
        {
          $group: {
            _id: "$kitchenId",
            totalReviews: { $sum: 1 },
            averageTaste: { $avg: "$rating.taste" },
            averagePortion: { $avg: "$rating.portion" },
            averageHygiene: { $avg: "$rating.hygiene" },
            averageOverall: { $avg: "$rating.overall" },
          },
        },
      ]),
      Review.aggregate([
        { $match: { kitchenId } },
        {
          $group: {
            _id: { $floor: "$rating.overall" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const bucket of distribution) {
      const star: number = Math.min(5, Math.max(1, bucket._id as number));
      ratingDist[star] = (ratingDist[star] ?? 0) + (bucket.count as number);
    }

    const round2 = (n: number) => parseFloat((n ?? 0).toFixed(2));

    if (aggregation.length === 0) {
      return {
        kitchenId,
        totalReviews: 0,
        averageTaste: 0,
        averagePortion: 0,
        averageHygiene: 0,
        averageOverall: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const agg = aggregation[0];
    return {
      kitchenId,
      totalReviews: agg.totalReviews as number,
      averageTaste: round2(agg.averageTaste as number),
      averagePortion: round2(agg.averagePortion as number),
      averageHygiene: round2(agg.averageHygiene as number),
      averageOverall: round2(agg.averageOverall as number),
      ratingDistribution: ratingDist as RatingSummary["ratingDistribution"],
    };
  }

  // ──────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────

  private uploadBufferToCloudinary(
    buffer: Buffer,
    mimetype: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const resourceType = "image";
      const format = mimetype.split("/")[1] ?? "jpeg";

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "reviews",
          resource_type: resourceType,
          format,
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary upload failed"));
          } else {
            resolve(result.secure_url);
          }
        }
      );

      uploadStream.end(buffer);
    });
  }

  private async notifyCook(cookId: string, reviewId: string): Promise<void> {
    await axios.post(
      `${env.NOTIFICATION_SERVICE_URL}/api/notifications/send`,
      {
        userId: cookId,
        type: "review_received",
        title: "New Review Received",
        body: "A customer left a new review for your kitchen.",
        metadata: { reviewId },
      },
      { timeout: 4000 }
    );
  }
}
