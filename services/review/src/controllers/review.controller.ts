import { Response } from "express";
import { ReviewService } from "../services/review.service.js";
import { AuthRequest, CreateReviewDto, AddCookReplyDto } from "../interfaces/review.interface.js";

const reviewService = new ReviewService();

export class ReviewController {
  // POST /api/reviews
  async createReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const buyerId = req.userId!;
      const dto: CreateReviewDto = req.body;

      if (!dto.orderId || !dto.kitchenId || !dto.cookId) {
        res.status(400).json({ success: false, message: "orderId, kitchenId, and cookId are required" });
        return;
      }

      if (!dto.rating || dto.rating.taste == null || dto.rating.portion == null || dto.rating.hygiene == null) {
        res.status(400).json({ success: false, message: "rating.taste, rating.portion, and rating.hygiene are required" });
        return;
      }

      const validRating = (n: number) => n >= 1 && n <= 5;
      if (!validRating(dto.rating.taste) || !validRating(dto.rating.portion) || !validRating(dto.rating.hygiene)) {
        res.status(400).json({ success: false, message: "Each rating value must be between 1 and 5" });
        return;
      }

      const review = await reviewService.createReview(buyerId, dto);
      res.status(201).json({ success: true, data: review });
    } catch (error: any) {
      const status = error.message?.includes("not found") ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  // POST /api/reviews/:id/photos
  async uploadReviewPhotos(req: AuthRequest, res: Response): Promise<void> {
    try {
      const buyerId = req.userId!;
      const reviewId = req.params.id as string;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ success: false, message: "No photos provided" });
        return;
      }

      const review = await reviewService.uploadReviewPhotos(reviewId, buyerId, files);
      res.json({ success: true, data: review });
    } catch (error: any) {
      const status = error.message?.includes("not found") ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  // GET /api/reviews/kitchen/:kitchenId
  async getKitchenReviews(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { kitchenId } = req.params;
      const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
      const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || "10", 10)));

      const result = await reviewService.getKitchenReviews(kitchenId as string, page, limit);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/reviews/kitchen/:kitchenId/summary
  async getKitchenRatingSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { kitchenId } = req.params;
      const summary = await reviewService.getKitchenRatingSummary(kitchenId as string);
      res.json({ success: true, data: summary });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/reviews/my
  async getMyReviews(req: AuthRequest, res: Response): Promise<void> {
    try {
      const buyerId = req.userId!;
      const reviews = await reviewService.getMyReviews(buyerId);
      res.json({ success: true, data: reviews });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // PATCH /api/reviews/:id/reply
  async addCookReply(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cookId = req.userId!;
      const reviewId = req.params.id as string;
      const { reply } = req.body as AddCookReplyDto;

      if (!reply || reply.trim().length === 0) {
        res.status(400).json({ success: false, message: "Reply text is required" });
        return;
      }

      const review = await reviewService.addCookReply(reviewId, cookId, reply.trim());
      res.json({ success: true, data: review });
    } catch (error: any) {
      const status = error.message?.includes("not found") ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  // PATCH /api/reviews/:id  (buyer edits review)
  async updateReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const buyerId = req.userId!;
      const reviewId = req.params.id as string;
      const { comment, rating, dishRatings } = req.body;
      const review = await reviewService.updateReview(reviewId, buyerId, { comment, rating, dishRatings });
      res.json({ success: true, data: review });
    } catch (error: any) {
      const status = error.message?.includes("not found") ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  // PUT /api/reviews/:id/reply  (cook updates their reply)
  async updateCookReply(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cookId = req.userId!;
      const reviewId = req.params.id as string;
      const { reply } = req.body as AddCookReplyDto;
      if (!reply || reply.trim().length === 0) {
        res.status(400).json({ success: false, message: "Reply text is required" });
        return;
      }
      const review = await reviewService.updateCookReply(reviewId, cookId, reply.trim());
      res.json({ success: true, data: review });
    } catch (error: any) {
      const status = error.message?.includes("not found") ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/reviews/:id/reply  (cook deletes their reply)
  async deleteCookReply(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cookId = req.userId!;
      const reviewId = req.params.id as string;
      const review = await reviewService.deleteCookReply(reviewId, cookId);
      res.json({ success: true, data: review });
    } catch (error: any) {
      const status = error.message?.includes("not found") ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/reviews/:id
  async deleteReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const buyerId = req.userId!;
      const reviewId = req.params.id as string;

      const result = await reviewService.deleteReview(reviewId, buyerId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      const status = error.message?.includes("not found") ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }
}
