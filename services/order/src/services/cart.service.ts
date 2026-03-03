import Cart from "../models/cart.model.js";
import { kitchenClient } from "../utils/http-client.js";

export class CartService {
  async getCart(userId: string) {
    const cart = await Cart.findOne({ userId });
    return cart || { userId, kitchenId: "", items: [], totalAmount: 0 };
  }

  async addItem(userId: string, kitchenId: string, dishId: string, quantity: number) {
    let cart = await Cart.findOne({ userId });

    // Single kitchen constraint
    if (cart && cart.kitchenId && cart.kitchenId !== kitchenId) {
      throw new Error("Cart can only contain items from one kitchen. Clear cart to add from another kitchen.");
    }

    // Validate dish availability
    const { data: response } = await kitchenClient.get(`/api/kitchens/menu/${kitchenId}/today`);
    const menu = response.data;
    const dish = menu.dishes.find((d: any) => d._id === dishId);
    if (!dish || dish.status !== "available") {
      throw new Error("Dish not available");
    }

    if (!cart) {
      cart = await Cart.create({
        userId,
        kitchenId,
        items: [{ dishId, name: dish.name, price: dish.price, quantity }],
        totalAmount: dish.price * quantity,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });
      return cart;
    }

    const existingItem = cart.items.find((item) => item.dishId === dishId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        dishId,
        name: dish.name,
        price: dish.price,
        quantity,
      });
    }

    cart.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await cart.save();
    return cart;
  }

  async updateItem(userId: string, dishId: string, quantity: number) {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Cart not found");
    const item = cart.items.find((i) => i.dishId === dishId);
    if (!item) throw new Error("Item not found in cart");

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.dishId !== dishId);
    } else {
      item.quantity = quantity;
    }

    cart.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await cart.save();
    return cart;
  }

  async removeItem(userId: string, dishId: string) {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Cart not found");
    cart.items = cart.items.filter((i) => i.dishId !== dishId);
    cart.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await cart.save();
    return cart;
  }

  async clearCart(userId: string) {
    await Cart.findOneAndDelete({ userId });
    return { message: "Cart cleared" };
  }
}
