import { stripe } from "../config/stripe.js";
import { env } from "../config/env.js";
import { Transaction } from "../models/transaction.model.js";
import { Payout } from "../models/payout.model.js";
import { CookBankAccount } from "../models/cook-bank-account.model.js";

export class PayoutService {
  async createConnectAccount(cookId: string, email: string) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "IN",
      email,
      capabilities: {
        transfers: { requested: true },
      },
    });

    await CookBankAccount.create({
      cookId,
      stripeAccountId: account.id,
      accountHolderName: email,
      isVerified: false,
      isDefault: true,
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${env.KITCHEN_SERVICE_URL}/payouts/refresh`,
      return_url: `${env.KITCHEN_SERVICE_URL}/payouts/success`,
      type: "account_onboarding",
    });

    return { accountId: account.id, onboardingUrl: accountLink.url };
  }

  async calculateCookEarnings(cookId: string, startDate: Date, endDate: Date) {
    const transactions = await Transaction.find({
      cookId,
      status: "completed",
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const totalEarnings = transactions.reduce((sum, t) => sum + t.amount, 0);
    const platformFees = transactions.reduce((sum, t) => sum + t.platformFee, 0);
    const netAmount = transactions.reduce((sum, t) => sum + t.cookAmount, 0);

    return { totalEarnings, platformFees, netAmount, transactionCount: transactions.length };
  }

  async processPayout(cookId: string, periodStart: Date, periodEnd: Date) {
    const earnings = await this.calculateCookEarnings(cookId, periodStart, periodEnd);

    if (earnings.netAmount < env.MIN_PAYOUT_AMOUNT) {
      throw new Error(`Minimum payout amount is ₹${env.MIN_PAYOUT_AMOUNT}`);
    }

    const bankAccount = await CookBankAccount.findOne({ cookId, isDefault: true, isVerified: true });
    
    if (!bankAccount) {
      throw new Error("No verified bank account found");
    }

    const payout = await Payout.create({
      cookId,
      periodStart,
      periodEnd,
      totalEarnings: earnings.totalEarnings,
      platformFees: earnings.platformFees,
      netAmount: earnings.netAmount,
      stripeAccountId: bankAccount.stripeAccountId,
      status: "processing",
    });

    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(earnings.netAmount * 100),
        currency: "inr",
        destination: bankAccount.stripeAccountId,
        metadata: { payoutId: payout._id.toString(), cookId },
      });

      await Payout.findByIdAndUpdate(payout._id, {
        stripeTransferId: transfer.id,
        status: "completed",
        processedAt: new Date(),
      });

      return { ...payout.toObject(), stripeTransferId: transfer.id, status: "completed" };
    } catch (error: any) {
      await Payout.findByIdAndUpdate(payout._id, {
        status: "failed",
        failureReason: error.message,
      });
      throw error;
    }
  }

  async getPayoutHistory(cookId: string) {
    return await Payout.find({ cookId }).sort({ createdAt: -1 });
  }

  async getEarningsBreakdown(cookId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
    const twelveMonthsAgo = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);

    // Daily breakdown (last 30 days)
    const dailyData = await Transaction.aggregate([
      {
        $match: {
          cookId,
          status: "completed",
          createdAt: { $gte: thirtyDaysAgo, $lte: now }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$amount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Weekly breakdown (last 12 weeks)
    const weeklyData = await Transaction.aggregate([
      {
        $match: {
          cookId,
          status: "completed",
          createdAt: { $gte: twelveWeeksAgo, $lte: now }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" }
          },
          amount: { $sum: "$amount" },
          orders: { $sum: 1 },
          weekStart: { $min: "$createdAt" }
        }
      },
      { $sort: { "_id.year": -1, "_id.week": -1 } }
    ]);

    // Monthly breakdown (last 12 months)
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          cookId,
          status: "completed",
          createdAt: { $gte: twelveMonthsAgo, $lte: now }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          amount: { $sum: "$amount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    return {
      daily: dailyData.map(d => ({ date: d._id, amount: d.amount, orders: d.orders })),
      weekly: weeklyData.map(w => ({ 
        week: w.weekStart.toISOString().split('T')[0], 
        amount: w.amount, 
        orders: w.orders 
      })),
      monthly: monthlyData.map(m => ({ month: m._id, amount: m.amount, orders: m.orders }))
    };
  }
}
