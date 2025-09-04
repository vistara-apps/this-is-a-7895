import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/social/accounts
 * @desc Get connected social media accounts
 * @access Private
 */
router.get('/accounts', asyncHandler(async (req, res) => {
  const user = req.user;
  
  res.json({
    success: true,
    data: {
      accounts: user.connectedSocialAccounts.map(account => ({
        id: account._id,
        platform: account.platform,
        username: account.username,
        isActive: account.isActive,
        connectedAt: account.connectedAt
      }))
    }
  });
}));

/**
 * @route POST /api/social/connect
 * @desc Connect a social media account (placeholder)
 * @access Private
 */
router.post('/connect', asyncHandler(async (req, res) => {
  // This would implement OAuth flow for social media platforms
  res.json({
    success: false,
    message: 'Social media connection not implemented yet. This requires OAuth integration with each platform.'
  });
}));

/**
 * @route DELETE /api/social/accounts/:id
 * @desc Disconnect a social media account
 * @access Private
 */
router.delete('/accounts/:id', asyncHandler(async (req, res) => {
  // This would remove the social account from user's connected accounts
  res.json({
    success: false,
    message: 'Social media disconnection not implemented yet.'
  });
}));

export default router;
