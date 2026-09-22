const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // If no valid MONGO_URI is provided, fall back to a local persistent MongoDB instance.
    const isPlaceholder =
      !uri ||
      uri.includes("<username>") ||
      uri.includes("<password>") ||
      uri.trim() === "";

    if (isPlaceholder) {
      console.warn("[DB] MONGO_URI not set. Falling back to local MongoDB at mongodb://127.0.0.1:27017/mediqueue");
      uri = "mongodb://127.0.0.1:27017/mediqueue";
    }

    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
    
    if (isPlaceholder) {
        const seedTestUsers = require("../utils/seed");
        await seedTestUsers();
    }
  } catch (error) {
    console.log("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
