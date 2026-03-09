import { Response } from "express";
import { OrderService } from "../services/order.service.js";
import { OrderStatus } from "../interfaces/order.interface.js";
import { authClient } from "../utils/http-client.js";
import { AuthRequest } from "../interfaces/auth.interface.js";

const orderService = new OrderService();

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

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateStatus(req.params.orderId as string, status as OrderStatus);

    req.app.get("io").to(`order:${order.orderId}`).emit("order:statusChanged", order);
    req.app.get("io").to(`user:${order.userId}`).emit("order:statusChanged", order);

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

    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
