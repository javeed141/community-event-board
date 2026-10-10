import mongoose from 'mongoose';

const connectDb = async () => {
  try {
    // If already connected or connecting, do nothing
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI || '', {
      dbName: 'community_events',
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Call it directly right here in the file
connectDb();

export default connectDb;
