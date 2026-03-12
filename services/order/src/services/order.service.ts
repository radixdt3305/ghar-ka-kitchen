import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import { OrderStatus } from "../interfaces/order.interface.js";
import { kitchenClient } from "../utils/http-client.js";
import { nanoid } from "nanoid";

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PLACED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED, OrderStatus.REJECTED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED, OrderStatus.REJECTED],
  [OrderStatus.PREPARING]: [OrderStatus.READY],
  [OrderStatus.READY]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REJECTED]: [],
};

export class OrderService {
  async createOrder(userId: string, addressId: string, timeSlot: Date, userAddresses: any[]) {
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Validate dish availability
    try {
      const { data: menuResponse } = await kitchenClient.get(`/api/kitchens/menu/${cart.kitchenId}/today`);
      const menu = menuResponse.data;
      
      for (const item of cart.items) {
        const dish = menu.dishes.find((d: any) => d._id === item.dishId);
        if (!dish) {
          throw new Error(`${item.name} is no longer available`);
        }
        if (dish.status !== 'available') {
          throw new Error(`${item.name} is currently ${dish.status}`);
        }
        if (dish.availableQuantity < item.quantity) {
          throw new Error(`${item.name} - Only ${dish.availableQuantity} available, you requested ${item.quantity}`);
        }
      }
    } catch (error: any) {
      throw new Error(error.message || "Failed to validate dish availability");
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

    // Auto-create payment transaction when order is delivered
    if (newStatus === OrderStatus.DELIVERED) {
      try {
        const axios = (await import("axios")).default;

        // Resolve the cook's userId from the kitchen
        const { data: kitchenResponse } = await kitchenClient.get(`/api/kitchens/${order.kitchenId}`);
        const cookUserId = kitchenResponse.data?.cookId || order.kitchenId;
        console.log(`🔍 Kitchen lookup: kitchenId=${order.kitchenId}, cookUserId=${cookUserId}, raw response keys=${JSON.stringify(Object.keys(kitchenResponse))}`);

        await axios.post(
          `http://localhost:5004/api/payments/auto-create`,
          {
            orderId: order.orderId,
            userId: order.userId,
            cookId: cookUserId,
            amount: order.totalAmount
          }
        );
        console.log(`✅ Payment transaction created for delivered order ${orderId}`);
      } catch (error: any) {
        console.log(`⚠️ Failed to create payment transaction: ${error.message}`);
        // Don't fail the status update if payment creation fails
      }
    }

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

    // Process refund if payment was made
    try {
      const axios = (await import("axios")).default;
      const token = process.env.JWT_SECRET; // This won't work, we need actual user token
      
      // Call refund without auth for now (we'll add internal service auth later)
      await axios.post(
        `http://localhost:5004/api/refunds/${orderId}`,
        { reason }
      );
      console.log(`✅ Refund initiated for order ${orderId}`);
    } catch (error: any) {
      console.log(`⚠️ Refund failed: ${error.response?.data?.message || error.message}`);
      // Don't fail the cancellation if refund fails
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

  async rejectOrder(orderId: string, reason: string) {
    const order = await Order.findOne({ orderId });
    if (!order) throw new Error("Order not found");

    if (![OrderStatus.PLACED, OrderStatus.CONFIRMED].includes(order.status)) {
      throw new Error("Order can only be rejected when PLACED or CONFIRMED");
    }

    // Process refund automatically
    try {
      const axios = (await import("axios")).default;
      await axios.post(
        `http://localhost:5004/api/refunds/${orderId}`,
        { reason: `Order rejected by cook: ${reason}` }
      );
      console.log(`✅ Refund initiated for rejected order ${orderId}`);
    } catch (error: any) {
      console.log(`⚠️ Refund failed: ${error.response?.data?.message || error.message}`);
    }

    // Restore dish quantities
    for (const item of order.items) {
      await kitchenClient.patch(`/api/kitchens/menu/${order.kitchenId}/dish/${item.dishId}/quantity`, {
        quantity: item.quantity,
      });
    }

    order.status = OrderStatus.REJECTED;
    order.cancelReason = reason;
    order.statusHistory.push({ status: OrderStatus.REJECTED, timestamp: new Date() });
    await order.save();
    return order;
  }
}
