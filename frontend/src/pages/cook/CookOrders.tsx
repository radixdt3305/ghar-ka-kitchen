import { useEffect, useState } from "react";
import { orderApi, type Order, OrderStatus } from "@/api/order.api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PLACED]: "bg-blue-500",
  [OrderStatus.CONFIRMED]: "bg-green-500",
  [OrderStatus.PREPARING]: "bg-yellow-500",
  [OrderStatus.READY]: "bg-orange-500",
  [OrderStatus.DELIVERED]: "bg-gray-500",
  [OrderStatus.CANCELLED]: "bg-red-500",
};

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  [OrderStatus.PLACED]: OrderStatus.CONFIRMED,
  [OrderStatus.CONFIRMED]: OrderStatus.PREPARING,
  [OrderStatus.PREPARING]: OrderStatus.READY,
  [OrderStatus.READY]: OrderStatus.DELIVERED,
  [OrderStatus.DELIVERED]: null,
  [OrderStatus.CANCELLED]: null,
};

export default function CookOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [filter, setFilter] = useState<"active" | "all">("active");

  useEffect(() => {
    loadOrders();
    setupSocket();
    return () => {
      socket?.disconnect();
    };
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await orderApi.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders");
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
      console.log("Cook connected to order updates");
    });

    newSocket.on("order:created", (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev]);
      toast.success(`New order #${newOrder.orderId} received!`);
    });

    newSocket.on("order:statusChanged", (updatedOrder: Order) => {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === updatedOrder.orderId ? updatedOrder : o))
      );
    });

    newSocket.on("order:cancelled", (cancelledOrder: Order) => {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === cancelledOrder.orderId ? cancelledOrder : o))
      );
      toast.info(`Order #${cancelledOrder.orderId} was cancelled`);
    });

    setSocket(newSocket);
  };

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderApi.updateStatus(orderId, newStatus);
      toast.success("Order status updated");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "active") {
      return ![OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status);
    }
    return true;
  });

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kitchen Orders</h1>
        <div className="flex gap-2">
          <Button
            variant={filter === "active" ? "default" : "outline"}
            onClick={() => setFilter("active")}
            className={filter === "active" ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            Active Orders
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            All Orders
          </Button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.orderId} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Order #{order.orderId}</h3>
                  <p className="text-sm text-gray-600">
                    Placed: {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Delivery: {new Date(order.timeSlot).toLocaleString()}
                  </p>
                </div>
                <Badge className={statusColors[order.status]}>{order.status}</Badge>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Items:</h4>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-1">Delivery Address:</h4>
                <p className="text-sm text-gray-600">
                  {order.deliveryAddress.street}, {order.deliveryAddress.city} -{" "}
                  {order.deliveryAddress.pincode}
                </p>
              </div>

              {nextStatus[order.status] && (
                <Button
                  onClick={() => updateStatus(order.orderId, nextStatus[order.status]!)}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  Mark as {nextStatus[order.status]}
                </Button>
              )}

              {order.status === OrderStatus.CANCELLED && order.cancelReason && (
                <div className="mt-4 p-3 bg-red-50 rounded">
                  <p className="text-sm text-red-800">
                    <strong>Cancelled:</strong> {order.cancelReason}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
