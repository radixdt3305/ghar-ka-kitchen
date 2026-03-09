import mongoose from "mongoose";
const { Schema } = mongoose;

export interface IRefund extends mongoose.Document {
  transactionId: string;
  orderId: string;
  amount: number;
  reason: string;
  stripeRefundId: string;
  status: "pending" | "completed" | "failed";
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RefundSchema = new Schema<IRefund>(
  {
    transactionId: { type: String, required: true, index: true },
    orderId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    stripeRefundId: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

export const Refund = mongoose.model<IRefund>("Refund", RefundSchema);
