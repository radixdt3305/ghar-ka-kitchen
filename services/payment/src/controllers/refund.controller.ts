import { Request, Response } from "express";
import { RefundService } from "../services/refund.service.js";

const refundService = new RefundService();

export class RefundController {
  async processRefund(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;
      const result = await refundService.processRefund(orderId as string, reason || "Order cancelled");
      res.json({ message: "Refund processed successfully", data: result });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
