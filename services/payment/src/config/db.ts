import mongoose from "mongoose";
import { env } from "./env.js";

const connectDb = async () => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    } as any);
    console.log("✅ MongoDB connected (Payment Service)");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDb;
