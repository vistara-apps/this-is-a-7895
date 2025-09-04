/**
 * AI Prompt Templates for Ad Generation
 * These templates are optimized for different platforms and marketing angles
 */

/**
 * Get prompt template based on platform and angle
 */
export const getPromptTemplate = (platform, angle, options = {}) => {
  const {
    style = 'balanced',
    targetAudience = 'general consumers',
    productCategory = 'product',
    brandVoice = 'professional'
  } = options;

  const baseContext = `
Platform: ${platform}
Style: ${style}
Target Audience: ${targetAudience}
Product Category: ${productCategory}
Brand Voice: ${brandVoice}
Marketing Angle: ${angle}
`;

  const platformSpecs = getPlatformSpecifications(platform);
  const anglePrompt = getAnglePrompt(angle);
  const stylePrompt = getStylePrompt(style);

  return `${baseContext}

${platformSpecs}

${anglePrompt}

${stylePrompt}

Create compelling ad copy that:
1. Follows ${platform} best practices and character limits
2. Uses the ${angle} marketing angle effectively
3. Matches the ${style} style and ${brandVoice} brand voice
4. Appeals to ${targetAudience}
5. Includes relevant hashtags for ${platform}

Return a JSON object with this exact structure:
{
  "headline": "Compelling headline under character limit",
  "description": "Engaging description that drives action",
  "callToAction": "Strong CTA button text",
  "hashtags": ["relevant", "hashtags", "for", "platform"],
  "tone": "professional|casual|playful|urgent|inspiring",
  "targetAudience": "refined target audience description"
}

Make it unique, engaging, and optimized for conversions.`;
};

/**
 * Platform-specific specifications and best practices
 */
const getPlatformSpecifications = (platform) => {
  const specs = {
    Instagram: `
INSTAGRAM SPECIFICATIONS:
- Headline: Max 125 characters (appears in feed)
- Description: Max 2,200 characters (but first 125 chars are most important)
- Hashtags: 5-10 relevant hashtags, mix of popular and niche
- Visual focus: High-quality, aesthetic imagery
- Tone: Authentic, visual storytelling, lifestyle-focused
- Best practices: Use emojis, ask questions, encourage engagement
- CTA: "Learn More", "Shop Now", "Sign Up", "Download"`,

    TikTok: `
TIKTOK SPECIFICATIONS:
- Headline: Max 100 characters (video title)
- Description: Max 150 characters (brief, punchy)
- Hashtags: 3-5 trending and relevant hashtags
- Visual focus: Dynamic, entertaining, authentic content
- Tone: Fun, trendy, authentic, conversational
- Best practices: Use trending sounds/effects, be entertaining first
- CTA: "Try This", "Get Yours", "Join Now", "Watch More"`,

    Facebook: `
FACEBOOK SPECIFICATIONS:
- Headline: Max 125 characters
- Description: Max 2,200 characters (but keep it concise)
- Hashtags: 1-3 hashtags (less important than other platforms)
- Visual focus: Clear, professional imagery
- Tone: Informative, trustworthy, community-focused
- Best practices: Tell a story, use social proof, be informative
- CTA: "Learn More", "Shop Now", "Sign Up", "Contact Us"`,

    Twitter: `
TWITTER SPECIFICATIONS:
- Headline: Max 280 characters (combined with description)
- Description: Keep total under 280 characters
- Hashtags: 1-2 relevant hashtags
- Visual focus: Clean, simple imagery
- Tone: Concise, witty, newsworthy
- Best practices: Be concise, use threads for longer content
- CTA: "Learn More", "Join", "Try Now", "Read More"`
  };

  return specs[platform] || specs.Instagram;
};

/**
 * Marketing angle-specific prompts
 */
const getAnglePrompt = (angle) => {
  const angles = {
    performance: `
PERFORMANCE ANGLE:
Focus on results, benefits, and measurable outcomes. Highlight:
- Specific benefits and results users can expect
- Performance metrics, statistics, or improvements
- Problem-solving capabilities
- Efficiency and effectiveness
- ROI and value proposition
Use data-driven language and concrete benefits.`,

    emotional: `
EMOTIONAL ANGLE:
Connect with feelings and aspirations. Highlight:
- How the product makes users feel
- Lifestyle improvements and aspirations
- Personal transformation stories
- Emotional benefits and satisfaction
- Dreams and desires fulfillment
Use emotive language and storytelling.`,

    urgency: `
URGENCY ANGLE:
Create immediate action through scarcity and time pressure. Highlight:
- Limited time offers or availability
- Exclusive access or early bird benefits
- Consequences of waiting or missing out
- Immediate action rewards
- Time-sensitive opportunities
Use action-oriented language and FOMO tactics.`,

    'social-proof': `
SOCIAL PROOF ANGLE:
Leverage community and testimonials. Highlight:
- User testimonials and success stories
- Popular trends and widespread adoption
- Expert endorsements and reviews
- Community membership benefits
- Peer recommendations and social validation
Use credibility indicators and community language.`,

    educational: `
EDUCATIONAL ANGLE:
Inform and teach while promoting. Highlight:
- How-to information and tutorials
- Industry insights and tips
- Problem identification and solutions
- Educational value and learning outcomes
- Expert knowledge sharing
Use informative language and value-first approach.`
  };

  return angles[angle] || angles.performance;
};

