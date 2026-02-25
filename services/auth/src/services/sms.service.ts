import twilio from "twilio";
import { env } from "../config/env.js";

export class SmsService {
  private client: twilio.Twilio | null = null;

  private getClient(): twilio.Twilio {
    if (!this.client) {
      if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
        throw new Error(
          "Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN."
        );
      }
      this.client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    }
    return this.client;
  }

  async sendOtp(phone: string, otp: string): Promise<void> {
    // If Twilio credentials are missing, fall back to console logging
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER) {
      console.log(`[DEV] OTP for +91${phone}: ${otp}`);
      return;
    }

    try {
      const client = this.getClient();
      const message = await client.messages.create({
        body: `Your Ghar Ka Kitchen verification code is: ${otp}. Valid for ${env.OTP_EXPIRY_MINUTES} minutes.`,
        from: env.TWILIO_FROM_NUMBER,
        to: `+91${phone}`,
      });

      console.log("[TWILIO] OTP sent, SID:", message.sid);
    } catch (error) {
      console.error("[TWILIO] Failed to send OTP:", error);
      console.log(`[FALLBACK] OTP for +91${phone}: ${otp}`);
    }
  }
}

export const smsService = new SmsService();
