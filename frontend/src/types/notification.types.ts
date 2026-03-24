export type NotificationType =
  | "order_placed"
  | "order_confirmed"
  | "order_preparing"
  | "order_ready"
  | "order_delivered"
  | "order_cancelled"
  | "order_rejected"
  | "payment_received"
  | "payment_refunded"
  | "review_received"
  | "cook_reply";

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}
