import express from 'express';
import { body } from 'express-validator';
import {
  generateAds,
  getGenerations,
  getGeneration,
  deleteGeneration,
  updateVariation,
  postVariationToSocial
} from '../controllers/adController.js';
import { 
  authenticate, 
  checkUsageLimit, 
  incrementUsage,
  requireEmailVerification 
} from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(requireEmailVerification);

// Validation rules
const generateAdsValidation = [
  body('platforms')
    .optional()
    .isArray()
    .withMessage('Platforms must be an array')
    .custom((platforms) => {
      const validPlatforms = ['Instagram', 'TikTok', 'Facebook', 'Twitter'];
      return platforms.every(platform => validPlatforms.includes(platform));
    })
    .withMessage('Invalid platform specified'),
  body('style')
    .optional()
    .isIn(['balanced', 'creative', 'performance'])
    .withMessage('Style must be balanced, creative, or performance'),
  body('angles')
    .optional()
    .isArray()
    .withMessage('Angles must be an array')
    .custom((angles) => {
      const validAngles = ['performance', 'emotional', 'urgency', 'social-proof', 'educational'];
      return angles.every(angle => validAngles.includes(angle));
    })
    .withMessage('Invalid angle specified'),
  body('variationCount')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Variation count must be between 1 and 10'),
  body('targetAudience')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Target audience must be under 200 characters'),
  body('productCategory')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Product category must be under 100 characters'),
  body('brandVoice')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Brand voice must be under 100 characters')
];

const updateVariationValidation = [
  body('adContent.headline')
    .optional()
    .isLength({ max: 125 })
    .withMessage('Headline must be under 125 characters'),
  body('adContent.description')
    .optional()
    .isLength({ max: 2200 })
    .withMessage('Description must be under 2200 characters'),
  body('adContent.callToAction')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Call to action must be under 30 characters'),
  body('adContent.hashtags')
    .optional()
    .isArray()
    .withMessage('Hashtags must be an array'),
  body('adContent.targetAudience')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Target audience must be under 200 characters')
];

/**
 * @route POST /api/ads/generate
 * @desc Generate ad variations from uploaded image
 * @access Private
 */
router.post('/generate', 
  checkUsageLimit('adGenerations'),
  upload.single('image'),
  generateAdsValidation,
  validate,
  generateAds,
  incrementUsage('adGenerations')
);

/**
 * @route GET /api/ads
 * @desc Get user's ad generations with pagination
 * @access Private
 */
router.get('/', getGenerations);

/**
 * @route GET /api/ads/:id
 * @desc Get specific ad generation
 * @access Private
 */
router.get('/:id', getGeneration);

/**
 * @route DELETE /api/ads/:id
 * @desc Delete ad generation
 * @access Private
 */
router.delete('/:id', deleteGeneration);

/**
 * @route PUT /api/ads/:generationId/variations/:variationId
 * @desc Update ad variation content
 * @access Private
 */
router.put('/:generationId/variations/:variationId',
  updateVariationValidation,
  validate,
  updateVariation
);

/**
 * @route POST /api/ads/:generationId/variations/:variationId/post
 * @desc Post variation to social media
 * @access Private
 */
router.post('/:generationId/variations/:variationId/post',
  checkUsageLimit('socialPosts'),
  body('platform')
    .isIn(['Instagram', 'TikTok', 'Facebook', 'Twitter'])
    .withMessage('Invalid platform'),
  body('accountId')
    .notEmpty()
    .withMessage('Account ID is required'),
  validate,
  postVariationToSocial,
  incrementUsage('socialPosts')
);

export default router;
