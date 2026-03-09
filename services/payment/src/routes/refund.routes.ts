import { Router } from "express";
import { RefundController } from "../controllers/refund.controller.js";

const router = Router();
const refundController = new RefundController();

/**
 * @swagger
 * /api/refunds/{orderId}:
 *   post:
 *     summary: Process refund for an order
 *     tags: [Refunds]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refund processed
 */
router.post("/:orderId", (req, res) => refundController.processRefund(req, res));

export default router;
