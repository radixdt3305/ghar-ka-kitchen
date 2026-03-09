import { stripe } from "../config/stripe.js";
import { env } from "../config/env.js";
import { Transaction } from "../models/transaction.model.js";

export class PaymentService {
  async createPaymentIntent(orderId: string, userId: string, cookId: string, amount: number) {
    const platformFee = Math.max(amount * env.PLATFORM_COMMISSION_RATE, env.MIN_COMMISSION);
    const cookAmount = amount - platformFee;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: "inr",
      metadata: {
        orderId,
        userId,
        cookId,
        platformFee: platformFee.toString(),
        cookAmount: cookAmount.toString(),
      },
    });

    const transaction = await Transaction.create({
      orderId,
      userId,
      cookId,
      amount,
      platformFee,
      cookAmount,
      stripePaymentIntentId: paymentIntent.id,
      status: "pending",
    });

    return {
      clientSecret: paymentIntent.client_secret,
      transactionId: transaction._id,
      amount,
      platformFee,
      cookAmount,
    };
  }

  async getTransactionByOrderId(orderId: string) {
    return await Transaction.findOne({ orderId });
  }

  async getTransactionsByUserId(userId: string) {
    return await Transaction.find({ userId }).sort({ createdAt: -1 });
  }

  async updateTransactionStatus(paymentIntentId: string, status: "completed" | "failed") {
    return await Transaction.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      { status },
      { new: true }
    );
  }

  async confirmTransaction(transactionId: string) {
    return await Transaction.findByIdAndUpdate(
      transactionId,
      { status: "completed" },
      { new: true }
    );
  }
}
