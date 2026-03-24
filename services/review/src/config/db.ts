import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      dbName: "shubham_chauhan",
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    } as any);
    console.log("MongoDB connected (review service)");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};
