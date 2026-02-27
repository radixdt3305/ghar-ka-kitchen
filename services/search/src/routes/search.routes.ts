import express from "express";
import * as searchController from "../controllers/search.controller.js";
import { asyncHandler } from "../middleware/async.middleware.js";

const router = express.Router();

router.get("/kitchens", asyncHandler(searchController.searchKitchens));
router.get("/kitchens/nearby", asyncHandler(searchController.getNearbyKitchens));
router.get("/dishes", asyncHandler(searchController.searchDishes));
router.get("/dishes/trending", asyncHandler(searchController.getTrendingDishes));
router.get("/menus/today", asyncHandler(searchController.getTodayMenus));

export default router;
