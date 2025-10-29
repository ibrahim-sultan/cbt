import mongoose from 'mongoose';

const connectDB = async () => {
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

  if (process.env.SKIP_DB === 'true' || process.env.SKIP_DB === '1') {
    console.warn('SKIP_DB is set. Skipping MongoDB connection.');
    return;
  }

  const isProd = process.env.NODE_ENV === 'production';
  if (!process.env.MONGO_URI) {
    if (isProd) {
      throw new Error('MONGO_URI is required in production. Set it in your hosting env vars.');
    }
    console.warn('MONGO_URI not set. Falling back to local mongodb://127.0.0.1:27017/cbt');
  }

  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cbt';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('✅ MongoDB connected successfully');
};

export default connectDB;
