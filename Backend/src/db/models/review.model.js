import mongoose from "mongoose";
import { Experience } from "./experience.model.js";
import { User } from "./user.model.js";

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  experience: { type: mongoose.Schema.Types.ObjectId, ref: "Experience", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  isVerifiedBooking: { type: Boolean, default: false },
  // Core AI Trust fields
  trustScore: { type: Number, default: 100 },
  isSpam: { type: Boolean, default: false },
  sentiment: { type: String, enum: ['Positive', 'Neutral', 'Negative', 'Mixed'], default: 'Positive' },
  
  // Custom persistable fields for graduation AI Supervisor/Trust match requirements
  customerName: { type: String }, // name of the customer
  packageName: { type: String },  // name of the travel package
  reviewText: { type: String },   // original raw review text
  aiSentiment: { type: String, default: 'AI: Positive' }, // AI Sentiment classification
  aiTrustScore: { type: Number, default: 100 } // AI Trust score percentage
}, { timestamps: true });

export const Review = mongoose.model("Review", reviewSchema);