import mongoose from "mongoose";
import type { Document } from "mongoose";
const { Schema } = mongoose;
import { IReview, IDishRating, IRatingBreakdown } from "../interfaces/review.interface.js";

export interface IReviewDocument extends IReview, Document {}

const DishRatingSchema = new Schema<IDishRating>(
  {
    dishId: { type: String, required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false }
);

const RatingBreakdownSchema = new Schema<IRatingBreakdown>(
  {
    taste: { type: Number, required: true, min: 1, max: 5 },
    portion: { type: Number, required: true, min: 1, max: 5 },
    hygiene: { type: Number, required: true, min: 1, max: 5 },
    overall: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false }
);

const ReviewSchema = new Schema<IReviewDocument>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    kitchenId: {
      type: String,
      required: true,
      index: true,
    },
    buyerId: {
      type: String,
      required: true,
      index: true,
    },
    cookId: {
      type: String,
      required: true,
      index: true,
    },
    rating: {
      type: RatingBreakdownSchema,
      required: true,
    },
    dishRatings: {
      type: [DishRatingSchema],
      default: [],
    },
    comment: {
      type: String,
      maxlength: 1000,
      default: "",
    },
    photos: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length <= 5,
        message: "Maximum 5 photos allowed per review",
      },
    },
    cookReply: {
      type: String,
      default: undefined,
    },
    cookRepliedAt: {
      type: Date,
      default: undefined,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ kitchenId: 1, createdAt: -1 });
ReviewSchema.index({ buyerId: 1, createdAt: -1 });

const Review = mongoose.model<IReviewDocument>("Review", ReviewSchema);

export default Review;
