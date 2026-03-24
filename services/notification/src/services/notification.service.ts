import { Notification, INotification, NotificationType } from '../models/notification.model.js';
import { PushService } from './push.service.js';
import { EmailService } from './email.service.js';

export type NotificationChannel = 'push' | 'email';

export interface SendNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  channels?: NotificationChannel[];
  email?: string;
  // Extra fields for typed email templates
  emailPayload?: {
    orderId?: string;
    items?: Array<{ name: string; quantity: number; price: number }>;
    totalAmount?: number;
    amount?: number;
    platformFee?: number;
    netAmount?: number;
    status?: string;
    message?: string;
  };
}

export interface PaginatedNotifications {
  notifications: INotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class NotificationService {
  private pushService: PushService;
  private emailService: EmailService;

  constructor(pushService: PushService, emailService: EmailService) {
    this.pushService = pushService;
    this.emailService = emailService;
  }

  async createAndSend(options: SendNotificationOptions): Promise<INotification> {
    const { userId, type, title, body, data, channels = [], email, emailPayload } = options;

    // Always persist to DB for in-app notifications
    const notification = await Notification.create({
      userId,
      type,
      title,
      body,
      ...(data ? { data } : {}),
    });

    // Push notification channel
    if (channels.includes('push')) {
      await this.pushService.sendToUser(userId, title, body, data);
    }

    // Email channel — pick the right template based on type
    if (channels.includes('email') && email) {
      await this.dispatchEmail(type, email, emailPayload ?? {});
    }

    return notification;
  }

  private async dispatchEmail(
    type: NotificationType,
    email: string,
    payload: NonNullable<SendNotificationOptions['emailPayload']>
  ): Promise<void> {
    const orderId = payload.orderId ?? 'N/A';

    switch (type) {
      case 'order_placed':
      case 'order_confirmed':
        if (payload.items && payload.totalAmount !== undefined) {
          await this.emailService.sendOrderConfirmation(
            email,
            orderId,
            payload.items,
            payload.totalAmount
          );
        }
        break;

      case 'payment_received':
        if (
          payload.amount !== undefined &&
          payload.platformFee !== undefined &&
          payload.netAmount !== undefined
        ) {
          await this.emailService.sendPaymentReceipt(
            email,
            orderId,
            payload.amount,
            payload.platformFee,
            payload.netAmount
          );
        }
        break;

      case 'payment_refunded':
        if (payload.amount !== undefined) {
          await this.emailService.sendRefundNotification(email, orderId, payload.amount);
        }
        break;

      case 'order_preparing':
      case 'order_ready':
      case 'order_delivered':
      case 'order_cancelled':
      case 'order_rejected':
        await this.emailService.sendOrderStatusUpdate(
          email,
          orderId,
          type.replace('order_', ''),
          payload.message ?? `Your order status has been updated to: ${type.replace('order_', '')}.`
        );
        break;

      default:
        // review_received, cook_reply — no dedicated email template, skip silently
        break;
    }
  }

  async getUserNotifications(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginatedNotifications> {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments({ userId }),
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
    return notification;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return (result as any).nModified ?? (result as any).modifiedCount ?? 0;
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const result = await Notification.deleteOne({ _id: notificationId, userId });
    return ((result as any).deletedCount ?? (result as any).n ?? 0) > 0;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({ userId, isRead: false });
  }
}
