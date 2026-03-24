export interface DishRating {
  dishId: string;
  name: string;
  rating: number;
}

export interface Rating {
  taste: number;
  portion: number;
  hygiene: number;
  overall: number;
}

export interface Review {
  _id: string;
  orderId: string;
  kitchenId: string;
  buyerId: string;
  cookId: string;
  rating: Rating;
  dishRatings: DishRating[];
  comment: string;
  photos: string[];
  cookReply?: string;
  cookRepliedAt?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
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
  dishRatings: DishRating[];
  comment: string;
}

export interface RatingSummary {
  averageTaste: number;
  averagePortion: number;
  averageHygiene: number;
  averageOverall: number;
  totalReviews: number;
}

export interface PaginatedReviews {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
}
