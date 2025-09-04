import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 */
export const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_TEST_URI 
      : process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI, {
      // Remove deprecated options
      // useNewUrlParser and useUnifiedTopology are no longer needed in Mongoose 6+
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📦 MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📦 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB (useful for testing)
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('📦 MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
  }
};

/**
 * Clear database (useful for testing)
 */
export const clearDB = async () => {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    console.log('🧹 Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
  }
};
