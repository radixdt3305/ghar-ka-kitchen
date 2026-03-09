# Payment Service

Handles payment processing, refunds, and cook payouts using Stripe.

## Features

- ✅ Stripe payment intent creation
- ✅ Webhook handling for payment events
- ✅ Automatic platform commission calculation
- ✅ Refund processing
- ✅ Stripe Connect for cook payouts
- ✅ Automated payout scheduler (daily/weekly)
- ✅ Transaction history
- ✅ Earnings dashboard for cooks

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Stripe keys:

```bash
cp .env.example .env
```

Get your Stripe keys from: https://dashboard.stripe.com/test/apikeys

### 3. Stripe Webhook Setup

For local development, use Stripe CLI:

```bash
stripe listen --forward-to localhost:5004/api/payments/webhook
```

Copy the webhook signing secret to `.env`:

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Run Service

```bash
npm run dev
```

## API Endpoints

### Payments

- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/transaction/:orderId` - Get transaction
- `GET /api/payments/history` - Payment history

### Payouts

- `POST /api/payouts/connect-account` - Create Stripe Connect account
- `GET /api/payouts/earnings` - Get cook earnings
- `POST /api/payouts/trigger` - Manual payout
- `GET /api/payouts/history` - Payout history

### Refunds

- `POST /api/refunds/:orderId` - Process refund
- `GET /api/refunds/:orderId` - Get refund status

## Commission Calculation

```
Platform Fee = max(orderTotal * 0.15, ₹10)
Cook Amount = orderTotal - platformFee
```

## Payout Schedule

- **Weekly**: Every Friday at 2 AM
- **Daily**: Every day at 2 AM
- **Minimum**: ₹500

## Swagger Documentation

http://localhost:5004/api-docs

## Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Database Collections

- `transactions` - Payment records
- `payouts` - Cook payout records
- `refunds` - Refund records
- `cookbankaccounts` - Stripe Connect accounts
