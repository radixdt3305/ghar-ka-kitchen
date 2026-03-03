import mongoose from "mongoose";
const { Schema } = mongoose;
import { IOrderDocument, OrderStatus } from "../interfaces/order.interface.js";

const OrderItemSchema = new Schema(
  {
    dishId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    label: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema(
  {
    status: { type: String, enum: Object.values(OrderStatus), required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    kitchenId: { type: String, required: true, index: true },
    items: [OrderItemSchema],
    deliveryAddress: { type: AddressSchema, required: true },
    timeSlot: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PLACED,
    },
    statusHistory: [StatusHistorySchema],
    totalAmount: { type: Number, required: true, min: 0 },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ kitchenId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

const Order = mongoose.model<IOrderDocument>("Order", OrderSchema);
export default Order;