/**
 * Style-specific prompts
 */
const getStylePrompt = (style) => {
  const styles = {
    balanced: `
BALANCED STYLE:
Create well-rounded copy that balances professionalism with approachability:
- Professional yet friendly tone
- Clear value proposition with emotional appeal
- Informative but not overwhelming
- Trustworthy and credible
- Accessible to broad audience`,

    creative: `
CREATIVE STYLE:
Push boundaries with innovative and attention-grabbing copy:
- Unique angles and unexpected approaches
- Creative wordplay and memorable phrases
- Bold statements and standout messaging
- Artistic and imaginative language
- Risk-taking and differentiated positioning`,

    performance: `
PERFORMANCE STYLE:
Focus on conversion optimization and direct response:
- Clear, direct messaging
- Strong value propositions
- Compelling calls-to-action
- Benefit-focused language
- Conversion-optimized structure`
  };

  return styles[style] || styles.balanced;
};

/**
 * Get hashtag suggestions for platform
 */
export const getHashtagSuggestions = (platform, category, audience) => {
  const suggestions = {
    Instagram: {
      general: ['#innovation', '#lifestyle', '#quality', '#design', '#trending'],
      tech: ['#tech', '#innovation', '#digital', '#future', '#gadgets'],
      fashion: ['#fashion', '#style', '#ootd', '#trendy', '#chic'],
      fitness: ['#fitness', '#health', '#workout', '#wellness', '#motivation'],
      food: ['#foodie', '#delicious', '#healthy', '#recipe', '#yummy']
    },
    TikTok: {
      general: ['#fyp', '#viral', '#trending', '#musthave', '#amazing'],
      tech: ['#tech', '#techtok', '#innovation', '#gadgets', '#future'],
      fashion: ['#fashion', '#style', '#outfit', '#trendy', '#ootd'],
      fitness: ['#fitness', '#workout', '#health', '#motivation', '#gym'],
      food: ['#food', '#recipe', '#cooking', '#foodtok', '#yummy']
    }
  };

  const platformSuggestions = suggestions[platform] || suggestions.Instagram;
  return platformSuggestions[category] || platformSuggestions.general;
};

/**
 * Get CTA suggestions based on platform and goal
 */
export const getCTASuggestions = (platform, goal = 'conversion') => {
  const ctas = {
    Instagram: {
      conversion: ['Shop Now', 'Get Yours', 'Learn More', 'Sign Up'],
      engagement: ['Double Tap', 'Save This', 'Share', 'Comment'],
      awareness: ['Discover', 'Explore', 'See More', 'Find Out']
    },
    TikTok: {
      conversion: ['Try This', 'Get It Now', 'Join Now', 'Download'],
      engagement: ['Like & Follow', 'Duet This', 'Share', 'Comment'],
      awareness: ['Watch More', 'Check This Out', 'See How', 'Discover']
    },
    Facebook: {
      conversion: ['Learn More', 'Shop Now', 'Sign Up', 'Contact Us'],
      engagement: ['Like & Share', 'Comment', 'Join Group', 'Follow'],
      awareness: ['Read More', 'Discover', 'Explore', 'Find Out']
    }
  };

  const platformCTAs = ctas[platform] || ctas.Instagram;
  return platformCTAs[goal] || platformCTAs.conversion;
};

/**
 * Validate generated content against platform requirements
 */
export const validateContent = (content, platform) => {
  const limits = {
    Instagram: { headline: 125, description: 2200 },
    TikTok: { headline: 100, description: 150 },
    Facebook: { headline: 125, description: 2200 },
    Twitter: { headline: 280, description: 280 }
  };

  const platformLimits = limits[platform] || limits.Instagram;
  const errors = [];

  if (content.headline && content.headline.length > platformLimits.headline) {
    errors.push(`Headline too long: ${content.headline.length}/${platformLimits.headline} characters`);
  }

  if (content.description && content.description.length > platformLimits.description) {
    errors.push(`Description too long: ${content.description.length}/${platformLimits.description} characters`);
  }

  if (content.hashtags && content.hashtags.length > 10) {
    errors.push(`Too many hashtags: ${content.hashtags.length}/10 maximum`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
