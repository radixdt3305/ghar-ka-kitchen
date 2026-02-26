import mongoose from "mongoose";
const { Schema } = mongoose;
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUserDocument } from "../interfaces/user.interface.js";
import { UserRole } from "../constants/enums.js";
import { SALT_ROUNDS } from "../constants/app.constants.js";
import { env } from "../config/env.js";

// --- Address Sub-Schema ---
const AddressSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    pincode: {
      type: String,
      required: true,
      match: [/^\d{6}$/, "Invalid pincode"],
    },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

// --- User Schema ---
const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      unique: true,
      match: [/^[6-9]\d{9}$/, "Invalid Indian phone number"],
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(UserRole),
        message: "{VALUE} is not a valid role",
      },
      default: UserRole.BUYER,
    },
    avatar: {
      type: String,
      default: "",
    },
    addresses: {
      type: [AddressSchema],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// --- Indexes ---
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { unique: true });
UserSchema.index({ role: 1 });

// --- Pre-save Hook: Hash password ---
UserSchema.pre<IUserDocument>("save", async function (next) {
  if (!this.password || !this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// --- Instance Methods ---
UserSchema.methods.comparePassword = async function (
  this: IUserDocument,
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.generateAccessToken = function (
  this: IUserDocument
): string {
  return jwt.sign(
    { userId: this._id, email: this.email, role: this.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY }
  );
};

UserSchema.methods.generateRefreshToken = function (
  this: IUserDocument
): string {
  return jwt.sign({ userId: this._id }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  });
};

// --- Omit password from JSON output ---
UserSchema.methods.toJSON = function (this: IUserDocument) {
  const obj = this.toObject() as Record<string, unknown>;
  delete obj["password"];
  return obj;
};

const User = mongoose.model<IUserDocument>("User", UserSchema);
export default User;
