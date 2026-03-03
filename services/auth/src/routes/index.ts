import express from "express";
import authRoutes from "./auth.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", authRoutes);

export default router;
