import mongoose from 'mongoose';
import type { Document } from 'mongoose';
const { Schema } = mongoose;

export type DevicePlatform = 'web' | 'android' | 'ios';

export interface IDeviceToken extends Document {
  userId: string;
  token: string;
  platform: DevicePlatform;
  createdAt: Date;
}

const DeviceTokenSchema = new Schema<IDeviceToken>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      enum: ['web', 'android', 'ios'] as DevicePlatform[],
      default: 'web',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const DeviceToken = mongoose.model<IDeviceToken>('DeviceToken', DeviceTokenSchema);
