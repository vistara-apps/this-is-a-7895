import OpenAI from 'openai';
import { createError } from '../middleware/errorHandler.js';
import { getPromptTemplate } from '../utils/promptTemplates.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate ad variations using OpenAI GPT-4
 */
export const generateAdVariations = async (config) => {
  const {
    imageURL,
    platforms = ['Instagram'],
    style = 'balanced',
    angles = ['performance'],
    variationCount = 3,
    targetAudience,
    productCategory,
    brandVoice
  } = config;

  if (!process.env.OPENAI_API_KEY) {
    throw createError('OpenAI API key not configured', 500);
  }

  try {
    const variations = [];

    // Generate variations for each platform and angle combination
    for (const platform of platforms) {
      for (const angle of angles) {
        if (variations.length >= variationCount) break;

        const prompt = getPromptTemplate(platform, angle, {
          style,
          targetAudience,
          productCategory,
          brandVoice
        });

        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert social media marketing copywriter specializing in creating high-converting ad variations. Always respond with valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.8,
          response_format: { type: 'json_object' }
        });

        const content = response.choices[0].message.content;
        const adData = JSON.parse(content);

        // Create variation object
        const variation = {
          platform,
          adContent: {
            headline: adData.headline || 'Discover Something Amazing',
            description: adData.description || 'Transform your experience with our innovative solution.',
            callToAction: adData.callToAction || 'Learn More',
            imageURL,
            hashtags: adData.hashtags || [],
            targetAudience: targetAudience || adData.targetAudience
          },
          generationConfig: {
            style,
            angle,
            tone: adData.tone || 'professional'
          },
          aiPrompt: prompt
        };

        variations.push(variation);
      }
    }

    // If we need more variations, generate additional ones with different styles
    while (variations.length < variationCount) {
      const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
      const randomAngle = angles[Math.floor(Math.random() * angles.length)];
      const randomStyle = ['balanced', 'creative', 'performance'][Math.floor(Math.random() * 3)];

      const prompt = getPromptTemplate(randomPlatform, randomAngle, {
        style: randomStyle,
        targetAudience,
        productCategory,
        brandVoice
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert social media marketing copywriter. Create unique, engaging ad copy. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.9,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content;
      const adData = JSON.parse(content);

      const variation = {
        platform: randomPlatform,
        adContent: {
          headline: adData.headline || 'Discover Something Amazing',
          description: adData.description || 'Transform your experience with our innovative solution.',
          callToAction: adData.callToAction || 'Learn More',
          imageURL,
          hashtags: adData.hashtags || [],
          targetAudience: targetAudience || adData.targetAudience
        },
        generationConfig: {
          style: randomStyle,
          angle: randomAngle,
          tone: adData.tone || 'professional'
        },
        aiPrompt: prompt
      };

      variations.push(variation);
    }

    return variations.slice(0, variationCount);

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    if (error.code === 'insufficient_quota') {
      throw createError('AI service quota exceeded. Please try again later.', 429);
    } else if (error.code === 'invalid_api_key') {
      throw createError('AI service configuration error', 500);
    } else if (error.code === 'rate_limit_exceeded') {
      throw createError('AI service rate limit exceeded. Please try again in a moment.', 429);
    } else {
      throw createError('Failed to generate ad variations. Please try again.', 500);
    }
  }
};

/**
 * Generate image variations using DALL-E (optional feature)
 */
export const generateImageVariations = async (imageURL, count = 2) => {
  if (!process.env.OPENAI_API_KEY) {
    throw createError('OpenAI API key not configured', 500);
  }

  try {
    const response = await openai.images.createVariation({
      image: imageURL,
      n: count,
      size: '1024x1024'
    });

    return response.data.map(img => img.url);

  } catch (error) {
    console.error('DALL-E API Error:', error);
    throw createError('Failed to generate image variations', 500);
  }
};

/**
 * Analyze image content for better ad generation
 */
export const analyzeImageContent = async (imageURL) => {
  if (!process.env.OPENAI_API_KEY) {
    throw createError('OpenAI API key not configured', 500);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this product image and provide insights for marketing. Return a JSON object with: productType, keyFeatures (array), suggestedAudience, marketingAngles (array), and brandStyle.'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageURL
              }
            }
          ]
        }
      ],
      max_tokens: 300,
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    return analysis;

  } catch (error) {
    console.error('Image Analysis Error:', error);
    // Return default analysis if vision API fails
    return {
      productType: 'product',
      keyFeatures: ['high quality', 'innovative design'],
      suggestedAudience: 'general consumers',
      marketingAngles: ['performance', 'emotional'],
      brandStyle: 'professional'
    };
  }
};

/**
 * Optimize ad copy for specific platform requirements
 */
export const optimizeForPlatform = async (adContent, platform) => {
  const platformLimits = {
    Instagram: { headline: 125, description: 2200 },
    TikTok: { headline: 100, description: 150 },
    Facebook: { headline: 125, description: 2200 },
    Twitter: { headline: 280, description: 280 }
  };

  const limits = platformLimits[platform] || platformLimits.Instagram;

  try {
    if (adContent.headline.length > limits.headline || adContent.description.length > limits.description) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Optimize this ad copy for ${platform}. Headline must be under ${limits.headline} characters, description under ${limits.description} characters. Maintain the core message and call-to-action. Return JSON format.`
          },
          {
            role: 'user',
            content: JSON.stringify(adContent)
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    }

    return adContent;

  } catch (error) {
    console.error('Platform optimization error:', error);
    // Return truncated version as fallback
    return {
      ...adContent,
      headline: adContent.headline.substring(0, limits.headline),
      description: adContent.description.substring(0, limits.description)
    };
  }
};

/**
 * Calculate estimated cost for generation
 */
export const calculateGenerationCost = (config) => {
  const { variationCount = 3, platforms = ['Instagram'], useImageAnalysis = false } = config;
  
  // Rough cost estimation (in cents)
  const baseCostPerVariation = 5; // ~$0.05 per variation
  const imageAnalysisCost = useImageAnalysis ? 10 : 0; // ~$0.10 for image analysis
  
  const totalCost = (variationCount * baseCostPerVariation) + imageAnalysisCost;
  
  return Math.max(totalCost, 1); // Minimum 1 cent
};

/**
 * Check if OpenAI service is available
 */
export const checkServiceHealth = async () => {
  try {
    const response = await openai.models.list();
    return {
      status: 'healthy',
      models: response.data.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};
