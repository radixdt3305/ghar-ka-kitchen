import mongoose from "mongoose";
const { Schema } = mongoose;

export interface ICookBankAccount extends mongoose.Document {
  cookId: string;
  stripeAccountId: string;
  accountHolderName: string;
  bankName?: string;
  last4?: string;
  isVerified: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CookBankAccountSchema = new Schema<ICookBankAccount>(
  {
    cookId: { type: String, required: true, index: true },
    stripeAccountId: { type: String, required: true, unique: true },
    accountHolderName: { type: String, required: true },
    bankName: { type: String },
    last4: { type: String },
    isVerified: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CookBankAccount = mongoose.model<ICookBankAccount>(
  "CookBankAccount",
  CookBankAccountSchema
);
