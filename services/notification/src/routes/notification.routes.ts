import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const controller = new NotificationController();

/**
 * @openapi
 * /api/notifications/device-token:
 *   post:
 *     summary: Register a device token for push notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: FCM device token
 *               platform:
 *                 type: string
 *                 enum: [web, android, ios]
 *                 default: web
 *     responses:
 *       200:
 *         description: Device token registered successfully
 *       400:
 *         description: Missing token
 *       401:
 *         description: Unauthorized
 */
router.post('/device-token', authMiddleware, (req, res) => controller.registerDeviceToken(req, res));

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     summary: Get paginated notifications for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, (req, res) => controller.getNotifications(req, res));

/**
 * @openapi
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get the count of unread notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get('/unread-count', authMiddleware, (req, res) => controller.getUnreadCount(req, res));

/**
 * @openapi
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch('/read-all', authMiddleware, (req, res) => controller.markAllAsRead(req, res));

/**
 * @openapi
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.patch('/:id/read', authMiddleware, (req, res) => controller.markAsRead(req, res));

/**
 * @openapi
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted
 *       404:
 *         description: Notification not found
 */
router.delete('/:id', authMiddleware, (req, res) => controller.deleteNotification(req, res));

/**
 * @openapi
 * /api/notifications/send:
 *   post:
 *     summary: Internal endpoint — send a notification (called by other services, no auth required)
 *     tags: [Internal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, type, title, body]
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [order_placed, order_confirmed, order_preparing, order_ready, order_delivered, order_cancelled, order_rejected, payment_received, payment_refunded, review_received, cook_reply]
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               data:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *               channels:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [push, email]
 *               email:
 *                 type: string
 *                 format: email
 *               emailPayload:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification created and sent
 *       400:
 *         description: Missing required fields
 */
router.post('/send', (req, res) => controller.sendNotification(req, res));

export default router;
