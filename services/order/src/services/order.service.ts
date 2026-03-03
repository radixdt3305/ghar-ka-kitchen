import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import { OrderStatus } from "../interfaces/order.interface.js";
import { kitchenClient } from "../utils/http-client.js";
import { nanoid } from "nanoid";

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PLACED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY],
  [OrderStatus.READY]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export class OrderService {
  async createOrder(userId: string, addressId: string, timeSlot: Date, userAddresses: any[]) {
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Match by _id first; fall back to index for legacy addresses without _id
    let address = userAddresses.find((a: any) => a._id?.toString() === addressId);
    if (!address) {
      const idxMatch = addressId.match(/^addr-(\d+)$/);
      if (idxMatch) {
        const idx = parseInt(idxMatch[1], 10);
        if (idx >= 0 && idx < userAddresses.length) {
          address = userAddresses[idx];
        }
      }
    }
    if (!address) throw new Error("Invalid address");

    const slotTime = new Date(timeSlot);
    if (slotTime <= new Date(Date.now() + 2 * 60 * 60 * 1000)) {
      throw new Error("Time slot must be at least 2 hours from now");
    }

    // Update dish quantities
    for (const item of cart.items) {
      await kitchenClient.patch(`/api/kitchens/menu/${cart.kitchenId}/dish/${item.dishId}/quantity`, {
        quantity: -item.quantity,
      });
    }

    const order = await Order.create({
      orderId: nanoid(10),
      userId,
      kitchenId: cart.kitchenId,
      items: cart.items,
      deliveryAddress: address,
      timeSlot: slotTime,
      status: OrderStatus.PLACED,
      statusHistory: [{ status: OrderStatus.PLACED, timestamp: new Date() }],
      totalAmount: cart.totalAmount,
    });

    await Cart.findOneAndDelete({ userId });
    return order;
  }

  async getOrders(userId: string, role: string) {
    if (role === "cook") {
      const { data: response } = await kitchenClient.get(`/api/kitchens/cook/${userId}`);
      const kitchen = response.data;
      if (kitchen) {
        return Order.find({ kitchenId: kitchen._id }).sort({ createdAt: -1 });
      }
      return [];
    }
    return Order.find({ userId }).sort({ createdAt: -1 });
  }

  async getOrderById(orderId: string) {
    const order = await Order.findOne({ orderId });
    if (!order) throw new Error("Order not found");
    return order;
  }

  async updateStatus(orderId: string, newStatus: OrderStatus) {
    const order = await Order.findOne({ orderId });
    if (!order) throw new Error("Order not found");

    const allowedTransitions = STATUS_TRANSITIONS[order.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
    }

    order.status = newStatus;
    order.statusHistory.push({ status: newStatus, timestamp: new Date() });
    await order.save();
    return order;
  }

  async cancelOrder(orderId: string, reason: string) {
    const order = await Order.findOne({ orderId });
    if (!order) throw new Error("Order not found");

    if (![OrderStatus.PLACED, OrderStatus.CONFIRMED].includes(order.status)) {
      throw new Error("Order cannot be cancelled at this stage");
    }

    const timeSincePlaced = Date.now() - order.createdAt.getTime();
    if (timeSincePlaced > 15 * 60 * 1000) {
      throw new Error("Cancellation window (15 minutes) has passed");
    }

    // Restore dish quantities
    for (const item of order.items) {
      await kitchenClient.patch(`/api/kitchens/menu/${order.kitchenId}/dish/${item.dishId}/quantity`, {
        quantity: item.quantity,
      });
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelReason = reason;
    order.statusHistory.push({ status: OrderStatus.CANCELLED, timestamp: new Date() });
    await order.save();
    return order;
  }
}
