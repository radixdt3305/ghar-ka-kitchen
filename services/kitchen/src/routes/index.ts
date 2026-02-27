import express from "express";
import kitchenRoutes from "./kitchen.routes.js";
import menuRoutes from "./menu.routes.js";

const router = express.Router();

router.use("/kitchens", kitchenRoutes);
router.use("/kitchens", menuRoutes);

export default router;
