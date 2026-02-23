import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import connectDb from "./config/db.js";
import { corsOptions } from "./config/cors.js";
import { swaggerSpec } from "./config/swagger.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger docs
app.use(
  "/api-docs",
  swaggerUi.serve as any,
  swaggerUi.setup(swaggerSpec) as any
);

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "auth" });
});

// Global error handler (MUST be after routes)
app.use(errorHandler as any);

// Start server
app.listen(env.PORT, () => {
  console.log(`Auth service running on port ${env.PORT}`);
  console.log(`Swagger docs at http://localhost:${env.PORT}/api-docs`);
  connectDb();
});
