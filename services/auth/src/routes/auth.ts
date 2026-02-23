import express from "express";
import {
  register,
  login,
  verifyOtp,
  refreshToken,
  resendOtp,
} from "../controllers/auth.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  validateRegisterRequest,
  validateLoginRequest,
  validateVerifyOtpRequest,
  validateRefreshTokenRequest,
  validateResendOtpRequest,
} from "../validators/auth.validator.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful, OTP sent
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or phone already exists
 */
router.post("/register", validate(validateRegisterRequest), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful, returns user and tokens
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account not verified or deactivated
 */
router.post("/login", validate(validateLoginRequest), login);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for account verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified, returns user and tokens
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify-otp", validate(validateVerifyOtpRequest), verifyOtp);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: New token pair returned
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  "/refresh-token",
  validate(validateRefreshTokenRequest),
  refreshToken
);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP to the user's email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendOtpRequest'
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       400:
 *         description: Account already verified
 *       404:
 *         description: User not found
 */
router.post("/resend-otp", validate(validateResendOtpRequest), resendOtp);

export default router;
