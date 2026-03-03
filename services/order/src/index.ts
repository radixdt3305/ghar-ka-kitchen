import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { createServer } from "http";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { setupSocket } from "./config/socket.js";
import { swaggerSpec } from "./config/swagger.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

const app = express();
const httpServer = createServer(app);
const io = setupSocket(httpServer);

app.set("io", io);

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log("Headers:", req.headers.authorization ? "Token present" : "No token");
  next();
});

app.use("/api-docs", swaggerUi.serve as any, swaggerUi.setup(swaggerSpec) as any);

app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "order" });
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  const status = err.statusCode || err.status || 500;
  console.error(`[GLOBAL ERROR] ${req.method} ${req.path} → ${status}:`, err.message);
  if (status === 500) console.error(err.stack);
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

connectDB().then(() => {
  httpServer.listen(env.PORT, () => {
    console.log(`🚀 Order service running on port ${env.PORT}`);
    console.log(`📚 Swagger docs at http://localhost:${env.PORT}/api-docs`);
  });
});
