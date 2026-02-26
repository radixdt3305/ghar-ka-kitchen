import mongoose from "mongoose";
const { Schema } = mongoose;
import { IMenuDocument } from "../interfaces/menu.interface.js";
import { DishCategory, MenuStatus } from "../constants/enums.js";

const DishSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: Object.values(DishCategory), required: true },
    price: { type: Number, required: true, min: 0 },
    photos: [{ type: String }],
    quantity: { type: Number, required: true, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(MenuStatus),
      default: MenuStatus.AVAILABLE,
    },
  },
  { _id: true }
);

const MenuSchema = new Schema<IMenuDocument>(
  {
    kitchenId: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    dishes: [DishSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MenuSchema.index({ kitchenId: 1, date: 1 }, { unique: true });

const Menu = mongoose.model<IMenuDocument>("Menu", MenuSchema);
export default Menu;
