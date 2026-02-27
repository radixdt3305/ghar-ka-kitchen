import cors from "cors";

export const corsOptions = cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
});
