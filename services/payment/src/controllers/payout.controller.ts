import { Request, Response } from "express";
import { PayoutService } from "../services/payout.service.js";

const payoutService = new PayoutService();

export class PayoutController {
  async createConnectAccount(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const cookId = (req as any).user.userId;

      const result = await payoutService.createConnectAccount(cookId, email);

      res.json({
        success: true,
        data: result,
        message: "Complete onboarding to receive payouts",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getEarnings(req: Request, res: Response) {
    try {
      const cookId = (req as any).user.userId;
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const earnings = await payoutService.calculateCookEarnings(cookId, start, end);

      res.json({ success: true, data: earnings });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async triggerPayout(req: Request, res: Response) {
    try {
      const cookId = (req as any).user.userId;
      const { periodStart, periodEnd } = req.body;

      const result = await payoutService.processPayout(
        cookId,
        new Date(periodStart),
        new Date(periodEnd)
      );

      res.json({
        success: true,
        data: result,
        message: "Payout processed successfully",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPayoutHistory(req: Request, res: Response) {
    try {
      const cookId = (req as any).user.userId;
      const payouts = await payoutService.getPayoutHistory(cookId);

      res.json({ success: true, data: payouts });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getEarningsBreakdown(req: Request, res: Response) {
    try {
      const cookId = (req as any).user.userId;
      const breakdown = await payoutService.getEarningsBreakdown(cookId);

      res.json({ success: true, data: breakdown });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
