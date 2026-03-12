import { Router } from "express";
import { PayoutController } from "../controllers/payout.controller.js";
import { authMiddleware, cookOnly } from "../middleware/auth.middleware.js";

const router = Router();
const payoutController = new PayoutController();

/**
 * @swagger
 * /api/payouts/connect-account:
 *   post:
 *     summary: Create Stripe Connect account for cook
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connect account created
 */
router.post("/connect-account", authMiddleware, cookOnly, (req, res) =>
  payoutController.createConnectAccount(req, res)
);

/**
 * @swagger
 * /api/payouts/earnings:
 *   get:
 *     summary: Get cook earnings summary
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Earnings summary
 */
router.get("/earnings", authMiddleware, cookOnly, (req, res) =>
  payoutController.getEarnings(req, res)
);

/**
 * @swagger
 * /api/payouts/trigger:
 *   post:
 *     summary: Trigger manual payout
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               periodStart:
 *                 type: string
 *               periodEnd:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payout processed
 */
router.post("/trigger", authMiddleware, cookOnly, (req, res) =>
  payoutController.triggerPayout(req, res)
);

/**
 * @swagger
 * /api/payouts/history:
 *   get:
 *     summary: Get payout history
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payout history
 */
router.get("/history", authMiddleware, cookOnly, (req, res) =>
  payoutController.getPayoutHistory(req, res)
);

/**
 * @swagger
 * /api/payouts/earnings/breakdown:
 *   get:
 *     summary: Get earnings breakdown by daily, weekly, monthly
 *     tags: [Payouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Earnings breakdown
 */
router.get("/earnings/breakdown", authMiddleware, cookOnly, (req, res) =>
  payoutController.getEarningsBreakdown(req, res)
);

export default router;
