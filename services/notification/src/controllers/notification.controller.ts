import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { PushService } from '../services/push.service.js';
import { EmailService } from '../services/email.service.js';
import { DeviceToken } from '../models/device-token.model.js';
import { NotificationType } from '../models/notification.model.js';

const pushService = new PushService();
const emailService = new EmailService();
const notificationService = new NotificationService(pushService, emailService);

const VALID_TYPES: NotificationType[] = [
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
];

export class NotificationController {
  /**
   * POST /api/notifications/device-token
   * Register or update a device token for push notifications.
   */
  async registerDeviceToken(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId as string;
      const { token, platform } = req.body as { token?: string; platform?: string };

      if (!token) {
        res.status(400).json({ success: false, message: 'token is required' });
        return;
      }

      const validPlatforms = ['web', 'android', 'ios'];
      const resolvedPlatform = (validPlatforms.includes(platform ?? '') ? platform : 'web') as 'web' | 'android' | 'ios';

      // Upsert: if the token exists, update userId; otherwise create
      await DeviceToken.findOneAndUpdate(
        { token },
        { userId, token, platform: resolvedPlatform },
        { upsert: true, new: true }
      );

      res.json({ success: true, message: 'Device token registered' });
    } catch (error: any) {
      console.error('registerDeviceToken error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/notifications
   * Get paginated notifications for the current user.
   */
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId as string;
      const pageRaw = Array.isArray(req.query['page']) ? '1' : (req.query['page'] ?? '1');
      const limitRaw = Array.isArray(req.query['limit']) ? '20' : (req.query['limit'] ?? '20');
      const page = Math.max(1, parseInt(pageRaw as string, 10));
      const limit = Math.min(100, Math.max(1, parseInt(limitRaw as string, 10)));

      const result = await notificationService.getUserNotifications(userId, page, limit);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('getNotifications error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Get the number of unread notifications for the current user.
   */
  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId as string;
      const count: number = await notificationService.getUnreadCount(userId);
      res.json({ success: true, data: { count } });
    } catch (error: any) {
      console.error('getUnreadCount error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark a single notification as read.
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId as string;
      const id = req.params['id'] as string;

      if (!id) {
        res.status(400).json({ success: false, message: 'Notification ID is required' });
        return;
      }

      const notification = await notificationService.markAsRead(id, userId);

      if (!notification) {
        res.status(404).json({ success: false, message: 'Notification not found' });
        return;
      }

      res.json({ success: true, data: notification });
    } catch (error: any) {
      console.error('markAsRead error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * PATCH /api/notifications/read-all
   * Mark all notifications as read for the current user.
   */
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId as string;
      const count = await notificationService.markAllAsRead(userId);
      res.json({ success: true, data: { modifiedCount: count } });
    } catch (error: any) {
      console.error('markAllAsRead error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/notifications/:id
   * Delete a notification (must belong to current user).
   */
  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId as string;
      const id = req.params['id'] as string;

      if (!id) {
        res.status(400).json({ success: false, message: 'Notification ID is required' });
        return;
      }

      const deleted = await notificationService.deleteNotification(id, userId);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Notification not found' });
        return;
      }

      res.json({ success: true, message: 'Notification deleted' });
    } catch (error: any) {
      console.error('deleteNotification error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /api/notifications/send
   * Internal endpoint — called by other microservices (no auth required).
   * Body: { userId, type, title, body, data?, channels?, email?, emailPayload? }
   */
  async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      const {
        userId,
        type,
        title,
        body,
        data,
        channels,
        email,
        emailPayload,
      } = req.body as {
        userId?: string;
        type?: string;
        title?: string;
        body?: string;
        data?: Record<string, string>;
        channels?: string[];
        email?: string;
        emailPayload?: Record<string, unknown>;
      };

      if (!userId || !type || !title || !body) {
        res.status(400).json({
          success: false,
          message: 'userId, type, title, and body are required',
        });
        return;
      }

      if (!VALID_TYPES.includes(type as NotificationType)) {
        res.status(400).json({
          success: false,
          message: `Invalid notification type. Valid types: ${VALID_TYPES.join(', ')}`,
        });
        return;
      }

      const notification = await notificationService.createAndSend({
        userId,
        type: type as NotificationType,
        title,
        body,
        ...(data ? { data } : {}),
        channels: (channels ?? []) as Array<'push' | 'email'>,
        ...(email ? { email } : {}),
        ...(emailPayload ? { emailPayload: emailPayload as any } : {}),
      });

      res.json({ success: true, data: notification });
    } catch (error: any) {
      console.error('sendNotification error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
