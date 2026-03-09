# 🚀 Payment Service - Getting Started (5 Minutes)

## Step 1: Install Dependencies (1 min)
```bash
cd services/payment
npm install
```

## Step 2: Get Stripe Keys (2 min)

### Option A: Use Test Keys (Recommended for Development)
1. Go to: https://dashboard.stripe.com/register
2. Sign up for free account
3. Go to: https://dashboard.stripe.com/test/apikeys
4. Copy your keys

### Option B: Skip Stripe (Use Placeholders)
Just use the example values in `.env` - you can add real keys later

## Step 3: Configure Environment (30 sec)
The `.env` file is already created! Just update these two lines if you have Stripe keys:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

Everything else works with defaults!

## Step 4: Start Service (30 sec)
```bash
npm run dev
```

You should see:
```
💳 Payment service running on port 5004
📚 Swagger docs at http://localhost:5004/api-docs
✅ MongoDB connected (Payment Service)
📅 Payout scheduler initialized (weekly)
```

## Step 5: Test It! (1 min)

### Check Health
Open browser: http://localhost:5004/health

Should see:
```json
{
  "status": "ok",
  "service": "payment"
}
```

### View API Docs
Open browser: http://localhost:5004/api-docs

You'll see all 13 endpoints documented!

---

## 🎉 That's It! You're Ready!

### What You Can Do Now:

1. **Test Payment Intent Creation**
   - Use Swagger UI at `/api-docs`
   - Try the `POST /api/payments/create-intent` endpoint
   - Use test data:
     ```json
     {
       "orderId": "test123",
       "amount": 500,
       "cookId": "cook123"
     }
     ```

2. **View Database**
   - MongoDB Compass: `mongodb://localhost:27017/payment-service`
   - Collections will be created automatically on first use

3. **Setup Webhooks (Optional - For Full Testing)**
   ```bash
   # In a new terminal
   stripe login
   stripe listen --forward-to localhost:5004/api/payments/webhook
   ```

---

## 🧪 Quick Test Scenarios

### Test 1: Create Payment Intent
```bash
curl -X POST http://localhost:5004/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "orderId": "order123",
    "amount": 500,
    "cookId": "cook123"
  }'
```

### Test 2: Check Transaction
```bash
curl http://localhost:5004/api/payments/transaction/order123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test 3: Get Earnings
```bash
curl http://localhost:5004/api/payouts/earnings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📚 Next Steps

1. **Read Full Documentation**
   - [WEEK6_IMPLEMENTATION.md](./WEEK6_IMPLEMENTATION.md) - Complete guide
   - [PAYMENT_QUICK_REFERENCE.md](./PAYMENT_QUICK_REFERENCE.md) - Quick reference

2. **Integrate with Frontend**
   - [PAYMENT_INTEGRATION_GUIDE.md](./PAYMENT_INTEGRATION_GUIDE.md) - Frontend examples

3. **Deploy to Production**
   - [PAYMENT_DEPLOYMENT_CHECKLIST.md](./PAYMENT_DEPLOYMENT_CHECKLIST.md) - Deployment guide

---

## 🐛 Troubleshooting

### Service Won't Start
- **Check MongoDB**: Make sure MongoDB is running
- **Check Port**: Make sure port 5004 is not in use
- **Check Dependencies**: Run `npm install` again

### Can't Connect to MongoDB
- **Start MongoDB**: `mongod` or start MongoDB service
- **Check URI**: Verify `MONGO_URI` in `.env`

### Stripe Errors
- **Use Test Mode**: You don't need real Stripe keys for development
- **Check Keys**: Make sure keys start with `sk_test_` and `pk_test_`

---

## 💡 Pro Tips

1. **Use Swagger UI** - It's the easiest way to test APIs
2. **Check Logs** - The terminal shows helpful debug info
3. **MongoDB Compass** - Great for viewing database records
4. **Postman Collection** - Import from Swagger for easier testing

---

## 🎯 Success Checklist

- [ ] Service starts without errors
- [ ] Health endpoint responds
- [ ] Swagger docs load
- [ ] MongoDB connection successful
- [ ] Can create payment intent (via Swagger)
- [ ] Database collections created

---

## 📞 Need Help?

- **Swagger Docs**: http://localhost:5004/api-docs
- **Full Guide**: [WEEK6_IMPLEMENTATION.md](./WEEK6_IMPLEMENTATION.md)
- **Quick Reference**: [PAYMENT_QUICK_REFERENCE.md](./PAYMENT_QUICK_REFERENCE.md)

---

**🎉 Congratulations! Your payment service is running!**

Now you can:
- Process payments
- Handle refunds
- Manage cook payouts
- Track transactions

All with just 5 minutes of setup! 🚀
