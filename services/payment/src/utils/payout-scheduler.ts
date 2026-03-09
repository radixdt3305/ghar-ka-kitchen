import cron from "node-cron";
import { PayoutService } from "../services/payout.service.js";
import { CookBankAccount } from "../models/cook-bank-account.model.js";
import { env } from "../config/env.js";

const payoutService = new PayoutService();

export function initPayoutScheduler() {
  // Run every Friday at 2 AM (for weekly payouts)
  const schedule = env.PAYOUT_SCHEDULE === "daily" ? "0 2 * * *" : "0 2 * * 5";

  cron.schedule(schedule, async () => {
    console.log("🔄 Running automated payout job...");

    try {
      const cooks = await CookBankAccount.find({ isVerified: true, isDefault: true }).distinct("cookId");

      const now = new Date();
      const periodEnd = new Date(now.setHours(0, 0, 0, 0));
      const periodStart = new Date(periodEnd);
      
      if (env.PAYOUT_SCHEDULE === "weekly") {
        periodStart.setDate(periodStart.getDate() - 7);
      } else {
        periodStart.setDate(periodStart.getDate() - 1);
      }

      for (const cookId of cooks) {
        try {
          const earnings = await payoutService.calculateCookEarnings(cookId, periodStart, periodEnd);

          if (earnings.netAmount >= env.MIN_PAYOUT_AMOUNT) {
            await payoutService.processPayout(cookId, periodStart, periodEnd);
            console.log(`✅ Payout processed for cook ${cookId}: ₹${earnings.netAmount}`);
          } else {
            console.log(`⏭️ Skipping cook ${cookId}: Below minimum (₹${earnings.netAmount})`);
          }
        } catch (error: any) {
          console.error(`❌ Payout failed for cook ${cookId}:`, error.message);
        }
      }

      console.log("✅ Automated payout job completed");
    } catch (error) {
      console.error("❌ Payout job error:", error);
    }
  });

  console.log(`📅 Payout scheduler initialized (${env.PAYOUT_SCHEDULE})`);
}
