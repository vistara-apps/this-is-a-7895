import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { sendEmail } from '../services/emailService.js';

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return createError('User with this email already exists', 400);
  }

  // Create user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    emailVerificationToken: crypto.randomBytes(32).toString('hex')
  });

  // Generate JWT token
  const token = generateToken(user._id);

  // Send verification email
  try {
    await sendVerificationEmail(user);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Don't fail registration if email fails
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email to verify your account.',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        subscription: user.subscription,
        isEmailVerified: user.isEmailVerified
      },
      token
    }
  });
});

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findByEmail(email).select('+password');
  
  if (!user || !(await user.matchPassword(password))) {
    return createError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    return createError('Account is deactivated. Please contact support.', 401);
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Generate JWT token
  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        subscription: user.subscription,
        connectedSocialAccounts: user.connectedSocialAccounts,
        preferences: user.preferences,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt
      },
      token
    }
  });
});

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = asyncHandler(async (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // Here we could implement token blacklisting if needed
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * Get user profile
 * @route GET /api/auth/profile
 * @access Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('usage')
    .select('-password');

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        avatar: user.avatar,
        subscription: user.subscription,
        connectedSocialAccounts: user.connectedSocialAccounts,
        preferences: user.preferences,
        usage: user.usage,
        currentUsage: user.currentUsage,
        usageLimits: user.getUsageLimits(),
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }
    }
  });
});

/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, preferences } = req.body;

  const user = await User.findById(req.user._id);

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (preferences) {
    user.preferences = { ...user.preferences, ...preferences };
  }

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        preferences: user.preferences
      }
    }
  });
});

/**
 * Change password
 * @route PUT /api/auth/change-password
 * @access Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  if (!(await user.matchPassword(currentPassword))) {
    return createError('Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Forgot password
 * @route POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal if email exists or not
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  // Send reset email
  try {
    await sendPasswordResetEmail(user, resetToken);
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    return createError('Failed to send password reset email. Please try again.', 500);
  }

  res.json({
    success: true,
    message: 'Password reset link sent to your email'
  });
});

/**
 * Reset password
 * @route POST /api/auth/reset-password
 * @access Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // Hash token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return createError('Invalid or expired reset token', 400);
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Generate new JWT token
  const jwtToken = generateToken(user._id);

  res.json({
    success: true,
    message: 'Password reset successful',
    data: {
      token: jwtToken
    }
  });
});

/**
 * Verify email
 * @route GET /api/auth/verify-email/:token
 * @access Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({ emailVerificationToken: token });

  if (!user) {
    return createError('Invalid verification token', 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
});

/**
 * Resend verification email
 * @route POST /api/auth/resend-verification
 * @access Private
 */
export const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.isEmailVerified) {
    return createError('Email is already verified', 400);
  }

  // Generate new verification token
  user.emailVerificationToken = crypto.randomBytes(32).toString('hex');
  await user.save();

  // Send verification email
  try {
    await sendVerificationEmail(user);
  } catch (error) {
    return createError('Failed to send verification email. Please try again.', 500);
  }

  res.json({
    success: true,
    message: 'Verification email sent'
  });
});

/**
 * Helper function to send verification email
 */
const sendVerificationEmail = async (user) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${user.emailVerificationToken}`;
  
  const message = `
    <h1>Welcome to AdRemix!</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p>${verificationUrl}</p>
    <p>This link will expire in 24 hours.</p>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Verify Your AdRemix Account',
    html: message
  });
};

/**
 * Helper function to send password reset email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const message = `
    <h1>Password Reset Request</h1>
    <p>You requested a password reset for your AdRemix account.</p>
    <p>Please click the link below to reset your password:</p>
    <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p>${resetUrl}</p>
    <p>This link will expire in 10 minutes.</p>
    <p>If you didn't request this reset, please ignore this email.</p>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Reset Your AdRemix Password',
    html: message
  });
};
