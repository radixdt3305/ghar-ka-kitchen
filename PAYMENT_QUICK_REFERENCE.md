# Payment Service - Quick Reference Card

## 🚀 Quick Start
```bash
cd services/payment
npm install
npm run dev
```

## 🔑 Essential URLs
- **API**: http://localhost:5004
- **Docs**: http://localhost:5004/api-docs
- **Health**: http://localhost:5004/health

## 📝 Key Endpoints

### Create Payment
```bash
POST /api/payments/create-intent
Authorization: Bearer <token>
{
  "orderId": "order123",
  "amount": 500,
  "cookId": "cook123"
}
```

### Process Refund
```bash
POST /api/refunds/:orderId
Authorization: Bearer <token>
{
  "reason": "Order cancelled"
}
```

### Get Earnings
```bash
GET /api/payouts/earnings?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

### Trigger Payout
```bash
POST /api/payouts/trigger
Authorization: Bearer <token>
{
  "periodStart": "2024-01-01",
  "periodEnd": "2024-01-31"
}
```

## 💳 Test Cards
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## 🔧 Environment Variables
```env
PORT=5004
MONGO_URI=mongodb://localhost:27017/payment-service
JWT_SECRET=your-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PLATFORM_COMMISSION_RATE=0.15
MIN_COMMISSION=10
MIN_PAYOUT_AMOUNT=500
```

## 📊 Commission Formula
```
platformFee = max(amount × 0.15, ₹10)
cookAmount = amount - platformFee
```

## 🔄 Webhook Setup (Local)
```bash
stripe login
stripe listen --forward-to localhost:5004/api/payments/webhook
# Copy webhook secret to .env
```

## 🗄️ Database Collections
- `transactions` - Payment records
- `payouts` - Cook payouts
- `refunds` - Refund history
- `cookbankaccounts` - Stripe accounts

## 🎯 Payout Schedule
- **Frequency**: Weekly (Friday 2 AM)
- **Minimum**: ₹500
- **Method**: Stripe Transfer

## 🐛 Debug Commands
```bash
# Check service health
curl http://localhost:5004/health

# View logs
npm run dev

# Test webhook
stripe trigger payment_intent.succeeded
```

## 📱 Frontend Integration
```typescript
// Install
npm install @stripe/stripe-js @stripe/react-stripe-js

// Use
import { loadStripe } from '@stripe/stripe-js';
const stripe = await loadStripe('pk_test_...');
```

## 🔐 Auth Headers
```javascript
headers: {
  'Authorization': 'Bearer <jwt_token>',
  'Content-Type': 'application/json'
}
```

## 📈 Status Values
- **Transaction**: pending, completed, refunded, failed
- **Payout**: pending, processing, completed, failed
- **Refund**: pending, completed, failed

## 🚨 Common Errors
| Error | Solution |
|-------|----------|
| Webhook 401 | Check webhook secret |
| Payment fails | Verify Stripe keys |
| Payout fails | Complete Connect onboarding |
| Min amount error | Check ₹500 threshold |

## 📞 Support Resources
- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Docs: https://stripe.com/docs
- API Docs: http://localhost:5004/api-docs

## ⚡ Quick Commands
```bash
# Install dependencies
npm install

# Build
npm run build

# Start production
npm start

# Development
npm run dev

# Test webhook
stripe trigger payment_intent.succeeded
```

## 🎨 Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

## 🔄 Integration Flow
```
1. Create Order (Order Service)
2. Create Payment Intent (Payment Service)
3. Collect Payment (Frontend + Stripe)
4. Webhook Confirmation (Payment Service)
5. Update Order Status (Order Service)
```

---
**Version**: 1.0.0 | **Port**: 5004 | **Status**: Production Ready ✅
