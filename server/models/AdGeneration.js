import mongoose from 'mongoose';

const adContentSchema = new mongoose.Schema({
  headline: {
    type: String,
    required: true,
    maxlength: [100, 'Headline cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  callToAction: {
    type: String,
    required: true,
    maxlength: [30, 'Call to action cannot exceed 30 characters']
  },
  imageURL: {
    type: String,
    required: true
  },
  hashtags: [{
    type: String,
    maxlength: [50, 'Hashtag cannot exceed 50 characters']
  }],
  targetAudience: {
    type: String,
    maxlength: [200, 'Target audience cannot exceed 200 characters']
  }
});

const metricsSchema = new mongoose.Schema({
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  clicks: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  shares: {
    type: Number,
    default: 0,
    min: 0
  },
  comments: {
    type: Number,
    default: 0,
    min: 0
  },
  engagement: {
    type: Number,
    default: 0,
    min: 0,
    max: 100 // Engagement rate as percentage
  },
  ctr: {
    type: Number,
    default: 0,
    min: 0,
    max: 100 // Click-through rate as percentage
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const adVariationSchema = new mongoose.Schema({
  variationId: {
    type: String,
    required: true,
    unique: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['Instagram', 'TikTok', 'Facebook', 'Twitter']
  },
  adContent: {
    type: adContentSchema,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'posted', 'failed', 'archived'],
    default: 'draft'
  },
  scheduledAt: Date,
  postedAt: Date,
  postId: String, // Platform-specific post ID
  postURL: String, // Direct link to the post
  metrics: {
    type: metricsSchema,
    default: () => ({})
  },
  aiPrompt: {
    type: String,
    select: false // Don't include in regular queries for privacy
  },
  generationConfig: {
    style: {
      type: String,
      enum: ['balanced', 'creative', 'performance'],
      default: 'balanced'
    },
    angle: {
      type: String,
      enum: ['performance', 'emotional', 'urgency', 'social-proof', 'educational'],
      default: 'performance'
    },
    tone: {
      type: String,
      enum: ['professional', 'casual', 'playful', 'urgent', 'inspiring'],
      default: 'professional'
    }
  },
  errorMessage: String, // Store error if posting failed
  retryCount: {
    type: Number,
    default: 0,
    max: 3
  }
}, {
  timestamps: true
});

const adGenerationSchema = new mongoose.Schema({
  generationId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inputImageURL: {
    type: String,
    required: true
  },
  inputImageMetadata: {
    originalName: String,
    size: Number,
    mimeType: String,
    dimensions: {
      width: Number,
      height: Number
    }
  },
  generatedVariations: [adVariationSchema],
  generationConfig: {
    platforms: [{
      type: String,
      enum: ['Instagram', 'TikTok', 'Facebook', 'Twitter']
    }],
    style: {
      type: String,
      enum: ['balanced', 'creative', 'performance'],
      default: 'balanced'
    },
    angles: [{
      type: String,
      enum: ['performance', 'emotional', 'urgency', 'social-proof', 'educational']
    }],
    variationCount: {
      type: Number,
      min: 1,
      max: 10,
      default: 3
    },
    targetAudience: String,
    productCategory: String,
    brandVoice: String
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed', 'archived'],
    default: 'processing'
  },
  processingTime: {
    type: Number, // Time in milliseconds
    default: 0
  },
  totalCost: {
    type: Number, // Cost in cents
    default: 0
  },
  errorMessage: String,
  tags: [{
    type: String,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
adGenerationSchema.index({ userId: 1, createdAt: -1 });
adGenerationSchema.index({ generationId: 1 });
adGenerationSchema.index({ status: 1 });
adGenerationSchema.index({ 'generatedVariations.variationId': 1 });
adGenerationSchema.index({ 'generatedVariations.platform': 1 });
adGenerationSchema.index({ 'generatedVariations.status': 1 });
adGenerationSchema.index({ tags: 1 });
adGenerationSchema.index({ createdAt: -1 });

// Virtual for total variations count
adGenerationSchema.virtual('totalVariations').get(function() {
  return this.generatedVariations.length;
});

// Virtual for posted variations count
adGenerationSchema.virtual('postedVariations').get(function() {
  return this.generatedVariations.filter(v => v.status === 'posted').length;
});

// Virtual for total engagement across all variations
adGenerationSchema.virtual('totalEngagement').get(function() {
  return this.generatedVariations.reduce((total, variation) => {
    const metrics = variation.metrics;
    return total + (metrics.likes + metrics.shares + metrics.comments);
  }, 0);
});

// Virtual for average engagement rate
adGenerationSchema.virtual('averageEngagementRate').get(function() {
  const postedVariations = this.generatedVariations.filter(v => v.status === 'posted');
  if (postedVariations.length === 0) return 0;
  
  const totalEngagement = postedVariations.reduce((total, variation) => {
    return total + variation.metrics.engagement;
  }, 0);
  
  return (totalEngagement / postedVariations.length).toFixed(2);
});

// Instance method to get variation by ID
adGenerationSchema.methods.getVariation = function(variationId) {
  return this.generatedVariations.find(v => v.variationId === variationId);
};

// Instance method to update variation metrics
adGenerationSchema.methods.updateVariationMetrics = function(variationId, metrics) {
  const variation = this.getVariation(variationId);
  if (variation) {
    variation.metrics = { ...variation.metrics.toObject(), ...metrics, lastUpdated: new Date() };
    return this.save();
  }
  throw new Error('Variation not found');
};

// Instance method to mark variation as posted
adGenerationSchema.methods.markVariationAsPosted = function(variationId, postData) {
  const variation = this.getVariation(variationId);
  if (variation) {
    variation.status = 'posted';
    variation.postedAt = new Date();
    variation.postId = postData.postId;
    variation.postURL = postData.postURL;
    return this.save();
  }
  throw new Error('Variation not found');
};

// Instance method to archive generation
adGenerationSchema.methods.archive = function() {
  this.isArchived = true;
  this.status = 'archived';
  return this.save();
};

// Static method to find by user with pagination
adGenerationSchema.statics.findByUserPaginated = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ userId, isArchived: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'firstName lastName email');
};

// Static method to get user statistics
adGenerationSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), isArchived: false } },
    {
      $group: {
        _id: null,
        totalGenerations: { $sum: 1 },
        totalVariations: { $sum: { $size: '$generatedVariations' } },
        totalPosted: {
          $sum: {
            $size: {
              $filter: {
                input: '$generatedVariations',
                cond: { $eq: ['$$this.status', 'posted'] }
              }
            }
          }
        },
        totalViews: {
          $sum: {
            $sum: '$generatedVariations.metrics.views'
          }
        },
        totalClicks: {
          $sum: {
            $sum: '$generatedVariations.metrics.clicks'
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalGenerations: 0,
    totalVariations: 0,
    totalPosted: 0,
    totalViews: 0,
    totalClicks: 0
  };
};

// Pre-save middleware to calculate processing time
adGenerationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.processingTime = Date.now() - this.createdAt.getTime();
  }
  next();
});

const AdGeneration = mongoose.model('AdGeneration', adGenerationSchema);

export default AdGeneration;
