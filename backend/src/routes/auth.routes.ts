import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validator';
import { authLimiter } from '../middlewares/rateLimiter';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../utils/schemas';

const router = Router();
const controller = new AuthController();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user — sends a 6-digit OTP to the user's email
 * @access  Public
 */
router.post('/register', authLimiter, validate(registerSchema), controller.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticates user, sets refresh-token cookie, returns accessToken
 * @access  Public
 */
router.post('/login', authLimiter, validate(loginSchema), controller.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Issue a new accessToken from a valid refreshToken cookie
 * @access  Public
 */
router.post('/refresh', controller.refresh);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email using 6-digit OTP  { email, otp }
 * @access  Public
 */
router.post('/verify-email', validate(verifyEmailSchema), controller.verifyEmail);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Re-send verification OTP to user's email  { email }
 * @access  Public
 */
router.post('/resend-otp', authLimiter, validate(resendOTPSchema), controller.resendOTP);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send 6-digit password reset OTP to user's email  { email }
 * @access  Public
 */
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), controller.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using OTP  { email, otp, password }
 * @access  Public
 */
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), controller.resetPassword);

export default router;
