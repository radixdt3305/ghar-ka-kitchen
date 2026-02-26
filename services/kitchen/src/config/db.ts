import mongoose from "mongoose";
import { env } from "./env.js";

const connectDb = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      dbName: "shubham_chauhan",
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    } as mongoose.ConnectionOptions);
    console.log("Kitchen service connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDb;
