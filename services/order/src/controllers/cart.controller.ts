import { Response } from "express";
import { CartService } from "../services/cart.service.js";
import { AuthRequest } from "../interfaces/auth.interface.js";

const cartService = new CartService();

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await cartService.getCart(req.userId!);
    res.json(cart);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    console.log("[addToCart] userId:", req.userId);
    console.log("[addToCart] body:", req.body);
    const { kitchenId, dishId, quantity } = req.body;
    const cart = await cartService.addItem(req.userId!, kitchenId, dishId, quantity);
    res.json(cart);
  } catch (error: any) {
    console.error("[addToCart] ERROR:", error.response?.status, error.response?.data || error.message, error.stack);
    res.status(400).json({ error: error.message });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { dishId } = req.params;
    const { quantity } = req.body;
    const cart = await cartService.updateItem(req.userId!, dishId as string, quantity);
    res.json(cart);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const { dishId } = req.params;
    const cart = await cartService.removeItem(req.userId!, dishId as string);
    res.json(cart);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const result = await cartService.clearCart(req.userId!);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
