import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import AdGeneration from '../models/AdGeneration.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/analytics/overview
 * @desc Get analytics overview
 * @access Private
 */
router.get('/overview', asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Get basic stats
  const stats = await AdGeneration.getUserStats(userId);
  
  // Get recent generations
  const recentGenerations = await AdGeneration.find({ 
    userId, 
    isArchived: false 
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('generationId inputImageURL status createdAt generatedVariations');

  // Calculate engagement metrics
  const totalEngagement = recentGenerations.reduce((total, gen) => {
    return total + gen.totalEngagement;
  }, 0);

  res.json({
    success: true,
    data: {
      stats: {
        ...stats,
        totalEngagement,
        averageEngagement: recentGenerations.length > 0 ? 
          Math.round(totalEngagement / recentGenerations.length) : 0
      },
      recentGenerations: recentGenerations.map(gen => ({
        id: gen._id,
        generationId: gen.generationId,
        inputImageURL: gen.inputImageURL,
        status: gen.status,
        variationCount: gen.generatedVariations.length,
        postedCount: gen.postedVariations,
        totalEngagement: gen.totalEngagement,
        createdAt: gen.createdAt
      }))
    }
  });
}));

/**
 * @route GET /api/analytics/performance
 * @desc Get performance analytics
 * @access Private
 */
router.get('/performance', asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { timeframe = '30d' } = req.query;
  
  // Calculate date range
  const now = new Date();
  const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
  
  // Get generations in timeframe
  const generations = await AdGeneration.find({
    userId,
    isArchived: false,
    createdAt: { $gte: startDate }
  });

  // Aggregate metrics by platform
  const platformMetrics = {};
  const dailyMetrics = {};
  
  generations.forEach(gen => {
    gen.generatedVariations.forEach(variation => {
      const platform = variation.platform;
      const date = variation.postedAt ? 
        variation.postedAt.toISOString().split('T')[0] : 
        gen.createdAt.toISOString().split('T')[0];
      
      // Platform metrics
      if (!platformMetrics[platform]) {
        platformMetrics[platform] = {
          totalPosts: 0,
          totalViews: 0,
          totalLikes: 0,
          totalShares: 0,
          totalComments: 0
        };
      }
      
      if (variation.status === 'posted') {
        platformMetrics[platform].totalPosts++;
        platformMetrics[platform].totalViews += variation.metrics.views || 0;
        platformMetrics[platform].totalLikes += variation.metrics.likes || 0;
        platformMetrics[platform].totalShares += variation.metrics.shares || 0;
        platformMetrics[platform].totalComments += variation.metrics.comments || 0;
      }
      
      // Daily metrics
      if (!dailyMetrics[date]) {
        dailyMetrics[date] = {
          date,
          generations: 0,
          posts: 0,
          views: 0,
          engagement: 0
        };
      }
      
      if (variation.status === 'posted') {
        dailyMetrics[date].posts++;
        dailyMetrics[date].views += variation.metrics.views || 0;
        dailyMetrics[date].engagement += 
          (variation.metrics.likes || 0) + 
          (variation.metrics.shares || 0) + 
          (variation.metrics.comments || 0);
      }
    });
    
    const date = gen.createdAt.toISOString().split('T')[0];
    if (dailyMetrics[date]) {
      dailyMetrics[date].generations++;
    }
  });

  res.json({
    success: true,
    data: {
      timeframe,
      platformMetrics,
      dailyMetrics: Object.values(dailyMetrics).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      ),
      summary: {
        totalGenerations: generations.length,
        totalPosts: Object.values(platformMetrics).reduce((sum, p) => sum + p.totalPosts, 0),
        totalViews: Object.values(platformMetrics).reduce((sum, p) => sum + p.totalViews, 0),
        totalEngagement: Object.values(platformMetrics).reduce((sum, p) => 
          sum + p.totalLikes + p.totalShares + p.totalComments, 0
        )
      }
    }
  });
}));

export default router;
