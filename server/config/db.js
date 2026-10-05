const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/traveloop";

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || LOCAL_MONGO_URI;
  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(
      `⚠️ Primary MongoDB Atlas connection failed (${error.message}). Attempting local database fallback...`,
    );
    try {
      const conn = await mongoose.connect(LOCAL_MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(
        `✅ Connected to Local MongoDB Fallback: ${conn.connection.host}`,
      );
    } catch (fallbackErr) {
      console.error(`❌ DB Connection Error: Unable to connect to MongoDB.`);
      console.error(
        `👉 Solution A: Ensure local MongoDB service is running at mongodb://127.0.0.1:27017`,
      );
      console.error(
        `👉 Solution B: Whitelist your IP in MongoDB Atlas (https://www.mongodb.com/docs/atlas/security-whitelist/)`,
      );
      process.exit(1);
    }
  }
};

module.exports = connectDB;

// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI);
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
