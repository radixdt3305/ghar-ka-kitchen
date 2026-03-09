import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { orderApi, type Order, OrderStatus } from "../api/order.api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { io, Socket } from "socket.io-client";
import { Check } from "lucide-react";

const statusSteps = [
  OrderStatus.PLACED,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.DELIVERED,
];

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PLACED]: "bg-blue-500",
  [OrderStatus.CONFIRMED]: "bg-green-500",
  [OrderStatus.PREPARING]: "bg-yellow-500",
  [OrderStatus.READY]: "bg-orange-500",
  [OrderStatus.DELIVERED]: "bg-gray-500",
  [OrderStatus.CANCELLED]: "bg-red-500",
};

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadOrder();
    setupSocket();
    return () => {
      socket?.disconnect();
    };
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const { data } = await orderApi.getOrderById(orderId!);
      setOrder(data);
    } catch (error) {
      console.error("Failed to load order:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    const token = localStorage.getItem("accessToken");
    const newSocket = io("http://localhost:5003", {
      auth: { token },
    });

    newSocket.on("connect", () => {
      newSocket.emit("join:order", orderId);
    });

    newSocket.on("order:statusChanged", (updatedOrder: Order) => {
      setOrder(updatedOrder);
    });

    newSocket.on("order:cancelled", (updatedOrder: Order) => {
      setOrder(updatedOrder);
    });

    setSocket(newSocket);
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    try {
      const { data } = await orderApi.cancelOrder(orderId!, cancelReason);
      setOrder(data);
      alert(
        "Order cancelled successfully!\n\n" +
        "✅ Refund has been initiated\n" +
        "💰 Amount: ₹" + order?.totalAmount + "\n" +
        "⏱️ Refund will be credited to your original payment method within 5-7 business days\n\n" +
        "You can check the refund status in your Transaction History."
      );
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to cancel order");
    }
  };

  const canCancel = () => {
    if (!order) return false;
    if (![OrderStatus.PLACED, OrderStatus.CONFIRMED].includes(order.status)) return false;
    const timeSincePlaced = Date.now() - new Date(order.createdAt).getTime();
    return timeSincePlaced <= 15 * 60 * 1000;
  };

  if (loading) return <div className="p-8 text-center">Loading order...</div>;
  if (!order) return <div className="p-8 text-center">Order not found</div>;

  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button variant="outline" onClick={() => navigate("/orders")} className="mb-6">
        ← Back to Orders
      </Button>

      <Card className="p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.orderId}</h1>
            <p className="text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <Badge className={statusColors[order.status]}>{order.status}</Badge>
        </div>

        {order.status !== OrderStatus.CANCELLED && (
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {statusSteps.map((status, idx) => (
                <div key={status} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        idx <= currentStepIndex ? "bg-green-500 text-white" : "bg-gray-300"
                      }`}
                    >
                      {idx < currentStepIndex ? <Check className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span className="text-xs mt-2 text-center">{status}</span>
                  </div>
                  {idx < statusSteps.length - 1 && (
                    <div
                      className={`h-1 flex-1 ${
                        idx < currentStepIndex ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Items</h3>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between py-2">
                <span>{item.name} x {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Delivery Address</h3>
            <p className="text-gray-600">
              {order.deliveryAddress.label}<br />
              {order.deliveryAddress.street}<br />
              {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Delivery Time</h3>
            <p className="text-gray-600">{new Date(order.timeSlot).toLocaleString()}</p>
          </div>

          {order.cancelReason && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2 text-red-600">Cancellation Reason</h3>
              <p className="text-gray-600">{order.cancelReason}</p>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">✅ Refund Initiated</h4>
                <p className="text-sm text-blue-800">
                  💰 Amount: ₹{order.totalAmount}<br />
                  ⏱️ Your refund will be credited to your original payment method within 5-7 business days.<br />
                  📊 Check <a href="/transactions" className="underline font-medium">Transaction History</a> for refund status.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {canCancel() && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Cancel Order</h3>
          <textarea
            className="w-full p-2 border rounded mb-4"
            rows={3}
            placeholder="Reason for cancellation..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <Button variant="destructive" onClick={handleCancel}>
            Cancel Order
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            You can cancel within 15 minutes of placing the order
          </p>
        </Card>
      )}
    </div>
  );
}
