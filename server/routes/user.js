import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/user/dashboard
 * @desc Get user dashboard data
 * @access Private
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
  const user = req.user;
  
  // Get usage stats
  const currentUsage = user.currentUsage;
  const usageLimits = user.getUsageLimits();
  
  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        subscription: user.subscription,
        connectedSocialAccounts: user.connectedSocialAccounts.length
      },
      usage: {
        current: currentUsage,
        limits: usageLimits,
        percentage: {
          adGenerations: usageLimits.adGenerations === -1 ? 0 : 
            Math.round((currentUsage.adGenerations / usageLimits.adGenerations) * 100),
          socialPosts: usageLimits.socialPosts === -1 ? 0 : 
            Math.round((currentUsage.socialPosts / usageLimits.socialPosts) * 100)
        }
      }
    }
  });
}));

export default router;
