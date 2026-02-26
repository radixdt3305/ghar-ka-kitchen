import express from "express";
import {
  register,
  login,
  sendLoginOtp,
  verifyLoginOtp,
  verifyOtp,
  refreshToken,
  resendOtp,
  changePassword,
  getProfile,
  updateProfile,
} from "../controllers/auth.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  validateRegisterRequest,
  validateLoginRequest,
  validateSendOtpRequest,
  validateVerifyOtpRequest,
  validateVerifyLoginOtpRequest,
  validateRefreshTokenRequest,
  validateResendOtpRequest,
  validateChangePasswordRequest,
} from "../validators/auth.validator.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required: [name, email, phone]
 *       properties:
 *         name:
 *           type: string
 *           example: Ravi Kumar
 *         email:
 *           type: string
 *           example: ravi@example.com
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         password:
 *           type: string
 *           description: Optional. Required only if user wants email+password login (e.g. admin).
 *           example: Admin@1234
 *         role:
 *           type: string
 *           enum: [buyer, cook, admin, delivery]
 *           example: buyer
 *
 *     SendOtpRequest:
 *       type: object
 *       required: [phone]
 *       properties:
 *         phone:
 *           type: string
 *           example: "9876543210"
 *
 *     VerifyLoginOtpRequest:
 *       type: object
 *       required: [phone, otp]
 *       properties:
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         otp:
 *           type: string
 *           example: "482910"
 *
 *     VerifyOtpRequest:
 *       type: object
 *       required: [otp]
 *       properties:
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         email:
 *           type: string
 *           example: ravi@example.com
 *         otp:
 *           type: string
 *           example: "482910"
 *         purpose:
 *           type: string
 *           enum: [registration, password_reset, login]
 *
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           example: admin@gharkakitchen.com
 *         password:
 *           type: string
 *           example: Admin@1234
 *
 *     RefreshTokenRequest:
 *       type: object
 *       required: [refreshToken]
 *       properties:
 *         refreshToken:
 *           type: string
 *
 *     ResendOtpRequest:
 *       type: object
 *       properties:
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         email:
 *           type: string
 *           example: ravi@example.com
 *         purpose:
 *           type: string
 *           enum: [registration, password_reset, login]
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/UserResponse'
 *             accessToken:
 *               type: string
 *               description: JWT access token (15 min expiry). Include as Bearer token in Authorization header.
 *             refreshToken:
 *               type: string
 *               description: JWT refresh token (7 day expiry). Use to silently refresh access token.
 *
 *     UserResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         role:
 *           type: string
 *           enum: [buyer, cook, admin, delivery]
 *         isVerified:
 *           type: boolean
 *         isActive:
 *           type: boolean
 *
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: |
 *       Creates an unverified account and sends a 6-digit OTP to the user's **phone** via SMS.
 *       After registration, call `/verify-otp` with the phone + OTP to complete verification and receive tokens.
 *       Password is optional — phone+OTP is the primary auth method.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful — OTP sent to phone
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or phone already registered
 */
router.post("/register", validate(validateRegisterRequest), register);

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send login OTP to phone (primary login flow — Step 1)
 *     description: |
 *       Sends a 6-digit OTP via SMS to the given registered phone number.
 *       After receiving the OTP, call `/verify-login-otp` to complete login and receive JWT tokens.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendOtpRequest'
 *     responses:
 *       200:
 *         description: OTP sent to phone
 *       403:
 *         description: Account is deactivated
 *       404:
 *         description: No account found with this phone number
 */
router.post("/send-otp", validate(validateSendOtpRequest), sendLoginOtp);

/**
 * @swagger
 * /api/auth/verify-login-otp:
 *   post:
 *     summary: Verify login OTP and receive JWT tokens (primary login flow — Step 2)
 *     description: |
 *       Verifies the OTP sent to the phone number and returns authentication tokens.
 *       - **Access Token**: 15-min expiry. Send as `Authorization: Bearer <token>` on every authenticated request.
 *       - **Refresh Token**: 7-day expiry. Call `/refresh-token` silently when access token expires (HTTP 401).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyLoginOtpRequest'
 *     responses:
 *       200:
 *         description: Login successful — returns user and tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid or expired OTP / max attempts exceeded
 *       404:
 *         description: User not found
 */
router.post(
  "/verify-login-otp",
  validate(validateVerifyLoginOtpRequest),
  verifyLoginOtp
);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify registration OTP and activate account
 *     description: |
 *       Verifies the OTP sent during registration. Accepts either `phone` or `email` as identifier.
 *       Marks the account as verified and returns JWT tokens.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified — returns user and tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 */
router.post("/verify-otp", validate(validateVerifyOtpRequest), verifyOtp);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Email + password login (secondary flow — admin only)
 *     description: |
 *       Login using email and password. Intended for admin accounts only.
 *       Regular users should use the phone+OTP flow (`/send-otp` → `/verify-login-otp`).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful — returns user and tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Password login not available for this account
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account not verified or deactivated
 */
router.post("/login", validate(validateLoginRequest), login);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP to phone or email
 *     description: Resends a fresh OTP. Accepts either `phone` or `email` as identifier.
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
 *         description: Account already verified or invalid input
 *       404:
 *         description: User not found
 */
router.post("/resend-otp", validate(validateResendOtpRequest), resendOtp);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token
 *     description: |
 *       Exchanges a valid refresh token for a new access + refresh token pair (rotation).
 *       The old refresh token is invalidated immediately. Call this when you receive HTTP 401 on an authenticated request.
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
 *         description: Invalid, expired, or already-used refresh token
 */
router.post(
  "/refresh-token",
  validate(validateRefreshTokenRequest),
  refreshToken
);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     description: |
 *       Requires authentication. User provides current password and new password.
 *       For phone-only users (no password set), current password is ignored and the new password is set directly.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "OldPass@123"
 *               newPassword:
 *                 type: string
 *                 example: "NewPass@456"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post(
  "/change-password",
  authenticate,
  validate(validateChangePasswordRequest),
  changePassword
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authenticate, getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               avatar:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", authenticate, updateProfile);

export default router;
