import { apiClient } from "./axios";
import type { Notification } from "../types/notification.types";

export const notificationApi = {
  registerDeviceToken: async (token: string, platform: "web" | "android" | "ios" = "web") => {
    const { data } = await apiClient.post("/notifications/device-token", { token, platform });
    return data.data;
  },

  getNotifications: async (page = 1, limit = 20): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> => {
    const { data } = await apiClient.get("/notifications", { params: { page, limit } });
    return data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get("/notifications/unread-count");
    return data.data.count;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch("/notifications/read-all");
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`);
  },
};
