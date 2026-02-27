import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import connectDb from "./config/db.js";
import { corsOptions } from "./config/cors.js";
import { swaggerSpec } from "./config/swagger.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve as any, swaggerUi.setup(swaggerSpec) as any);

app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "kitchen" });
});

app.use(errorHandler as any);

app.listen(env.PORT, () => {
  console.log(`Kitchen service running on port ${env.PORT}`);
  console.log(`Swagger docs at http://localhost:${env.PORT}/api-docs`);
  connectDb();
});
