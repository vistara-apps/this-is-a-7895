import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, createError } from './errorHandler.js';

/**
 * Generate JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Verify JWT token and authenticate user
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check for token in cookies (if using cookie-based auth)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return createError('Access denied. No token provided.', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return createError('Token is valid but user not found', 401);
    }

    if (!user.isActive) {
      return createError('User account is deactivated', 401);
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return createError('Token expired', 401);
    } else if (error.name === 'JsonWebTokenError') {
      return createError('Invalid token', 401);
    } else {
      return createError('Token verification failed', 401);
    }
  }
});

/**
 * Check if user has required subscription tier
 */
export const requireSubscription = (requiredTier) => {
  const tierLevels = { Free: 0, Basic: 1, Pro: 2 };
  
  return asyncHandler(async (req, res, next) => {
    const userTierLevel = tierLevels[req.user.subscription.tier] || 0;
    const requiredTierLevel = tierLevels[requiredTier] || 0;

    if (userTierLevel < requiredTierLevel) {
      return createError(`This feature requires ${requiredTier} subscription or higher`, 403);
    }

    next();
  });
};

/**
 * Check if user can perform action based on usage limits
 */
export const checkUsageLimit = (action) => {
  return asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    
    if (!user.canPerformAction(action)) {
      const limits = user.getUsageLimits();
      const currentUsage = user.currentUsage;
      
      return createError(
        `Usage limit exceeded. You have used ${currentUsage[action]}/${limits[action]} ${action} this month. Upgrade your plan for more.`,
        429
      );
    }

    next();
  });
};

/**
 * Increment user usage after successful action
 */
export const incrementUsage = (action) => {
  return asyncHandler(async (req, res, next) => {
    try {
      await req.user.incrementUsage(action);
      next();
    } catch (error) {
      console.error('Error incrementing usage:', error);
      // Don't fail the request if usage tracking fails
      next();
    }
  });
};

/**
 * Check if user has active subscription
 */
export const requireActiveSubscription = asyncHandler(async (req, res, next) => {
  if (req.user.subscription.status !== 'active' && req.user.subscription.tier !== 'Free') {
    return createError('Active subscription required for this feature', 402);
  }
  next();
});

/**
 * Admin only middleware
 */
export const requireAdmin = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return createError('Admin access required', 403);
  }
  next();
});

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
});

/**
 * Rate limiting for authentication endpoints
 */
export const authRateLimit = (windowMs = 15 * 60 * 1000, max = 5) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    if (!attempts.has(key)) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const attempt = attempts.get(key);
    
    if (now > attempt.resetTime) {
      attempt.count = 1;
      attempt.resetTime = now + windowMs;
      return next();
    }

    if (attempt.count >= max) {
      return createError('Too many authentication attempts. Please try again later.', 429);
    }

    attempt.count++;
    next();
  };
};

/**
 * Validate email verification
 */
export const requireEmailVerification = asyncHandler(async (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return createError('Email verification required. Please check your email and verify your account.', 403);
  }
  next();
});

/**
 * Check if user owns the resource
 */
export const checkResourceOwnership = (resourceModel, resourceIdParam = 'id') => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params[resourceIdParam];
    const resource = await resourceModel.findById(resourceId);

    if (!resource) {
      return createError('Resource not found', 404);
    }

    if (resource.userId.toString() !== req.user._id.toString()) {
      return createError('Access denied. You do not own this resource.', 403);
    }

    req.resource = resource;
    next();
  });
};
