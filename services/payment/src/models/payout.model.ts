import mongoose from "mongoose";
const { Schema } = mongoose;

export interface IPayout extends mongoose.Document {
  cookId: string;
  periodStart: Date;
  periodEnd: Date;
  totalEarnings: number;
  platformFees: number;
  netAmount: number;
  stripeTransferId?: string;
  stripeAccountId?: string;
  status: "pending" | "processing" | "completed" | "failed";
  failureReason?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayout>(
  {
    cookId: { type: String, required: true, index: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    totalEarnings: { type: Number, required: true },
    platformFees: { type: Number, required: true },
    netAmount: { type: Number, required: true },
    stripeTransferId: { type: String },
    stripeAccountId: { type: String },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    failureReason: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

export const Payout = mongoose.model<IPayout>("Payout", PayoutSchema);
