import { apiClient } from "./axios";
import type { CreateReviewDto, PaginatedReviews, RatingSummary, Review } from "../types/review.types";

export const reviewApi = {
  createReview: async (dto: CreateReviewDto): Promise<Review> => {
    const { data } = await apiClient.post("/reviews", dto);
    return data.data;
  },

  uploadPhotos: async (reviewId: string, files: File[]): Promise<Review> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("photos", f));
    const { data } = await apiClient.post(`/reviews/${reviewId}/photos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  getKitchenReviews: async (kitchenId: string, page = 1, limit = 10): Promise<PaginatedReviews> => {
    const { data } = await apiClient.get(`/reviews/kitchen/${kitchenId}`, {
      params: { page, limit },
    });
    return data.data;
  },

  getKitchenRatingSummary: async (kitchenId: string): Promise<RatingSummary> => {
    const { data } = await apiClient.get(`/reviews/kitchen/${kitchenId}/summary`);
    return data.data;
  },

  getMyReviews: async (): Promise<Review[]> => {
    const { data } = await apiClient.get("/reviews/my");
    return data.data;
  },

  addCookReply: async (reviewId: string, reply: string): Promise<Review> => {
    const { data } = await apiClient.patch(`/reviews/${reviewId}/reply`, { reply });
    return data.data;
  },

  updateCookReply: async (reviewId: string, reply: string): Promise<Review> => {
    const { data } = await apiClient.put(`/reviews/${reviewId}/reply`, { reply });
    return data.data;
  },

  deleteCookReply: async (reviewId: string): Promise<Review> => {
    const { data } = await apiClient.delete(`/reviews/${reviewId}/reply`);
    return data.data;
  },

  updateReview: async (reviewId: string, updates: { comment?: string; rating?: { taste?: number; portion?: number; hygiene?: number }; dishRatings?: any[] }): Promise<Review> => {
    const { data } = await apiClient.patch(`/reviews/${reviewId}`, updates);
    return data.data;
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    await apiClient.delete(`/reviews/${reviewId}`);
  },

  getReviewByOrderId: async (orderId: string): Promise<Review | null> => {
    try {
      const { data } = await apiClient.get(`/reviews/my`);
      const reviews: Review[] = data.data;
      return reviews.find((r) => r.orderId === orderId) ?? null;
    } catch {
      return null;
    }
  },

  checkReviewExists: async (orderId: string): Promise<boolean> => {
    try {
      const { data } = await apiClient.get(`/reviews/my`);
      const reviews: Review[] = data.data;
      return reviews.some((r) => r.orderId === orderId);
    } catch {
      return false;
    }
  },
};
