import { Router } from "express";
import { createAuthMiddleware, authorize, UserRole } from "@ghar-ka-kitchen/shared-auth";
import { env } from "../config/env.js";
import * as orderController from "../controllers/order.controller.js";

const router = Router();
const authenticate = createAuthMiddleware(env.JWT_ACCESS_SECRET);

router.use(authenticate);

/**
 * @swagger
 * /api/orders/create:
 *   post:
 *     summary: Create a new order from cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [addressId, timeSlot]
 *             properties:
 *               addressId:
 *                 type: string
 *               timeSlot:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/create", orderController.createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders for the user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Unauthorized
 */
router.get("/", orderController.getOrders);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get("/:orderId", orderController.getOrderById);

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   patch:
 *     summary: Update order status (cook only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - cook role required
 */
router.patch("/:orderId/status", authorize(UserRole.COOK), orderController.updateOrderStatus);

/**
 * @swagger
 * /api/orders/{orderId}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 *       401:
 *         description: Unauthorized
 */
router.patch("/:orderId/cancel", orderController.cancelOrder);

/**
 * @swagger
 * /api/orders/{orderId}/reject:
 *   patch:
 *     summary: Reject an order (cook only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order rejected
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - cook role required
 */
router.patch("/:orderId/reject", authorize(UserRole.COOK), orderController.rejectOrder);

export default router;
