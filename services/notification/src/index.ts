import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { swaggerSpec } from './config/swagger.js';
import notificationRoutes from './routes/notification.routes.js';

// Initialize Firebase (side-effect import — runs initialization code)
import './config/firebase.js';

const app = express();

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path}`,
    req.headers.authorization ? '(authenticated)' : '(no token)'
  );
  next();
});

// ── Swagger ──────────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve as any, swaggerUi.setup(swaggerSpec) as any);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/notifications', notificationRoutes);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'notification', timestamp: new Date().toISOString() });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err: any, req: any, res: any, _next: any) => {
  const status: number = err.statusCode ?? err.status ?? 500;
  console.error(`[GLOBAL ERROR] ${req.method} ${req.path} → ${status}:`, err.message);
  if (status === 500) console.error(err.stack);
  res.status(status).json({ success: false, message: err.message ?? 'Internal Server Error' });
});

// ── Start Server ──────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(env.PORT, () => {
    console.log(`🚀 Notification service running on port ${env.PORT}`);
    console.log(`📚 Swagger docs at http://localhost:${env.PORT}/api-docs`);
    console.log(`📬 Internal send endpoint: POST http://localhost:${env.PORT}/api/notifications/send`);
  });
});
