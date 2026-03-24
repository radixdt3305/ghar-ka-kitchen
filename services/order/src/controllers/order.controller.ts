import { Response } from "express";
import { OrderService } from "../services/order.service.js";
import { OrderStatus } from "../interfaces/order.interface.js";
import { authClient, notificationClient } from "../utils/http-client.js";
import { AuthRequest } from "../interfaces/auth.interface.js";

const orderService = new OrderService();

function notify(userId: string, type: string, title: string, body: string) {
  notificationClient
    .post("/api/notifications/send", { userId, type, title, body })
    .catch(() => {});
}

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { addressId, timeSlot } = req.body;
    const { data: profileRes } = await authClient.get(`/api/auth/profile`, {
      headers: { Authorization: req.headers.authorization },
    });
    const user = profileRes.data;
    const order = await orderService.createOrder(req.userId!, addressId, timeSlot, user.addresses);

    req.app.get("io").to(`user:${req.userId!}`).emit("order:created", order);
    req.app.get("io").to(`kitchen:${order.kitchenId}`).emit("order:created", order);

    notify(
      order.kitchenId,
      "order_placed",
      "New Order Received!",
      `Order #${order.orderId} placed. Total: Rs.${order.totalAmount}`
    );

    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await orderService.getOrders(req.userId!, req.userRole!);
    res.json(orders);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await orderService.getOrderById(req.params.orderId as string);
    res.json(order);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

const STATUS_NOTIFICATION: Partial<Record<OrderStatus, { title: string; body: (id: string) => string }>> = {
  [OrderStatus.CONFIRMED]: { title: "Order Confirmed!", body: (id) => `Your order #${id} has been confirmed by the cook.` },
  [OrderStatus.PREPARING]: { title: "Order Being Prepared", body: (id) => `Your order #${id} is now being prepared.` },
  [OrderStatus.READY]: { title: "Order Ready!", body: (id) => `Your order #${id} is ready and on its way.` },
  [OrderStatus.DELIVERED]: { title: "Order Delivered!", body: (id) => `Your order #${id} has been delivered. Enjoy!` },
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateStatus(req.params.orderId as string, status as OrderStatus);

    req.app.get("io").to(`order:${order.orderId}`).emit("order:statusChanged", order);
    req.app.get("io").to(`user:${order.userId}`).emit("order:statusChanged", order);

    const notif = STATUS_NOTIFICATION[status as OrderStatus];
    if (notif) {
      notify(order.userId, `order_${status.toLowerCase()}`, notif.title, notif.body(order.orderId));
    }

    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const order = await orderService.cancelOrder(req.params.orderId as string, reason);

    req.app.get("io").to(`order:${order.orderId}`).emit("order:cancelled", order);
    req.app.get("io").to(`user:${order.userId}`).emit("order:cancelled", order);
    req.app.get("io").to(`kitchen:${order.kitchenId}`).emit("order:cancelled", order);

    notify(order.userId, "order_cancelled", "Order Cancelled", `Your order #${order.orderId} has been cancelled.`);

    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const rejectOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const order = await orderService.rejectOrder(req.params.orderId as string, reason);

    req.app.get("io").to(`order:${order.orderId}`).emit("order:rejected", order);
    req.app.get("io").to(`user:${order.userId}`).emit("order:rejected", order);

    notify(order.userId, "order_rejected", "Order Rejected", `Order #${order.orderId} was rejected. Reason: ${reason}`);

    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
