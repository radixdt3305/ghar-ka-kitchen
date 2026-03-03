import express from "express";
import swaggerUi from "swagger-ui-express";
import { connectDB } from "./config/db.js";
import { corsOptions } from "./config/cors.js";
import { env } from "./config/env.js";
import { swaggerSpec } from "./config/swagger.js";
import { errorHandler } from "./middleware/error.middleware.js";
import searchRoutes from "./routes/search.routes.js";

const app = express();

app.use(corsOptions);
app.use(express.json({ limit: "10mb" }));

connectDB();

app.use("/api-docs", swaggerUi.serve as any, swaggerUi.setup(swaggerSpec) as any);

app.use("/api/search", searchRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "search" });
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🔍 Search Service running on port ${env.PORT}`);
  console.log(`📚 Swagger docs at http://localhost:${env.PORT}/api-docs`);
});
