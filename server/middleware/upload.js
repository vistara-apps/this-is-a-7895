import multer from 'multer';
import sharp from 'sharp';
import { createError } from './errorHandler.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, 400), false);
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1
  }
});

/**
 * Middleware to process and optimize uploaded images
 */
export const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    // Get image metadata
    const metadata = await sharp(req.file.buffer).metadata();
    
    // Optimize image
    const optimizedBuffer = await sharp(req.file.buffer)
      .resize(1024, 1024, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 85,
        progressive: true 
      })
      .toBuffer();

    // Add processed image data to request
    req.processedImage = {
      buffer: optimizedBuffer,
      originalName: req.file.originalname,
      mimeType: 'image/jpeg',
      size: optimizedBuffer.length,
      dimensions: {
        width: metadata.width,
        height: metadata.height
      }
    };

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    return createError('Failed to process image', 400);
  }
};

/**
 * Validate image dimensions and content
 */
export const validateImage = (req, res, next) => {
  if (!req.file) {
    return createError('Image file is required', 400);
  }

  // Additional validation can be added here
  // e.g., check for inappropriate content, minimum dimensions, etc.
  
  next();
};
