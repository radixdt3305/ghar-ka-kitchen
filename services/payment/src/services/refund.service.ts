import { stripe } from "../config/stripe.js";
import { Transaction } from "../models/transaction.model.js";

export class RefundService {
  async processRefund(orderId: string, reason: string) {
    const transaction = await Transaction.findOne({ orderId });
    if (!transaction) throw new Error("Transaction not found");

    if (transaction.status === "refunded") {
      throw new Error("Transaction already refunded");
    }

    if (transaction.status !== "completed") {
      throw new Error("Can only refund completed transactions");
    }

    const refund = await stripe.refunds.create({
      payment_intent: transaction.stripePaymentIntentId,
      reason: "requested_by_customer",
      metadata: { orderId, reason },
    });

    transaction.status = "refunded";
    transaction.metadata = { ...transaction.metadata, refundId: refund.id, refundReason: reason };
    await transaction.save();

    return { transaction, refund };
  }
}
