import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = new Resend(env.RESEND_API_KEY);

const BRAND_COLOR = '#f97316';
const BRAND_NAME = 'Ghar Ka Kitchen';

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${BRAND_NAME}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f9fafb; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: ${BRAND_COLOR}; padding: 28px 32px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { margin: 4px 0 0; color: rgba(255,255,255,0.85); font-size: 13px; }
    .body { padding: 32px; color: #374151; line-height: 1.6; }
    .footer { background: #f3f4f6; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
    .badge { display: inline-block; background: ${BRAND_COLOR}; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .label { color: #6b7280; font-size: 14px; }
    .value { font-weight: 600; font-size: 14px; color: #111827; }
    .highlight-box { background: #fff7ed; border-left: 4px solid ${BRAND_COLOR}; padding: 16px 20px; border-radius: 6px; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #f9fafb; text-align: left; padding: 10px 12px; font-size: 13px; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
    td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f3f4f6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🍛 ${BRAND_NAME}</h1>
      <p>Homemade meals, delivered with love</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.<br />
      You are receiving this email because you have an account with us.
    </div>
  </div>
</body>
</html>
  `.trim();
}

export class EmailService {
  async sendOrderConfirmation(
    to: string,
    orderId: string,
    items: Array<{ name: string; quantity: number; price: number }>,
    totalAmount: number
  ): Promise<void> {
    const itemRows = items
      .map(
        (item) => `
      <tr>
        <td>${item.name}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">₹${item.price.toFixed(2)}</td>
        <td style="text-align:right">₹${(item.quantity * item.price).toFixed(2)}</td>
      </tr>`
      )
      .join('');

    const content = `
      <h2 style="margin-top:0; color:#111827;">Order Confirmed! 🎉</h2>
      <p>Great news! Your order has been placed successfully and the cook has been notified.</p>
      <div class="highlight-box">
        <span class="label">Order ID:</span>
        <span class="value" style="margin-left:8px;">#${orderId}</span>
      </div>
      <h3 style="color:#374151; font-size:15px;">Order Summary</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:center">Qty</th>
            <th style="text-align:right">Price</th>
            <th style="text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
      <hr class="divider" />
      <div style="text-align:right;">
        <span class="label">Total Amount:</span>
        <span style="font-size:20px; font-weight:700; color:${BRAND_COLOR}; margin-left:12px;">₹${totalAmount.toFixed(2)}</span>
      </div>
      <p style="margin-top:24px; color:#6b7280; font-size:14px;">
        You can track your order status in the app. We'll keep you updated at every step!
      </p>
    `;

    try {
      await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to,
        subject: `Order Confirmed — #${orderId} | ${BRAND_NAME}`,
        html: baseTemplate(content),
      });
      console.log(`📧 Order confirmation email sent to ${to}`);
    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error);
    }
  }

  async sendPaymentReceipt(
    to: string,
    orderId: string,
    amount: number,
    platformFee: number,
    netAmount: number
  ): Promise<void> {
    const content = `
      <h2 style="margin-top:0; color:#111827;">Payment Successful ✅</h2>
      <p>Your payment has been processed successfully. Here's your receipt.</p>
      <div class="highlight-box">
        <span class="label">Order ID:</span>
        <span class="value" style="margin-left:8px;">#${orderId}</span>
      </div>
      <hr class="divider" />
      <div class="row">
        <span class="label">Order Amount</span>
        <span class="value">₹${amount.toFixed(2)}</span>
      </div>
      <div class="row">
        <span class="label">Platform Fee</span>
        <span class="value">₹${platformFee.toFixed(2)}</span>
      </div>
      <hr class="divider" />
      <div class="row">
        <span style="font-size:16px; font-weight:700; color:#111827;">Total Paid</span>
        <span style="font-size:18px; font-weight:700; color:${BRAND_COLOR};">₹${netAmount.toFixed(2)}</span>
      </div>
      <p style="margin-top:24px; color:#6b7280; font-size:14px;">
        Keep this receipt for your records. If you have any questions, contact our support team.
      </p>
    `;

    try {
      await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to,
        subject: `Payment Receipt — #${orderId} | ${BRAND_NAME}`,
        html: baseTemplate(content),
      });
      console.log(`📧 Payment receipt email sent to ${to}`);
    } catch (error) {
      console.error('❌ Failed to send payment receipt email:', error);
    }
  }

  async sendOrderStatusUpdate(
    to: string,
    orderId: string,
    status: string,
    message: string
  ): Promise<void> {
    const statusEmojis: Record<string, string> = {
      confirmed: '✅',
      preparing: '👨‍🍳',
      ready: '📦',
      delivered: '🎉',
      cancelled: '❌',
      rejected: '🚫',
    };

    const emoji = statusEmojis[status] ?? '📋';
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

    const content = `
      <h2 style="margin-top:0; color:#111827;">Order Update ${emoji}</h2>
      <div class="highlight-box">
        <div style="margin-bottom:8px;">
          <span class="label">Order ID:</span>
          <span class="value" style="margin-left:8px;">#${orderId}</span>
        </div>
        <div>
          <span class="label">Status:</span>
          <span class="badge" style="margin-left:8px;">${statusLabel}</span>
        </div>
      </div>
      <p style="font-size:15px; color:#374151;">${message}</p>
      <p style="margin-top:24px; color:#6b7280; font-size:14px;">
        Open the app to view full order details and track your delivery in real time.
      </p>
    `;

    try {
      await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to,
        subject: `Order ${statusLabel} — #${orderId} | ${BRAND_NAME}`,
        html: baseTemplate(content),
      });
      console.log(`📧 Order status email (${status}) sent to ${to}`);
    } catch (error) {
      console.error('❌ Failed to send order status email:', error);
    }
  }

  async sendRefundNotification(
    to: string,
    orderId: string,
    amount: number
  ): Promise<void> {
    const content = `
      <h2 style="margin-top:0; color:#111827;">Refund Initiated 💰</h2>
      <p>We're sorry your order didn't work out. A refund has been initiated for your payment.</p>
      <div class="highlight-box">
        <div style="margin-bottom:8px;">
          <span class="label">Order ID:</span>
          <span class="value" style="margin-left:8px;">#${orderId}</span>
        </div>
        <div>
          <span class="label">Refund Amount:</span>
          <span style="font-size:20px; font-weight:700; color:${BRAND_COLOR}; margin-left:8px;">₹${amount.toFixed(2)}</span>
        </div>
      </div>
      <p style="font-size:14px; color:#6b7280;">
        Refunds typically reflect within <strong>5–7 business days</strong> depending on your bank or payment provider.
        If you face any issues, please reach out to our support team.
      </p>
    `;

    try {
      await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to,
        subject: `Refund Initiated — #${orderId} | ${BRAND_NAME}`,
        html: baseTemplate(content),
      });
      console.log(`📧 Refund notification email sent to ${to}`);
    } catch (error) {
      console.error('❌ Failed to send refund notification email:', error);
    }
  }
}
