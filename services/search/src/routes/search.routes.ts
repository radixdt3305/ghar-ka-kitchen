import express from "express";
import * as searchController from "../controllers/search.controller.js";
import { asyncHandler } from "../middleware/async.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/search/kitchens:
 *   get:
 *     summary: Search kitchens
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Search results
 */
router.get("/kitchens", asyncHandler(searchController.searchKitchens));

/**
 * @swagger
 * /api/search/kitchens/nearby:
 *   get:
 *     summary: Get nearby kitchens
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Radius in km
 *     responses:
 *       200:
 *         description: Nearby kitchens
 */
router.get("/kitchens/nearby", asyncHandler(searchController.getNearbyKitchens));

/**
 * @swagger
 * /api/search/dishes:
 *   get:
 *     summary: Search dishes
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 */
router.get("/dishes", asyncHandler(searchController.searchDishes));

/**
 * @swagger
 * /api/search/dishes/trending:
 *   get:
 *     summary: Get trending dishes
 *     tags: [Search]
 *     responses:
 *       200:
 *         description: Trending dishes
 */
router.get("/dishes/trending", asyncHandler(searchController.getTrendingDishes));

/**
 * @swagger
 * /api/search/menus/today:
 *   get:
 *     summary: Get today's menus
 *     tags: [Search]
 *     responses:
 *       200:
 *         description: Today's available menus
 */
router.get("/menus/today", asyncHandler(searchController.getTodayMenus));

export default router;
