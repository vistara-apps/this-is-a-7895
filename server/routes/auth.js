import express from 'express';
import { body } from 'express-validator';
import { 
  register, 
  login, 
  logout, 
  getProfile, 
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
} from '../controllers/authController.js';
import { authenticate, authRateLimit } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('preferences.defaultPlatforms')
    .optional()
    .isArray()
    .withMessage('Default platforms must be an array'),
  body('preferences.defaultStyle')
    .optional()
    .isIn(['balanced', 'creative', 'performance'])
    .withMessage('Default style must be balanced, creative, or performance'),
  body('preferences.emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean')
];

// Public routes (no authentication required)
router.post('/register', authRateLimit(), registerValidation, validate, register);
router.post('/login', authRateLimit(), loginValidation, validate, login);
router.post('/forgot-password', authRateLimit(), forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', authRateLimit(), resetPasswordValidation, validate, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes (authentication required)
router.use(authenticate); // All routes below require authentication

router.post('/logout', logout);
router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, validate, updateProfile);
router.put('/change-password', changePasswordValidation, validate, changePassword);
router.post('/resend-verification', authRateLimit(15 * 60 * 1000, 3), resendVerification);

export default router;
