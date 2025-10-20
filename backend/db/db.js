const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/khoneymoon');
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}

connectDB();

module.exports = mongoose;