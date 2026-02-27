import type { Document } from "mongoose";
import { DishCategory, DietType, MenuStatus } from "../constants/enums.js";

export interface IDish {
  name: string;
  description: string;
  category: DishCategory;
  dietType: DietType;
  price: number;
  photos: string[];
  quantity: number;
  availableQuantity: number;
  status: MenuStatus;
}

export interface IMenu {
  kitchenId: string;
  date: Date;
  dishes: IDish[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMenuDocument extends IMenu, Document {}
