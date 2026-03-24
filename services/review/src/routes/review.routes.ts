import { Router } from "express";
import { ReviewController } from "../controllers/review.controller.js";
import { authMiddleware, buyerOnly, cookOnly } from "../middleware/auth.middleware.js";
import { uploadPhotos } from "../middleware/upload.middleware.js";

const router = Router();
const controller = new ReviewController();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review and rating management
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a review for a delivered order
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - kitchenId
 *               - cookId
 *               - rating
 *             properties:
 *               orderId:
 *                 type: string
 *               kitchenId:
 *                 type: string
 *               cookId:
 *                 type: string
 *               rating:
 *                 type: object
 *                 properties:
 *                   taste:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 5
 *                   portion:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 5
 *                   hygiene:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 5
 *               dishRatings:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dishId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     rating:
 *                       type: number
 *               comment:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Validation error or order not eligible
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authMiddleware as any,
  buyerOnly as any,
  (req, res) => controller.createReview(req as any, res)
);

/**
 * @swagger
 * /api/reviews/{id}/photos:
 *   post:
 *     summary: Upload photos for a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Photos uploaded successfully
 *       400:
 *         description: Invalid file or limit exceeded
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/:id/photos",
  authMiddleware as any,
  buyerOnly as any,
  uploadPhotos as any,
  (req, res) => controller.uploadReviewPhotos(req as any, res)
);

/**
 * @swagger
 * /api/reviews/kitchen/{kitchenId}:
 *   get:
 *     summary: Get paginated reviews for a kitchen
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: kitchenId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of reviews
 */
router.get("/kitchen/:kitchenId", (req, res) =>
  controller.getKitchenReviews(req as any, res)
);

/**
 * @swagger
 * /api/reviews/kitchen/{kitchenId}/summary:
 *   get:
 *     summary: Get aggregated rating summary for a kitchen
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: kitchenId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rating summary
 */
router.get("/kitchen/:kitchenId/summary", (req, res) =>
  controller.getKitchenRatingSummary(req as any, res)
);

/**
 * @swagger
 * /api/reviews/my:
 *   get:
 *     summary: Get all reviews submitted by the authenticated buyer
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of buyer's reviews
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/my",
  authMiddleware as any,
  buyerOnly as any,
  (req, res) => controller.getMyReviews(req as any, res)
);

/**
 * @swagger
 * /api/reviews/{id}/reply:
 *   patch:
 *     summary: Add a cook's reply to a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reply
 *             properties:
 *               reply:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply added successfully
 *       400:
 *         description: Already replied or not your kitchen
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/:id/reply",
  authMiddleware as any,
  cookOnly as any,
  (req, res) => controller.addCookReply(req as any, res)
);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review (buyer only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/:id",
  authMiddleware as any,
  buyerOnly as any,
  (req, res) => controller.updateReview(req as any, res)
);

router.put(
  "/:id/reply",
  authMiddleware as any,
  cookOnly as any,
  (req, res) => controller.updateCookReply(req as any, res)
);

router.delete(
  "/:id/reply",
  authMiddleware as any,
  cookOnly as any,
  (req, res) => controller.deleteCookReply(req as any, res)
);

router.delete(
  "/:id",
  authMiddleware as any,
  buyerOnly as any,
  (req, res) => controller.deleteReview(req as any, res)
);

export default router;
