import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import connectDb from "./config/db.js";
import { swaggerSpec } from "./config/swagger.js";
import routes from "./routes/index.js";
import { initPayoutScheduler } from "./utils/payout-scheduler.js";

const app = express();

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Raw body for Stripe webhooks
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);

// Swagger docs
app.use("/api-docs", swaggerUi.serve as any, swaggerUi.setup(swaggerSpec) as any);

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "payment" });
});

// Start server
app.listen(env.PORT, () => {
  console.log(`💳 Payment service running on port ${env.PORT}`);
  console.log(`📚 Swagger docs at http://localhost:${env.PORT}/api-docs`);
  connectDb();
  initPayoutScheduler();
});
