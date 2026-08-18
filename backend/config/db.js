const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  // If already connected, do not re-open connection
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_governance';

  try {
    // Attempt standard / Atlas connection with 5s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] Connected successfully to MongoDB at ${uri.split('@').pop()}`);
  } catch (err) {
    console.warn(`[Database] Could not connect to primary MongoDB (${err.message}). Starting MongoMemoryServer fallback...`);
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to In-Memory MongoDB at ${memoryUri}`);
    } catch (memErr) {
      console.error(`[Database] Failed to initialize in-memory MongoDB:`, memErr);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
