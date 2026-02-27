import express from "express";
import { connectDB } from "./config/db.js";
import { corsOptions } from "./config/cors.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";
import searchRoutes from "./routes/search.routes.js";

const app = express();

app.use(corsOptions);
app.use(express.json({ limit: "10mb" }));

connectDB();

app.use("/api/search", searchRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🔍 Search Service running on port ${env.PORT}`);
});
