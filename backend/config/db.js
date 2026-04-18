const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    const message = 'MONGO_URI is not set. Add your MongoDB Atlas connection string to the environment.';
    if (process.env.NODE_ENV === 'production') {
      throw new Error(message);
    }

    console.warn(`${message} Database-backed features are disabled in local development.`);
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    if (process.env.NODE_ENV === 'production') throw err;
  }
};

module.exports = connectDB;
