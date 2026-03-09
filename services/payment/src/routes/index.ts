import { Router } from "express";
import paymentRoutes from "./payment.routes.js";
import payoutRoutes from "./payout.routes.js";
import refundRoutes from "./refund.routes.js";

const router = Router();

router.use("/payments", paymentRoutes);
router.use("/payouts", payoutRoutes);
router.use("/refunds", refundRoutes);

export default router;
