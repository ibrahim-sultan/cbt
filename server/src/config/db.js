import mongoose from 'mongoose';

const connectDB = async () => {
  if (process.env.SKIP_DB === 'true' || process.env.SKIP_DB === '1') {
    console.warn('SKIP_DB is set. Skipping MongoDB connection.');
    return;
  }
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cbt';
  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI not set. Falling back to local mongodb://127.0.0.1:27017/cbt');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected');
};

export default connectDB;
