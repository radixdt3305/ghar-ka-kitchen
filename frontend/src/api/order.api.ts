import { apiClient } from "./axios";

export enum OrderStatus {
  PLACED = "PLACED",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  READY = "READY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REJECTED = "REJECTED",
}

export interface OrderItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderId: string;
  userId: string;
  kitchenId: string;
  items: OrderItem[];
  deliveryAddress: {
    label: string;
    street: string;
    city: string;
    pincode: string;
    lat: number;
    lng: number;
  };
  timeSlot: string;
  status: OrderStatus;
  statusHistory: Array<{ status: OrderStatus; timestamp: string }>;
  totalAmount: number;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const orderApi = {
  createOrder: (addressId: string, timeSlot: string) =>
    apiClient.post<Order>("/orders/create", { addressId, timeSlot }),
  
  getOrders: () =>
    apiClient.get<Order[]>("/orders"),
  
  getOrderById: (orderId: string) =>
    apiClient.get<Order>(`/orders/${orderId}`),
  
  updateStatus: (orderId: string, status: OrderStatus) =>
    apiClient.patch<Order>(`/orders/${orderId}/status`, { status }),
  
  cancelOrder: (orderId: string, reason: string) =>
    apiClient.patch<Order>(`/orders/${orderId}/cancel`, { reason }),
  
  rejectOrder: (orderId: string, reason: string) =>
    apiClient.patch<Order>(`/orders/${orderId}/reject`, { reason }),
};
