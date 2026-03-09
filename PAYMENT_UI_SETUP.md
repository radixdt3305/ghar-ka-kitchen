# Payment UI - Setup Guide

## ✅ What Was Implemented

### Pages Created (3 new pages)
1. **PaymentPage** - Stripe card payment with order summary
2. **CookEarnings** - Cook earnings dashboard with payout history
3. **TransactionHistoryPage** - User payment transaction history

### API Integration
- `payment.api.ts` - Payment service API client
- `payment.types.ts` - TypeScript types for payment data

### Routes Added
- `/payment/:orderId` - Payment page
- `/transactions` - Transaction history
- `/cook/earnings` - Cook earnings dashboard

---

## 🚀 Quick Setup (2 Steps)

### Step 1: Add Stripe Publishable Key

Edit `frontend/.env`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51QdYYYP...
```

Get your key from: https://dashboard.stripe.com/test/apikeys

### Step 2: Start Frontend

```bash
cd frontend
npm run dev
```

---

## 🧪 Testing Flow

### 1. Create Order
1. Browse dishes at `/discover`
2. Add items to cart
3. Go to `/checkout`
4. Select address and time
5. Click "Place Order"

### 2. Make Payment
1. You'll be redirected to `/payment/:orderId`
2. Enter test card: `4242 4242 4242 4242`
3. Any future date, any 3-digit CVC
4. Click "Pay"
5. Success! Redirected to order details

### 3. View Transactions
- Go to `/transactions` to see payment history

### 4. Cook Earnings (For Cooks)
- Go to `/cook/earnings`
- View earnings summary
- Connect bank account
- See payout history

---

## 📱 UI Components

### Payment Page Features
- ✅ Order summary with items
- ✅ Platform fee breakdown (15%)
- ✅ Stripe card input (secure)
- ✅ Test card information
- ✅ Loading states
- ✅ Error handling

### Cook Earnings Features
- ✅ Total earnings card
- ✅ Platform fees card
- ✅ Net amount card
- ✅ Payout history list
- ✅ Connect Stripe button
- ✅ Status badges

### Transaction History Features
- ✅ Transaction list
- ✅ Amount breakdown
- ✅ Status badges
- ✅ Date and time
- ✅ Transaction IDs

---

## 🎨 UI Screenshots

### Payment Page
```
┌─────────────────────────────────────┐
│  Complete Payment                   │
├─────────────────────────────────────┤
│  Order Summary                      │
│  • Dish 1 x 2        ₹200          │
│  • Dish 2 x 1        ₹150          │
│  ─────────────────────────────      │
│  Subtotal            ₹350          │
│  Platform Fee (15%)  ₹52.50        │
│  Total               ₹350          │
├─────────────────────────────────────┤
│  Payment Details                    │
│  [Card Number Input]                │
│  [Expiry] [CVC]                     │
│  [Pay ₹350]                         │
└─────────────────────────────────────┘
```

### Cook Earnings
```
┌─────────────────────────────────────┐
│  Earnings Dashboard                 │
├─────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │₹5000 │ │-₹750 │ │₹4250 │        │
│  │Total │ │Fees  │ │Net   │        │
│  └──────┘ └──────┘ └──────┘        │
├─────────────────────────────────────┤
│  Payout History                     │
│  • ₹4250  [Completed]               │
│    Jan 1 - Jan 7                    │
│  • ₹3800  [Processing]              │
│    Jan 8 - Jan 14                   │
└─────────────────────────────────────┘
```

---

## 🔗 Navigation Links

Add these to your navbar for easy access:

```tsx
// For all users
<Link to="/transactions">Transactions</Link>

// For cooks only
<Link to="/cook/earnings">Earnings</Link>
```

---

## ⚠️ Important Notes

1. **Stripe Key Required**: Add `VITE_STRIPE_PUBLISHABLE_KEY` to `.env`
2. **Test Mode**: Use test cards only (4242 4242 4242 4242)
3. **Order Flow**: Checkout → Payment → Order Details
4. **Cook Access**: Earnings page requires cook role

---

## 🐛 Troubleshooting

### "Stripe is not defined"
- Check `.env` has `VITE_STRIPE_PUBLISHABLE_KEY`
- Restart dev server after adding env variable

### Payment fails
- Use test card: 4242 4242 4242 4242
- Check backend payment service is running (port 5004)
- Verify JWT token is valid

### Can't see earnings
- Make sure user role is "cook"
- Check backend `/api/payouts/earnings` endpoint

---

## 📚 Files Created

```
frontend/src/
├── api/
│   └── payment.api.ts          ✅ Payment API client
├── types/
│   └── payment.types.ts        ✅ Payment types
├── pages/
│   ├── PaymentPage.tsx         ✅ Payment page
│   ├── TransactionHistoryPage.tsx ✅ Transaction history
│   └── cook/
│       └── CookEarnings.tsx    ✅ Cook earnings
└── routes/
    └── index.tsx               ✅ Updated routes
```

---

## ✨ Next Steps

1. **Add to Navbar**: Link to transactions and earnings
2. **Customize Styling**: Match your brand colors
3. **Add Notifications**: Toast messages for success/error
4. **Production**: Replace test Stripe key with live key

---

**🎉 Payment UI is Ready!**

Test the complete flow:
1. Create order → 2. Make payment → 3. View transaction → 4. Check earnings (cook)
