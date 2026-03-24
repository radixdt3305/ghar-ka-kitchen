import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { swaggerSpec } from "./config/swagger.js";
import reviewRoutes from "./routes/review.routes.js";

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request logger (dev only) ───────────────────────────────────────────────
if (env.NODE_ENV === "development") {
  app.use((req, _res, next) => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path}`,
      req.headers.authorization ? "(authenticated)" : "(public)"
    );
    next();
  });
}

// ── Swagger docs ────────────────────────────────────────────────────────────
app.use(
  "/api-docs",
  swaggerUi.serve as any,
  swaggerUi.setup(swaggerSpec) as any
);

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/reviews", reviewRoutes);

// ── Health check ────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "review", port: env.PORT });
});

// ── Global error handler ────────────────────────────────────────────────────
app.use((err: any, _req: any, res: any, _next: any) => {
  const status: number = err.statusCode ?? err.status ?? 500;
  console.error(`[ERROR] ${err.message}`);
  if (status === 500) console.error(err.stack);
  res.status(status).json({
    success: false,
    message: err.message ?? "Internal Server Error",
  });
});

// ── Bootstrap ───────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(env.PORT, () => {
    console.log(`Review service running on port ${env.PORT}`);
    console.log(`Swagger docs at http://localhost:${env.PORT}/api-docs`);
  });
});
