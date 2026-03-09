# Payment Service Integration Guide

## Order Service Integration

### 1. Update Order Creation Flow

**File**: `services/order/src/services/order.service.ts`

Add payment intent creation after order is created:

```typescript
import axios from 'axios';

async createOrder(userId: string, cartItems: any[]) {
  // ... existing order creation logic
  
  const order = await Order.create({
    userId,
    items: cartItems,
    total: calculateTotal(cartItems),
    status: 'pending_payment'
  });

  // Create payment intent
  try {
    const paymentResponse = await axios.post(
      `${process.env.PAYMENT_SERVICE_URL}/api/payments/create-intent`,
      {
        orderId: order._id,
        amount: order.total,
        cookId: order.cookId
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return {
      order,
      clientSecret: paymentResponse.data.data.clientSecret
    };
  } catch (error) {
    // Rollback order if payment intent fails
    await Order.findByIdAndDelete(order._id);
    throw error;
  }
}
```

### 2. Handle Order Cancellation with Refund

**File**: `services/order/src/services/order.service.ts`

```typescript
async cancelOrder(orderId: string, userId: string) {
  const order = await Order.findOne({ _id: orderId, userId });
  
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status === 'completed' || order.status === 'delivered') {
    // Process refund
    try {
      await axios.post(
        `${process.env.PAYMENT_SERVICE_URL}/api/refunds/${orderId}`,
        { reason: 'Order cancelled by customer' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Refund failed:', error);
      throw new Error('Failed to process refund');
    }
  }

  order.status = 'cancelled';
  await order.save();
  
  return order;
}
```

### 3. Payment Webhook Handler

**File**: `services/order/src/controllers/order.controller.ts`

Add endpoint to receive payment confirmation:

```typescript
async handlePaymentSuccess(req: Request, res: Response) {
  const { orderId } = req.body;
  
  const order = await Order.findById(orderId);
  
  if (order) {
    order.status = 'confirmed';
    order.paymentStatus = 'paid';
    await order.save();
    
    // Emit socket event for real-time update
    io.to(order.userId).emit('order:confirmed', order);
  }
  
  res.json({ success: true });
}
```

## Frontend Integration

### 1. Install Stripe.js

```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Payment Page Component

**File**: `frontend/src/pages/PaymentPage.tsx`

```typescript
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ orderId, amount }: { orderId: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setLoading(true);
    setError('');

    try {
      // Get client secret from backend
      const { data } = await axios.post('/api/payments/create-intent', {
        orderId,
        amount,
        cookId: 'cook123' // Get from order details
      });

      const { clientSecret } = data.data;

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
      } else {
        // Payment successful
        navigate(`/orders/${orderId}/success`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': { color: '#aab7c4' },
            },
          },
        }} />
      </div>
      
      {error && <p className="text-red-500">{error}</p>}
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        {loading ? 'Processing...' : `Pay ₹${amount}`}
      </button>
    </form>
  );
}

export default function PaymentPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    // Fetch order details
    axios.get(`/api/orders/${orderId}`).then(({ data }) => {
      setOrder(data.data);
    });
  }, [orderId]);

  if (!order) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Complete Payment</h1>
      
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">Order Total</p>
        <p className="text-2xl font-bold">₹{order.total}</p>
        <p className="text-xs text-gray-500 mt-1">
          Platform fee: ₹{Math.max(order.total * 0.15, 10).toFixed(2)}
        </p>
      </div>

      <Elements stripe={stripePromise}>
        <CheckoutForm orderId={orderId!} amount={order.total} />
      </Elements>
    </div>
  );
}
```

### 3. Cook Earnings Dashboard

**File**: `frontend/src/pages/cook/EarningsDashboard.tsx`

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EarningsDashboard() {
  const [earnings, setEarnings] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch earnings
    axios.get('/api/payouts/earnings').then(({ data }) => {
      setEarnings(data.data);
    });

    // Fetch payout history
    axios.get('/api/payouts/history').then(({ data }) => {
      setPayouts(data.data);
    });
  }, []);

  const handleConnectStripe = async () => {
    const { data } = await axios.post('/api/payouts/connect-account', {
      email: 'cook@example.com'
    });
    
    // Redirect to Stripe onboarding
    window.location.href = data.data.onboardingUrl;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Earnings Dashboard</h1>

      {/* Current Earnings */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-blue-50 rounded">
          <p className="text-sm text-gray-600">Total Earnings</p>
          <p className="text-2xl font-bold">₹{earnings?.totalEarnings || 0}</p>
        </div>
        <div className="p-4 bg-red-50 rounded">
          <p className="text-sm text-gray-600">Platform Fees</p>
          <p className="text-2xl font-bold">₹{earnings?.platformFees || 0}</p>
        </div>
        <div className="p-4 bg-green-50 rounded">
          <p className="text-sm text-gray-600">Net Amount</p>
          <p className="text-2xl font-bold">₹{earnings?.netAmount || 0}</p>
        </div>
      </div>

      {/* Connect Stripe */}
      <button
        onClick={handleConnectStripe}
        className="mb-6 bg-purple-600 text-white px-4 py-2 rounded"
      >
        Connect Bank Account
      </button>

      {/* Payout History */}
      <h2 className="text-xl font-bold mb-4">Payout History</h2>
      <div className="space-y-2">
        {payouts.map((payout) => (
          <div key={payout._id} className="p-4 border rounded flex justify-between">
            <div>
              <p className="font-medium">₹{payout.netAmount}</p>
              <p className="text-sm text-gray-600">
                {new Date(payout.periodStart).toLocaleDateString()} - 
                {new Date(payout.periodEnd).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-2 py-1 rounded text-sm ${
              payout.status === 'completed' ? 'bg-green-100 text-green-800' :
              payout.status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {payout.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. Environment Variables

**File**: `frontend/.env`

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_API_URL=http://localhost:5004
```

## Testing Checklist

- [ ] Create order and receive payment intent
- [ ] Complete payment with test card
- [ ] Verify transaction recorded in database
- [ ] Cancel order and verify refund
- [ ] Setup Stripe Connect account
- [ ] View earnings dashboard
- [ ] Trigger manual payout
- [ ] Verify automated payout scheduler

## Common Issues

### Issue: Webhook not receiving events
**Solution**: Ensure Stripe CLI is running and webhook secret is correct

### Issue: Payment fails silently
**Solution**: Check browser console for Stripe errors, verify API keys

### Issue: Payout fails
**Solution**: Verify cook completed Stripe onboarding and bank account is verified
