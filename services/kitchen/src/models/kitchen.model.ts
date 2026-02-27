import mongoose from "mongoose";
const { Schema } = mongoose;
import { IKitchenDocument } from "../interfaces/kitchen.interface.js";
import { KitchenStatus, CuisineType } from "../constants/enums.js";

const LocationSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true, match: /^\d{6}$/ },
  },
  { _id: false }
);

const KitchenSchema = new Schema<IKitchenDocument>(
  {
    cookId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    photos: [{ type: String }],
    address: { type: AddressSchema, required: true },
    location: { type: LocationSchema, required: true },
    cuisines: [{ type: String, enum: Object.values(CuisineType) }],
    status: {
      type: String,
      enum: Object.values(KitchenStatus),
      default: KitchenStatus.PENDING,
    },
    fssaiLicense: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 2dsphere index for geospatial queries
KitchenSchema.index({ location: "2dsphere" });
KitchenSchema.index({ cookId: 1, isActive: 1 });

const Kitchen = mongoose.model<IKitchenDocument>("Kitchen", KitchenSchema);
export default Kitchen;
