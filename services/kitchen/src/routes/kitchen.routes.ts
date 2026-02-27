import express from "express";
import { createAuthMiddleware, authorize, UserRole } from "@gharkakitchen/shared-auth";
import { env } from "../config/env.js";
import { asyncHandler } from "../middleware/async.middleware.js";
import * as kitchenController from "../controllers/kitchen.controller.js";

const router = express.Router();
const authenticate = createAuthMiddleware(env.JWT_ACCESS_SECRET);

/**
 * @swagger
 * /api/kitchens:
 *   post:
 *     summary: Create a new kitchen (Cook only)
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, address, location, cuisines]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sharma's Kitchen"
 *               description:
 *                 type: string
 *                 example: "Authentic North Indian home-cooked meals"
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["photo1.jpg", "photo2.jpg"]
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   pincode:
 *                     type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [77.2090, 28.6139]
 *               cuisines:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [north_indian, south_indian, chinese, continental, italian, mexican, bengali, gujarati, punjabi, maharashtrian, rajasthani, street_food, desserts, bakery]
 *               fssaiLicense:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kitchen created successfully
 *       409:
 *         description: Kitchen already exists
 */
router.post("/", authenticate, authorize(UserRole.COOK), asyncHandler(kitchenController.createKitchen));

/**
 * @swagger
 * /api/kitchens/my-kitchen:
 *   get:
 *     summary: Get my kitchen (Cook only)
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kitchen retrieved
 *       404:
 *         description: Kitchen not found
 */
router.get("/my-kitchen", authenticate, authorize(UserRole.COOK), asyncHandler(kitchenController.getMyKitchen));

/**
 * @swagger
 * /api/kitchens/{kitchenId}:
 *   put:
 *     summary: Update kitchen (Cook only)
 *     tags: [Kitchen]
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
 *     responses:
 *       200:
 *         description: Kitchen updated
 */
router.put("/:kitchenId", authenticate, authorize(UserRole.COOK), asyncHandler(kitchenController.updateKitchen));

/**
 * @swagger
 * /api/kitchens/{kitchenId}/approve:
 *     summary: Approve kitchen (Admin only)
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kitchenId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kitchen approved
 */
router.patch("/:kitchenId/approve", authenticate, authorize(UserRole.ADMIN), asyncHandler(kitchenController.approveKitchen));

/**
 * @swagger
 * /api/kitchens/{kitchenId}/reject:
 *   patch:
 *     summary: Reject kitchen (Admin only)
 *     tags: [Kitchen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kitchenId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kitchen rejected
 */
router.patch("/:kitchenId/reject", authenticate, authorize(UserRole.ADMIN), asyncHandler(kitchenController.rejectKitchen));

/**
 * @swagger
 * /api/kitchens/nearby:
 *   get:
 *     summary: Find nearby kitchens
 *     tags: [Kitchen]
 *     parameters:
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         example: 77.2090
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         example: 28.6139
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: number
 *         example: 5000
 *     responses:
 *       200:
 *         description: Nearby kitchens retrieved
 */
router.get("/nearby", asyncHandler(kitchenController.getNearbyKitchens));

/**
 * @swagger
 * /api/kitchens/search:
 *   get:
 *     summary: Search kitchens with filters
 *     tags: [Kitchen]
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
 *         name: cuisines
 *         schema:
 *           type: string
 *         description: Comma-separated cuisines
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [distance, rating, price]
 *     responses:
 *       200:
 *         description: Kitchens retrieved
 */
router.get("/search", asyncHandler(kitchenController.searchKitchens));

/**
 * @swagger
 * /api/kitchens/{kitchenId}:
 *   get:
 *     summary: Get kitchen by ID
 *     tags: [Kitchen]
 *     parameters:
 *       - in: path
 *         name: kitchenId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kitchen retrieved
 */
router.get("/:kitchenId", asyncHandler(kitchenController.getKitchenById));

export default router;
