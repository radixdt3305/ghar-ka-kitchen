import express from "express";
import { createAuthMiddleware, authorize, UserRole } from "@gharkakitchen/shared-auth";
import { env } from "../config/env.js";
import { asyncHandler } from "../middleware/async.middleware.js";
import * as menuController from "../controllers/menu.controller.js";

const router = express.Router();
const authenticate = createAuthMiddleware(env.JWT_ACCESS_SECRET);

/**
 * @swagger
 * /api/kitchens/{kitchenId}/menus:
 *   post:
 *     summary: Create daily menu (Cook only)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kitchenId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, dishes]
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               dishes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Paneer Butter Masala"
 *                     description:
 *                       type: string
 *                       example: "Creamy paneer curry"
 *                     category:
 *                       type: string
 *                       enum: [breakfast, lunch, dinner, snacks, dessert, beverages]
 *                     price:
 *                       type: number
 *                       example: 150
 *                     photos:
 *                       type: array
 *                       items:
 *                         type: string
 *                     quantity:
 *                       type: number
 *                       example: 20
 *                     availableQuantity:
 *                       type: number
 *                       example: 20
 *     responses:
 *       201:
 *         description: Menu created
 *       409:
 *         description: Menu already exists for this date
 */
router.post("/:kitchenId/menus", authenticate, authorize(UserRole.COOK), asyncHandler(menuController.createMenu));

/**
 * @swagger
 * /api/kitchens/{kitchenId}/menus:
 *   get:
 *     summary: Get all menus for a kitchen
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: kitchenId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menus retrieved
 */
router.get("/:kitchenId/menus", asyncHandler(menuController.getMenusByKitchen));

/**
 * @swagger
 * /api/kitchens/menus/{menuId}:
 *   put:
 *     summary: Update menu (Cook only)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Menu updated
 */
router.put("/menus/:menuId", authenticate, authorize(UserRole.COOK), asyncHandler(menuController.updateMenu));

/**
 * @swagger
 * /api/kitchens/menus/{menuId}/dishes/{dishId}/status:
 *   patch:
 *     summary: Toggle dish availability status (Cook only)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: dishId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, sold_out, unavailable]
 *     responses:
 *       200:
 *         description: Dish status updated
 */
router.patch("/menus/:menuId/dishes/:dishId/status", authenticate, authorize(UserRole.COOK), asyncHandler(menuController.toggleDishStatus));

/**
 * @swagger
 * /api/kitchens/{kitchenId}/menus/copy-yesterday:
 *   post:
 *     summary: Copy yesterday's menu to today (Cook only)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kitchenId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Yesterday's menu copied
 *       404:
 *         description: No menu found for yesterday
 *       409:
 *         description: Menu already exists for today
 */
router.post("/:kitchenId/menus/copy-yesterday", authenticate, authorize(UserRole.COOK), asyncHandler(menuController.copyYesterdayMenu));

/**
 * @swagger
 * /api/kitchens/menus/today:
 *   get:
 *     summary: Get today's menus from nearby kitchens
 *     tags: [Menu]
 *     parameters:
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Today's menus retrieved
 */
router.get("/menus/today", asyncHandler(menuController.getTodayMenus));

/**
 * @swagger
 * /api/kitchens/dishes/search:
 *   get:
 *     summary: Search dishes with filters
 *     tags: [Menu]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Dishes retrieved
 */
router.get("/dishes/search", asyncHandler(menuController.searchDishes));

/**
 * @swagger
 * /api/kitchens/dishes/trending:
 *   get:
 *     summary: Get trending dishes in your area
 *     tags: [Menu]
 *     parameters:
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Trending dishes retrieved
 */
router.get("/dishes/trending", asyncHandler(menuController.getTrendingDishes));

export default router;
