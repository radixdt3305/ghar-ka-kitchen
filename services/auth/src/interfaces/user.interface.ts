import type { Document, Model } from "mongoose";
import { UserRole } from "../constants/enums.js";

export interface IAddress {
  label: string;
  street: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

export interface IUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  avatar: string;
  addresses: IAddress[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document, IUserMethods {}

export interface IUserModel extends Model<IUserDocument> {}
