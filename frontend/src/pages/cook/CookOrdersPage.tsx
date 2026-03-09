import { useEffect, useState } from "react";
import { orderApi, type Order, OrderStatus } from "@/api/order.api";
import { kitchenApi } from "@/api/kitchen.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, ChevronRight, X } from "lucide-react";
import { io, Socket } from "socket.io-client";

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PLACED]: "bg-blue-500",
  [OrderStatus.CONFIRMED]: "bg-green-500",
  [OrderStatus.PREPARING]: "bg-yellow-500",
  [OrderStatus.READY]: "bg-orange-500",
  [OrderStatus.DELIVERED]: "bg-gray-500",
  [OrderStatus.CANCELLED]: "bg-red-500",
  [OrderStatus.REJECTED]: "bg-red-600",
};

const NEXT_STATUS: Partial<Record<OrderStatus, { label: string; status: OrderStatus }>> = {
  [OrderStatus.PLACED]: { label: "Confirm Order", status: OrderStatus.CONFIRMED },
  [OrderStatus.CONFIRMED]: { label: "Start Preparing", status: OrderStatus.PREPARING },
  [OrderStatus.PREPARING]: { label: "Mark Ready", status: OrderStatus.READY },
  [OrderStatus.READY]: { label: "Mark Delivered", status: OrderStatus.DELIVERED },
};

export function CookOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"active" | "all">("active");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [kitchenId, setKitchenId] = useState<string | null>(null);

  useEffect(() => {
    loadKitchenAndOrders();
  }, []);

  useEffect(() => {
    if (kitchenId && !socket) {
      setupSocket();
    }
    return () => {
      socket?.disconnect();
    };
  }, [kitchenId]);

  const setupSocket = () => {
    const token = localStorage.getItem("accessToken");
    const newSocket = io("http://localhost:5003", {
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("Cook connected to order updates");
      if (kitchenId) {
        newSocket.emit("join:kitchen", kitchenId);
        console.log("Joined kitchen room:", kitchenId);
      }
    });

    newSocket.on("order:created", (newOrder: Order) => {
      console.log("New order received:", newOrder);
      setOrders((prev) => [newOrder, ...prev]);
      toast.success(`New order #${newOrder.orderId} received!`, {
        duration: 5000,
      });
    });

    newSocket.on("order:cancelled", (cancelledOrder: Order) => {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === cancelledOrder.orderId ? cancelledOrder : o))
      );
      toast.info(`Order #${cancelledOrder.orderId} was cancelled`);
    });

    setSocket(newSocket);
  };

  const loadKitchenAndOrders = async () => {
    try {
      const [ordersRes, kitchenRes] = await Promise.all([
        orderApi.getOrders(),
        kitchenApi.getMyKitchen(),
      ]);
      setOrders(ordersRes.data);
      if (kitchenRes.data.success && kitchenRes.data.data) {
        setKitchenId(kitchenRes.data.data._id);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const { data } = await orderApi.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId);
    try {
      const { data } = await orderApi.updateStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? data : o))
      );
      toast.success(`Order #${orderId} updated to ${newStatus}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    const reason = prompt("Reason for rejecting order:");
    if (!reason) return;
    
    setUpdating(orderId);
    try {
      const { data } = await orderApi.rejectOrder(orderId, reason);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? data : o))
      );
      toast.success(`Order #${orderId} rejected`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to reject order");
    } finally {
      setUpdating(null);
    }
  };

  const filteredOrders = filter === "active"
    ? orders.filter((o) => ![OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REJECTED].includes(o.status))
    : orders;

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kitchen Orders</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter === "active" ? "default" : "outline"}
            onClick={() => setFilter("active")}
            className={filter === "active" ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            Active
          </Button>
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            All
          </Button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="mx-auto h-16 w-16 text-gray-300" />
          <h2 className="mt-4 text-xl font-semibold text-gray-500">
            {filter === "active" ? "No active orders" : "No orders yet"}
          </h2>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const nextAction = NEXT_STATUS[order.status];
            return (
              <Card key={order.orderId} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Order #{order.orderId}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={statusColors[order.status]}>{order.status}</Badge>
                </div>

                <div className="mb-4 space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-4 flex justify-between items-center border-t pt-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      Delivery: {new Date(order.timeSlot).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.deliveryAddress.label} - {order.deliveryAddress.city}
                    </p>
                  </div>
                  <span className="text-lg font-bold">₹{order.totalAmount}</span>
                </div>

                {nextAction && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-2 bg-orange-500 hover:bg-orange-600"
                      onClick={() => handleUpdateStatus(order.orderId, nextAction.status)}
                      disabled={updating === order.orderId}
                    >
                      {updating === order.orderId ? "Updating..." : nextAction.label}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    {(order.status === OrderStatus.PLACED || order.status === OrderStatus.CONFIRMED) && (
                      <Button
                        variant="destructive"
                        className="gap-2"
                        onClick={() => handleRejectOrder(order.orderId)}
                        disabled={updating === order.orderId}
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    )}
                  </div>
                )}

                {order.cancelReason && (
                  <p className="mt-3 text-sm text-red-600">
                    Cancel reason: {order.cancelReason}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
