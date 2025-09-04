import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const socialAccountSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['Instagram', 'TikTok']
  },
  accountId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: String,
  tokenExpiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  connectedAt: {
    type: Date,
    default: Date.now
  }
});

const subscriptionSchema = new mongoose.Schema({
  tier: {
    type: String,
    enum: ['Free', 'Basic', 'Pro'],
    default: 'Free'
  },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'canceled', 'past_due', 'trialing'],
    default: 'inactive'
  },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  }
});

const usageSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true // Format: YYYY-MM
  },
  adGenerations: {
    type: Number,
    default: 0
  },
  socialPosts: {
    type: Number,
    default: 0
  }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  subscription: {
    type: subscriptionSchema,
    default: () => ({})
  },
  connectedSocialAccounts: [socialAccountSchema],
  usage: [usageSchema],
  preferences: {
    defaultPlatforms: {
      type: [String],
      enum: ['Instagram', 'TikTok'],
      default: ['Instagram']
    },
    defaultStyle: {
      type: String,
      enum: ['balanced', 'creative', 'performance'],
      default: 'balanced'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLoginAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ 'subscription.stripeCustomerId': 1 });
userSchema.index({ 'connectedSocialAccounts.platform': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for current month usage
userSchema.virtual('currentUsage').get(function() {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  return this.usage.find(u => u.month === currentMonth) || { adGenerations: 0, socialPosts: 0 };
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to get usage limits based on subscription tier
userSchema.methods.getUsageLimits = function() {
  const limits = {
    Free: { adGenerations: 5, socialPosts: 5 },
    Basic: { adGenerations: 50, socialPosts: 50 },
    Pro: { adGenerations: -1, socialPosts: -1 } // -1 means unlimited
  };
  
  return limits[this.subscription.tier] || limits.Free;
};

// Instance method to check if user can perform action
userSchema.methods.canPerformAction = function(action) {
  const limits = this.getUsageLimits();
  const currentUsage = this.currentUsage;
  
  if (limits[action] === -1) return true; // Unlimited
  
  return currentUsage[action] < limits[action];
};

// Instance method to increment usage
userSchema.methods.incrementUsage = async function(action) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  let monthlyUsage = this.usage.find(u => u.month === currentMonth);
  
  if (!monthlyUsage) {
    monthlyUsage = { month: currentMonth, adGenerations: 0, socialPosts: 0 };
    this.usage.push(monthlyUsage);
  }
  
  monthlyUsage[action] += 1;
  
  return await this.save();
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find users with active subscriptions
userSchema.statics.findActiveSubscribers = function() {
  return this.find({ 'subscription.status': 'active' });
};

const User = mongoose.model('User', userSchema);

export default User;
