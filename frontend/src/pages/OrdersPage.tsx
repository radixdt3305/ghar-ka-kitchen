import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { orderApi, type Order, OrderStatus } from "../api/order.api";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PLACED]: "bg-blue-500",
  [OrderStatus.CONFIRMED]: "bg-green-500",
  [OrderStatus.PREPARING]: "bg-yellow-500",
  [OrderStatus.READY]: "bg-orange-500",
  [OrderStatus.DELIVERED]: "bg-gray-500",
  [OrderStatus.CANCELLED]: "bg-red-500",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await orderApi.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
        <p className="text-gray-600">Start ordering delicious home-cooked meals!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <Card
            key={order.orderId}
            className="p-6 cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate(`/orders/${order.orderId}`)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">Order #{order.orderId}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()} at{" "}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <Badge className={statusColors[order.status]}>
                {order.status}
              </Badge>
            </div>

            <div className="space-y-1 mb-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="text-sm">
                  {item.name} x {item.quantity}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-sm text-gray-600">
                Delivery: {new Date(order.timeSlot).toLocaleString()}
              </span>
              <span className="font-bold">₹{order.totalAmount}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
