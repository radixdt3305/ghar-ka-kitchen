export interface PaymentIntent {
  clientSecret: string;
  transactionId: string;
  amount: number;
  platformFee: number;
  cookAmount: number;
}

export interface Transaction {
  _id: string;
  orderId: string;
  userId: string;
  cookId: string;
  amount: number;
  platformFee: number;
  cookAmount: number;
  stripePaymentIntentId: string;
  status: "pending" | "completed" | "refunded" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface Earnings {
  totalEarnings: number;
  platformFees: number;
  netAmount: number;
  transactionCount: number;
}

export interface Payout {
  _id: string;
  cookId: string;
  periodStart: string;
  periodEnd: string;
  totalEarnings: number;
  platformFees: number;
  netAmount: number;
  stripeTransferId?: string;
  status: "pending" | "processing" | "completed" | "failed";
  processedAt?: string;
  createdAt: string;
}
