import mongoose from "mongoose";
const { Schema } = mongoose;

// Minimal Order model — read-only reference to the shared orders collection
const OrderSchema = new Schema(
  {
    orderId: { type: String },
    userId: { type: String },
    kitchenId: { type: String },
    status: { type: String },
    totalAmount: { type: Number },
    items: { type: Schema.Types.Mixed },
  },
  { timestamps: true, strict: false }
);

// Use the same collection name as the order service
const Order = mongoose.model("Order", OrderSchema);
export default Order;
