import { Request } from "express";

export interface IDishRating {
  dishId: string;
  name: string;
  rating: number;
}

export interface IRatingBreakdown {
  taste: number;
  portion: number;
  hygiene: number;
  overall: number;
}

export interface IReview {
  orderId: string;
  kitchenId: string;
  buyerId: string;
  cookId: string;
  rating: IRatingBreakdown;
  dishRatings: IDishRating[];
  comment: string;
  photos: string[];
  cookReply?: string;
  cookRepliedAt?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewDto {
  orderId: string;
  kitchenId: string;
  cookId: string;
  rating: {
    taste: number;
    portion: number;
    hygiene: number;
  };
  dishRatings?: IDishRating[];
  comment?: string;
}

export interface AddCookReplyDto {
  reply: string;
}

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

export interface PaginatedReviews {
  reviews: IReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RatingSummary {
  kitchenId: string;
  totalReviews: number;
  averageTaste: number;
  averagePortion: number;
  averageHygiene: number;
  averageOverall: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
