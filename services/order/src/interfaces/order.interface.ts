import { Document, Types } from "mongoose";

export enum OrderStatus {
  PLACED = "PLACED",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  READY = "READY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export interface IOrderItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IStatusHistory {
  status: OrderStatus;
  timestamp: Date;
}

export interface IOrder {
  orderId: string;
  userId: string;
  kitchenId: string;
  items: IOrderItem[];
  deliveryAddress: {
    label: string;
    street: string;
    city: string;
    pincode: string;
    lat: number;
    lng: number;
  };
  timeSlot: Date;
  status: OrderStatus;
  statusHistory: IStatusHistory[];
  totalAmount: number;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderDocument extends IOrder, Document {}

export interface ICartItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ICart {
  userId: string;
  kitchenId: string;
  items: ICartItem[];
  totalAmount: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartDocument extends ICart, Document {}
