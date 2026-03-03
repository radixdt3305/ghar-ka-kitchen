import mongoose from "mongoose";
const { Schema } = mongoose;
import { ICartDocument } from "../interfaces/order.interface.js";

const CartItemSchema = new Schema(
  {
    dishId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const CartSchema = new Schema<ICartDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    kitchenId: { type: String, required: true },
    items: [CartItemSchema],
    totalAmount: { type: Number, required: true, default: 0 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

CartSchema.pre("save", function (next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  next();
});

const Cart = mongoose.model<ICartDocument>("Cart", CartSchema);
export default Cart;
