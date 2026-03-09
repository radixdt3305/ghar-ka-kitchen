import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { cartApi, type Cart } from "../api/cart.api";
import { orderApi } from "../api/order.api";
import { userApi } from "../api/user.api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cartRes, userRes] = await Promise.all([
        cartApi.getCart(),
        userApi.getProfile(),
      ]);
      setCart(cartRes.data);
      const userData = userRes.data.data;
      const addrs = userData?.addresses || [];
      setAddresses(addrs);
      const defaultIdx = addrs.findIndex((a: any) => a.isDefault);
      if (defaultIdx >= 0) {
        setSelectedAddress(addrs[defaultIdx]._id || `addr-${defaultIdx}`);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }
    if (!timeSlot) {
      alert("Please select a time slot");
      return;
    }

    setLoading(true);
    try {
      const { data } = await orderApi.createOrder(selectedAddress, timeSlot);
      // Redirect to payment page
      navigate(`/payment/${data.orderId}`);
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const getMinTimeSlot = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    return now.toISOString().slice(0, 16);
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="p-8 text-center">
        <p>Your cart is empty</p>
        <Button onClick={() => navigate("/discover")} className="mt-4">
          Browse Dishes
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
          {addresses.length === 0 ? (
            <p className="text-gray-600">No addresses found. Please add an address in your profile.</p>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr, idx) => {
                const addrKey = addr._id || `addr-${idx}`;
                return (
                  <div
                    key={addrKey}
                    className={`flex items-start space-x-2 p-3 border rounded cursor-pointer ${
                      selectedAddress === addrKey ? "border-orange-500 bg-orange-50" : ""
                    }`}
                    onClick={() => setSelectedAddress(addrKey)}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addrKey}
                      checked={selectedAddress === addrKey}
                      onChange={() => setSelectedAddress(addrKey)}
                      className="mt-1 h-4 w-4 text-orange-500"
                    />
                    <Label className="flex-1 cursor-pointer">
                      <div className="font-semibold">{addr.label}</div>
                      <div className="text-sm text-gray-600">
                        {addr.street}, {addr.city} - {addr.pincode}
                      </div>
                    </Label>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Time Slot</h2>
          <input
            type="datetime-local"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            min={getMinTimeSlot()}
            className="w-full p-2 border rounded"
          />
          <p className="text-sm text-gray-600 mt-2">
            Select a time at least 2 hours from now
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {cart.items.map((item) => (
              <div key={item.dishId} className="flex justify-between">
                <span>{item.name} x {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span>₹{cart.totalAmount}</span>
          </div>
        </Card>

        <Button
          className="w-full"
          size="lg"
          onClick={handlePlaceOrder}
          disabled={loading || !selectedAddress || !timeSlot}
        >
          {loading ? "Placing Order..." : "Place Order"}
        </Button>
      </div>
    </div>
  );
}
