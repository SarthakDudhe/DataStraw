import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGODBURL;

  if (!uri) {
    console.error('CRITICAL: MONGODB_URI is not defined in environment variables.');
    throw new Error('MONGODB_URI is missing');
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'support_crm',
    });
    console.log(`MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    throw error;
  }
};
