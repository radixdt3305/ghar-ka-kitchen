import { apiClient } from "./axios";

export interface CartItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart {
  _id: string;
  userId: string;
  kitchenId: string;
  items: CartItem[];
  totalAmount: number;
  expiresAt: string;
}

export const cartApi = {
  getCart: () => apiClient.get<Cart>("/cart"),
  
  addToCart: (kitchenId: string, dishId: string, quantity: number) =>
    apiClient.post<Cart>("/cart/add", { kitchenId, dishId, quantity }),
  
  updateItem: (dishId: string, quantity: number) =>
    apiClient.patch<Cart>(`/cart/update/${dishId}`, { quantity }),
  
  removeItem: (dishId: string) =>
    apiClient.delete<Cart>(`/cart/remove/${dishId}`),
  
  clearCart: () =>
    apiClient.delete("/cart/clear"),
};
