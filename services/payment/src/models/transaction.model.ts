import mongoose from "mongoose";
const { Schema } = mongoose;

export interface ITransaction extends mongoose.Document {
  orderId: string;
  userId: string;
  cookId: string;
  amount: number;
  platformFee: number;
  cookAmount: number;
  stripePaymentIntentId: string;
  status: "pending" | "completed" | "refunded" | "failed";
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    orderId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    cookId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    cookAmount: { type: Number, required: true },
    stripePaymentIntentId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "completed", "refunded", "failed"],
      default: "pending",
    },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>("Transaction", TransactionSchema);
