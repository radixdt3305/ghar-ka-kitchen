import { Request, Response } from "express";
import { PaymentService } from "../services/payment.service.js";
import { stripe } from "../config/stripe.js";
import { env } from "../config/env.js";

const paymentService = new PaymentService();

export class PaymentController {
  async createPaymentIntent(req: Request, res: Response) {
    try {
      const { orderId, amount, cookId } = req.body;
      const userId = (req as any).user.userId;

      const result = await paymentService.createPaymentIntent(orderId, userId, cookId, amount);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async confirmPayment(req: Request, res: Response) {
    try {
      const { transactionId } = req.body;
      await paymentService.confirmTransaction(transactionId);
      res.json({ success: true, message: "Payment confirmed" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async handleWebhook(req: Request, res: Response) {
    const sig = req.headers["stripe-signature"];

    if (!sig || Array.isArray(sig)) {
      return res.status(400).send("Missing or invalid signature");
    }

    try {
      const event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);

      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object as any;
          await paymentService.updateTransactionStatus(paymentIntent.id, "completed");
          console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
          break;

        case "payment_intent.payment_failed":
          const failedIntent = event.data.object as any;
          await paymentService.updateTransactionStatus(failedIntent.id, "failed");
          console.log(`❌ Payment failed: ${failedIntent.id}`);
          break;
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error.message);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }

  async getTransactionByOrder(req: Request, res: Response) {
    try {
      const orderId = req.params.orderId;
      if (Array.isArray(orderId)) {
        return res.status(400).json({ success: false, message: "Invalid orderId" });
      }

      const transaction = await paymentService.getTransactionByOrderId(orderId);

      if (!transaction) {
        return res.status(404).json({ success: false, message: "Transaction not found" });
      }

      res.json({ success: true, data: transaction });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPaymentHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const transactions = await paymentService.getTransactionsByUserId(userId);

      res.json({ success: true, data: transactions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
