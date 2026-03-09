import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();
const paymentController = new PaymentController();

/**
 * @swagger
 * /api/payments/create-intent:
 *   post:
 *     summary: Create payment intent for order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *               cookId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment intent created
 */
router.post("/create-intent", authMiddleware, (req, res) =>
  paymentController.createPaymentIntent(req, res)
);

/**
 * @swagger
 * /api/payments/confirm:
 *   post:
 *     summary: Manually confirm payment (for testing)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment confirmed
 */
router.post("/confirm", authMiddleware, (req, res) =>
  paymentController.confirmPayment(req, res)
);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Stripe webhook handler
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post("/webhook", (req, res) => paymentController.handleWebhook(req, res));

/**
 * @swagger
 * /api/payments/transaction/{orderId}:
 *   get:
 *     summary: Get transaction by order ID
 *     tags: [Payments]
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
 *         description: Transaction details
 */
router.get("/transaction/:orderId", authMiddleware, (req, res) =>
  paymentController.getTransactionByOrder(req, res)
);

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Get user payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment history
 */
router.get("/history", authMiddleware, (req, res) =>
  paymentController.getPaymentHistory(req, res)
);

export default router;
