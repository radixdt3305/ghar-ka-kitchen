import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { paymentApi } from "../api/payment.api";
import { orderApi } from "../api/order.api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

function CheckoutForm({ orderId, order }: { orderId: string; order: any }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!stripe || !elements) {
      toast.error("Stripe not loaded");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const paymentIntent = await paymentApi.createPaymentIntent(
        orderId,
        order.totalAmount,
        order.kitchenId
      );

      const result = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        setError(result.error.message || "Payment failed");
        toast.error(result.error.message || "Payment failed");
      } else {
        // Payment succeeded - manually update transaction
        try {
          await paymentApi.confirmPayment(paymentIntent.transactionId);
        } catch (e) {
          console.log("Manual confirmation failed, webhook will handle it");
        }
        toast.success("Payment successful!");
        navigate(`/orders/${orderId}`);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Payment failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg bg-card">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": { color: "#aab7c4" },
              },
              invalid: { color: "#9e2146" },
            },
          }}
        />
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      <Button type="submit" disabled={!stripe || loading} className="w-full" size="lg">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ₹${order.totalAmount}`
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your payment is secured by Stripe
      </p>
    </form>
  );
}

export default function PaymentPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderApi.getOrderById(orderId!);
        const orderData = response.data?.data || response.data;
        setOrder(orderData);
      } catch (error) {
        toast.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container max-w-md mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Order not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const platformFee = Math.max((order.totalAmount || 0) * 0.15, 10);

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Complete Payment</h1>

      <div className="grid gap-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{order.totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Platform Fee (15%)</span>
                <span>₹{platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise}>
              <CheckoutForm orderId={orderId!} order={order} />
            </Elements>
          </CardContent>
        </Card>

        {/* Test Card Info */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-2">Test Card Numbers:</p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>Success: 4242 4242 4242 4242</li>
              <li>Decline: 4000 0000 0000 0002</li>
              <li>Any future date, any 3 digits CVC</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
