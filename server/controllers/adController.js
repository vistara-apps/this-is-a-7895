import { v4 as uuidv4 } from 'uuid';
import AdGeneration from '../models/AdGeneration.js';
import User from '../models/User.js';
import { generateAdVariations, calculateGenerationCost } from '../services/openaiService.js';
import { uploadToStorage } from '../services/storageService.js';
import { postToSocialMedia } from '../services/socialMediaService.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';

/**
 * Generate ad variations from uploaded image
 * @route POST /api/ads/generate
 * @access Private
 */
export const generateAds = asyncHandler(async (req, res) => {
  const {
    platforms = ['Instagram'],
    style = 'balanced',
    angles = ['performance'],
    variationCount = 3,
    targetAudience,
    productCategory,
    brandVoice
  } = req.body;

  if (!req.file) {
    return createError('Image file is required', 400);
  }

  try {
    // Upload image to storage
    const imageURL = await uploadToStorage(req.file, `ads/${req.user._id}/${uuidv4()}`);
    
    // Calculate estimated cost
    const estimatedCost = calculateGenerationCost({
      variationCount,
      platforms,
      useImageAnalysis: false
    });

    // Create generation record
    const generationId = uuidv4();
    const generation = new AdGeneration({
      generationId,
      userId: req.user._id,
      inputImageURL: imageURL,
      inputImageMetadata: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        dimensions: req.processedImage?.dimensions
      },
      generationConfig: {
        platforms,
        style,
        angles,
        variationCount,
        targetAudience,
        productCategory,
        brandVoice
      },
      status: 'processing',
      totalCost: estimatedCost
    });

    await generation.save();

    // Generate variations using OpenAI
    const variations = await generateAdVariations({
      imageURL,
      platforms,
      style,
      angles,
      variationCount,
      targetAudience,
      productCategory,
      brandVoice
    });

    // Add variation IDs and save
    const processedVariations = variations.map(variation => ({
      ...variation,
      variationId: uuidv4(),
      generationId
    }));

    generation.generatedVariations = processedVariations;
    generation.status = 'completed';
    await generation.save();

    res.status(201).json({
      success: true,
      message: 'Ad variations generated successfully',
      data: {
        generation: {
          id: generation._id,
          generationId: generation.generationId,
          inputImageURL: generation.inputImageURL,
          generatedVariations: generation.generatedVariations,
          generationConfig: generation.generationConfig,
          status: generation.status,
          totalCost: generation.totalCost,
          createdAt: generation.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Ad generation error:', error);
    
    // Update generation status to failed if it exists
    try {
      await AdGeneration.findOneAndUpdate(
        { generationId },
        { 
          status: 'failed',
          errorMessage: error.message 
        }
      );
    } catch (updateError) {
      console.error('Failed to update generation status:', updateError);
    }

    throw error;
  }
});

/**
 * Get user's ad generations with pagination
 * @route GET /api/ads
 * @access Private
 */
export const getGenerations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  // Build query
  const query = { userId: req.user._id, isArchived: false };
  if (status) {
    query.status = status;
  }

  // Get total count
  const total = await AdGeneration.countDocuments(query);

  // Get generations
  const generations = await AdGeneration.find(query)
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-generatedVariations.aiPrompt'); // Exclude AI prompts for privacy

  res.json({
    success: true,
    data: {
      generations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

/**
 * Get specific ad generation
 * @route GET /api/ads/:id
 * @access Private
 */
export const getGeneration = asyncHandler(async (req, res) => {
  const generation = await AdGeneration.findOne({
    _id: req.params.id,
    userId: req.user._id
  }).select('-generatedVariations.aiPrompt');

  if (!generation) {
    return createError('Ad generation not found', 404);
  }

  res.json({
    success: true,
    data: { generation }
  });
});

/**
 * Delete ad generation
 * @route DELETE /api/ads/:id
 * @access Private
 */
export const deleteGeneration = asyncHandler(async (req, res) => {
  const generation = await AdGeneration.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!generation) {
    return createError('Ad generation not found', 404);
  }

  // Soft delete by archiving
  generation.isArchived = true;
  generation.status = 'archived';
  await generation.save();

  res.json({
    success: true,
    message: 'Ad generation deleted successfully'
  });
});

/**
 * Update ad variation content
 * @route PUT /api/ads/:generationId/variations/:variationId
 * @access Private
 */
export const updateVariation = asyncHandler(async (req, res) => {
  const { generationId, variationId } = req.params;
  const { adContent } = req.body;

  const generation = await AdGeneration.findOne({
    _id: generationId,
    userId: req.user._id
  });

  if (!generation) {
    return createError('Ad generation not found', 404);
  }

  const variation = generation.getVariation(variationId);
  if (!variation) {
    return createError('Ad variation not found', 404);
  }

  // Update variation content
  if (adContent) {
    variation.adContent = { ...variation.adContent.toObject(), ...adContent };
  }

  await generation.save();

  res.json({
    success: true,
    message: 'Ad variation updated successfully',
    data: { variation }
  });
});

/**
 * Post variation to social media
 * @route POST /api/ads/:generationId/variations/:variationId/post
 * @access Private
 */
export const postVariationToSocial = asyncHandler(async (req, res) => {
  const { generationId, variationId } = req.params;
  const { platform, accountId, scheduleAt } = req.body;

  const generation = await AdGeneration.findOne({
    _id: generationId,
    userId: req.user._id
  });

  if (!generation) {
    return createError('Ad generation not found', 404);
  }

  const variation = generation.getVariation(variationId);
  if (!variation) {
    return createError('Ad variation not found', 404);
  }

  // Check if user has connected social account
  const user = await User.findById(req.user._id);
  const socialAccount = user.connectedSocialAccounts.find(
    account => account.platform === platform && account.accountId === accountId
  );

  if (!socialAccount) {
    return createError(`${platform} account not connected`, 400);
  }

  if (!socialAccount.isActive) {
    return createError(`${platform} account is not active`, 400);
  }

  try {
    // Post to social media
    const postResult = await postToSocialMedia({
      platform,
      accountId,
      accessToken: socialAccount.accessToken,
      content: variation.adContent,
      scheduleAt
    });

    // Update variation status
    if (scheduleAt) {
      variation.status = 'scheduled';
      variation.scheduledAt = new Date(scheduleAt);
    } else {
      variation.status = 'posted';
      variation.postedAt = new Date();
    }

    variation.postId = postResult.postId;
    variation.postURL = postResult.postURL;

    await generation.save();

    res.json({
      success: true,
      message: scheduleAt ? 'Ad variation scheduled successfully' : 'Ad variation posted successfully',
      data: {
        variation,
        postResult
      }
    });

  } catch (error) {
    console.error('Social media posting error:', error);
    
    // Update variation with error
    variation.status = 'failed';
    variation.errorMessage = error.message;
    variation.retryCount = (variation.retryCount || 0) + 1;
    
    await generation.save();

    throw createError(`Failed to post to ${platform}: ${error.message}`, 500);
  }
});

/**
 * Get user's ad generation statistics
 * @route GET /api/ads/stats
 * @access Private
 */
export const getAdStats = asyncHandler(async (req, res) => {
  const stats = await AdGeneration.getUserStats(req.user._id);
  
  // Get current month usage
  const user = await User.findById(req.user._id);
  const currentUsage = user.currentUsage;
  const usageLimits = user.getUsageLimits();

  res.json({
    success: true,
    data: {
      stats: {
        ...stats,
        currentUsage,
        usageLimits,
        usagePercentage: {
          adGenerations: usageLimits.adGenerations === -1 ? 0 : 
            Math.round((currentUsage.adGenerations / usageLimits.adGenerations) * 100),
          socialPosts: usageLimits.socialPosts === -1 ? 0 : 
            Math.round((currentUsage.socialPosts / usageLimits.socialPosts) * 100)
        }
      }
    }
  });
});

/**
 * Retry failed ad generation
 * @route POST /api/ads/:id/retry
 * @access Private
 */
export const retryGeneration = asyncHandler(async (req, res) => {
  const generation = await AdGeneration.findOne({
    _id: req.params.id,
    userId: req.user._id,
    status: 'failed'
  });

  if (!generation) {
    return createError('Failed ad generation not found', 404);
  }

  // Check usage limits
  const user = await User.findById(req.user._id);
  if (!user.canPerformAction('adGenerations')) {
    return createError('Usage limit exceeded', 429);
  }

  try {
    generation.status = 'processing';
    generation.errorMessage = undefined;
    await generation.save();

    // Retry generation
    const variations = await generateAdVariations({
      imageURL: generation.inputImageURL,
      ...generation.generationConfig
    });

    const processedVariations = variations.map(variation => ({
      ...variation,
      variationId: uuidv4(),
      generationId: generation.generationId
    }));

    generation.generatedVariations = processedVariations;
    generation.status = 'completed';
    await generation.save();

    // Increment usage
    await user.incrementUsage('adGenerations');

    res.json({
      success: true,
      message: 'Ad generation retried successfully',
      data: { generation }
    });

  } catch (error) {
    generation.status = 'failed';
    generation.errorMessage = error.message;
    await generation.save();
    
    throw error;
  }
});
