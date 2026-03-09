# Week 6 - Payment Service Implementation

## ✅ Completed Features

### 1. Payment Processing
- ✅ Stripe payment intent creation
- ✅ Platform commission calculation (15% or min ₹10)
- ✅ Webhook handling for payment events
- ✅ Transaction recording and history
- ✅ Payment status tracking

### 2. Refund System
- ✅ Automatic refund processing
- ✅ Refund status tracking
- ✅ Integration with order cancellation

### 3. Cook Payout System
- ✅ Stripe Connect account creation
- ✅ Earnings calculation and aggregation
- ✅ Automated payout scheduler (daily/weekly)
- ✅ Manual payout trigger
- ✅ Payout history tracking
- ✅ Minimum payout threshold (₹500)

### 4. Database Models
- ✅ Transaction model
- ✅ Payout model
- ✅ Refund model
- ✅ CookBankAccount model

### 5. API Endpoints
- ✅ Payment intent creation
- ✅ Webhook handler
- ✅ Transaction retrieval
- ✅ Payment history
- ✅ Connect account setup
- ✅ Earnings dashboard
- ✅ Payout trigger
- ✅ Refund processing

### 6. Documentation
- ✅ Swagger API documentation
- ✅ README with setup instructions
- ✅ Environment configuration

## 📁 Project Structure

```
services/payment/
├── src/
│   ├── config/
│   │   ├── db.ts
│   │   ├── env.ts
│   │   ├── stripe.ts
│   │   └── swagger.ts
│   ├── controllers/
│   │   ├── payment.controller.ts
│   │   ├── payout.controller.ts
│   │   └── refund.controller.ts
│   ├── models/
│   │   ├── transaction.model.ts
│   │   ├── payout.model.ts
│   │   ├── refund.model.ts
│   │   └── cook-bank-account.model.ts
│   ├── services/
│   │   ├── payment.service.ts
│   │   ├── payout.service.ts
│   │   └── refund.service.ts
│   ├── routes/
│   │   ├── payment.routes.ts
│   │   ├── payout.routes.ts
│   │   ├── refund.routes.ts
│   │   └── index.ts
│   ├── middleware/
│   │   └── auth.middleware.ts
│   ├── utils/
│   │   └── payout-scheduler.ts
│   └── index.ts
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd services/payment
npm install
```

### 2. Configure Stripe

1. Create a Stripe account: https://dashboard.stripe.com/register
2. Get your API keys from: https://dashboard.stripe.com/test/apikeys
3. Update `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 3. Setup Webhook (Local Development)

Install Stripe CLI:
```bash
stripe login
stripe listen --forward-to localhost:5004/api/payments/webhook
```

Copy the webhook secret to `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Run Service

```bash
npm run dev
```

## 🔄 Payment Flow

### Customer Payment
1. Customer creates order
2. Frontend calls `/api/payments/create-intent`
3. Backend creates Stripe PaymentIntent
4. Returns `clientSecret` to frontend
5. Frontend uses Stripe.js to collect payment
6. Stripe sends webhook on success/failure
7. Backend updates transaction status

### Commission Calculation
```typescript
platformFee = max(orderTotal * 0.15, 10)
cookAmount = orderTotal - platformFee
```

### Payout Flow
1. Automated scheduler runs (weekly/daily)
2. Calculates cook earnings for period
3. Checks minimum threshold (₹500)
4. Creates Stripe Transfer to cook's account
5. Records payout in database
6. Notifies cook

## 🧪 Testing

### Test Cards (Stripe)
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### Test Scenarios

1. **Successful Payment**
```bash
POST /api/payments/create-intent
{
  "orderId": "order123",
  "amount": 500,
  "cookId": "cook123"
}
```

2. **Refund**
```bash
POST /api/refunds/order123
{
  "reason": "Order cancelled"
}
```

3. **Cook Earnings**
```bash
GET /api/payouts/earnings?startDate=2024-01-01&endDate=2024-01-31
```

4. **Manual Payout**
```bash
POST /api/payouts/trigger
{
  "periodStart": "2024-01-01",
  "periodEnd": "2024-01-31"
}
```

## 📊 Database Collections

### transactions
```javascript
{
  orderId: "order123",
  userId: "user123",
  cookId: "cook123",
  amount: 500,
  platformFee: 75,
  cookAmount: 425,
  stripePaymentIntentId: "pi_xxx",
  status: "completed",
  createdAt: Date,
  updatedAt: Date
}
```

### payouts
```javascript
{
  cookId: "cook123",
  periodStart: Date,
  periodEnd: Date,
  totalEarnings: 5000,
  platformFees: 750,
  netAmount: 4250,
  stripeTransferId: "tr_xxx",
  status: "completed",
  processedAt: Date
}
```

## 🔐 Security Features

- ✅ JWT authentication
- ✅ Stripe webhook signature verification
- ✅ Role-based access (cook-only endpoints)
- ✅ Idempotency for payments
- ✅ Encrypted Stripe keys

## 📈 Next Steps (Frontend Integration)

### 1. Payment Page Component
```typescript
// Use @stripe/react-stripe-js
import { Elements, CardElement } from '@stripe/react-stripe-js';
```

### 2. Cook Dashboard
- Earnings summary
- Payout history
- Bank account management

### 3. Admin Panel
- Revenue analytics
- Transaction monitoring
- Commission configuration

## 🐛 Troubleshooting

### Webhook Not Receiving Events
- Check Stripe CLI is running
- Verify webhook secret in `.env`
- Check firewall settings

### Payout Fails
- Verify cook has completed Stripe Connect onboarding
- Check minimum payout amount
- Verify bank account is verified

### Payment Intent Creation Fails
- Check Stripe API keys
- Verify amount is positive
- Check network connectivity

## 📚 API Documentation

Full API docs available at: `http://localhost:5004/api-docs`

## 🎯 Key Metrics

- **Commission Rate**: 15%
- **Minimum Commission**: ₹10
- **Minimum Payout**: ₹500
- **Payout Schedule**: Weekly (Friday 2 AM)

## ✨ Production Checklist

- [ ] Replace test Stripe keys with live keys
- [ ] Setup production webhook endpoint
- [ ] Configure SSL for webhook endpoint
- [ ] Setup monitoring and alerts
- [ ] Enable database backups
- [ ] Configure rate limiting
- [ ] Setup error tracking (Sentry)
- [ ] Load test payment flow
- [ ] Document disaster recovery plan
