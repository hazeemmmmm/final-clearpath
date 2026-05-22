import mongoose from "mongoose";
import { devConfig } from "../config/env/dev.config.js";

// Pre-import all schemas to register them with mongoose
import "./models/user.model.js";
import "./models/provider.model.js";
import "./models/destination.model.js";
import "./models/Activity.model.js";
import "./models/experience.model.js";
import "./models/customtrip.model.js";
import "./models/booking.model.js";
import "./models/review.model.js";
import "./models/payment.model.js";
import "./models/chatbot.model.js";
import "./models/wishlist.model.js";
import "./models/token.model.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(devConfig.DB_URL); 
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection error:", error);
  }
};