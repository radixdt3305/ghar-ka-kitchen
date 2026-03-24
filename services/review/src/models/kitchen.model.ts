import mongoose from "mongoose";
const { Schema } = mongoose;

// Minimal Kitchen model — read-only reference to the shared kitchens collection
const KitchenSchema = new Schema(
  { cookId: { type: String } },
  { strict: false }
);

const Kitchen = mongoose.model("Kitchen", KitchenSchema);
export default Kitchen;
