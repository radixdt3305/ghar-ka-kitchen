import type { Document } from "mongoose";
import { KitchenStatus, CuisineType } from "../constants/enums.js";

export interface ILocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IKitchen {
  cookId: string;
  name: string;
  description: string;
  photos: string[];
  address: IAddress;
  location: ILocation;
  cuisines: CuisineType[];
  status: KitchenStatus;
  fssaiLicense?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IKitchenDocument extends IKitchen, Document {}
