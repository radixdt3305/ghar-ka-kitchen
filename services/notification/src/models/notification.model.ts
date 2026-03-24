import mongoose from 'mongoose';
import type { Document } from 'mongoose';
const { Schema } = mongoose;

export type NotificationType =
  | 'order_placed'
  | 'order_confirmed'
  | 'order_preparing'
  | 'order_ready'
  | 'order_delivered'
  | 'order_cancelled'
  | 'order_rejected'
  | 'payment_received'
  | 'payment_refunded'
  | 'review_received'
  | 'cook_reply';

export interface INotification extends Document {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'order_placed',
        'order_confirmed',
        'order_preparing',
        'order_ready',
        'order_delivered',
        'order_cancelled',
        'order_rejected',
        'payment_received',
        'payment_refunded',
        'review_received',
        'cook_reply',
      ] as NotificationType[],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    data: {
      type: Map,
      of: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
