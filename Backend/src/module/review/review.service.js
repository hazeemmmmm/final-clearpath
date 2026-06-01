import mongoose from "mongoose";
import { Review } from "../../db/models/review.model.js";
import { Booking } from "../../db/models/booking.model.js";
import { CustomTrip } from "../../db/models/customtrip.model.js";
import * as AppError from "../../utils/error/index.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { devConfig } from "../../config/env/dev.config.js";

class ReviewService {
  async create(userId, data) {
    const { experience, rating, comment } = data;

    const existing = await Review.findOne({ user: userId, experience });
    if (existing) {
      throw new AppError.conflictException(
        "You have already reviewed this experience"
      );
    }

    // Fetch user and experience docs for permanent persistable bio matches
    const User = mongoose.model("User");
    const ExperienceModel = mongoose.model("Experience");
    const userDoc = await User.findById(userId);
    const expDoc = await ExperienceModel.findById(experience);

    const customerName = userDoc ? `${userDoc.firstName} ${userDoc.lastName}` : "Valued Customer";
    const packageName = expDoc ? expDoc.name : "Exclusive Tour Package";
    const reviewText = comment || "";

    // Check if user has a confirmed booking for this experience
    const userCustomTrips = await CustomTrip.find({ user: userId, experience });
    const customTripIds = userCustomTrips.map((ct) => ct._id);
    const confirmedBooking = await Booking.findOne({
      customTrip: { $in: customTripIds },
      status: "Confirmed",
    });

    // 🤖 Rigorous AI Sentiment Analysis & Mathematical Trust Scoring System
    let trustScore = 60; // Start with base 60
    let isSpam = false;
    let sentiment = 'Neutral';

    // A. Mathematical calculation logic (always computed as core heuristic or baseline)
    const lowerComment = reviewText.toLowerCase();

    // 1. Verified Booking adjustment
    if (confirmedBooking) {
      trustScore += 20; // +20 for verified purchases
    } else {
      trustScore -= 15; // -15 unverified reviews penalty
    }

    // 2. Verified Account / Trusted User
    if (userDoc && (userDoc.isVerified || userDoc.role === 'admin')) {
      trustScore += 10;
    }

    // 3. Detail & Word Count bonus
    const words = lowerComment.split(/\s+/).filter(Boolean);
    if (words.length > 15) {
      trustScore += 10;
    }

    // 4. Sentiment Analysis (Positive, Negative, Neutral, Mixed keywords)
    const positiveKeywords = ['amazing', 'great', 'incredible', 'luxury', 'perfect', 'beautiful', 'wonderful', 'happy', 'excellent', 'love'];
    const negativeKeywords = ['scam', 'cheat', 'bad service', 'overpriced', 'hidden fee', 'stole', 'fake', 'robbed', 'worst', 'poor', 'disappointing'];

    const hasPos = positiveKeywords.some(w => lowerComment.includes(w));
    const hasNeg = negativeKeywords.some(w => lowerComment.includes(w));

    if (hasPos && hasNeg) {
      sentiment = 'Mixed';
    } else if (hasPos) {
      sentiment = 'Positive';
    } else if (hasNeg) {
      sentiment = 'Negative';
    } else {
      sentiment = 'Neutral';
    }

    // 5. severe Fraud Word penalizations (-45 points)
    const severeFraudWords = ['scam', 'cheat', 'fake', 'stole', 'robbed'];
    const hasSevereFraud = severeFraudWords.some(w => lowerComment.includes(w));
    if (hasSevereFraud) {
      trustScore -= 45;
    }

    // 6. Moderate Negatives check (-20 points)
    const moderateNegativeWords = ['overpriced', 'hidden fee', 'bad service'];
    const hasModerateNeg = moderateNegativeWords.some(w => lowerComment.includes(w));
    if (hasModerateNeg) {
      trustScore -= 20;
    }

    // 7. Mismatch rating/sentiment conflict penalty (-30 points)
    if (sentiment === 'Positive' && rating <= 2) {
      trustScore -= 30;
      isSpam = true;
    } else if (sentiment === 'Negative' && rating >= 4) {
      trustScore -= 30;
      isSpam = true;
    }

    // 8. Bot Spammy Check (gibberish/repetitive)
    const uniqueWords = new Set(words);
    if (words.length > 3 && uniqueWords.size === 1) {
      trustScore = 10; // Extreme penalty for bot reviews
      isSpam = true;
    }

    // Clamp Trust Score between 0 and 100
    trustScore = Math.max(0, Math.min(100, trustScore));

    // B. Real-time Gemini LLM AI Sentiment Analysis (If configured)
    let aiSentiment = `AI: ${sentiment}`;
    let aiTrustScore = trustScore;

    const apiKey = devConfig.GEMINI_API_KEY;
    if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-flash-latest",
          generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
          Analyze the following customer review text for a tour package:
          Review Text: "${reviewText}"
          Rating: ${rating} Stars
          Verified Purchase: ${!!confirmedBooking}

          Classify the sentiment strictly into one of these: "AI: Positive", "AI: Negative", "AI: Neutral", or "AI: Mixed". Do not default.
          Calculate an AI Trust Score (0-100) based on review genuineness, text clarity, and whether there are indicators of fraud/scams (severe penalty) or helpful details.
          
          Respond ONLY with a JSON object containing keys "aiSentiment" and "aiTrustScore".
        `;

        const response = await model.generateContent(prompt);
        const aiResult = JSON.parse(response.response.text());
        if (aiResult.aiSentiment) aiSentiment = aiResult.aiSentiment;
        if (aiResult.aiTrustScore !== undefined) aiTrustScore = Number(aiResult.aiTrustScore);
      } catch (err) {
        console.error("Gemini Real-time Review Sentiment error:", err);
      }
    }

    // Sync base fields to AI-computed fields for database persistence
    sentiment = aiSentiment.replace("AI: ", "");
    trustScore = aiTrustScore;

    // Provider auto-linking logic
    let providerId = data.provider || null;
    if (!providerId) {
      if (expDoc && expDoc.itinerary && expDoc.itinerary.length > 0) {
        for (const day of expDoc.itinerary) {
          if (day.activities && day.activities.length > 0) {
            const actWithProv = day.activities.find(act => act.provider);
            if (actWithProv) {
              providerId = actWithProv.provider;
              break;
            }
          }
        }
      }
    }

    const review = await Review.create({
      user: userId,
      experience,
      provider: providerId,
      rating,
      comment,
      isVerifiedBooking: !!confirmedBooking,
      trustScore,
      isSpam,
      sentiment,
      
      // Seed graduation persistable AI fields
      customerName,
      packageName,
      reviewText,
      aiSentiment,
      aiTrustScore
    });

    // Update Provider's Trust Score in database
    if (providerId) {
      try {
        const ProviderModel = mongoose.model("Provider");
        const allProvReviews = await Review.find({ provider: providerId });
        let newTrust = 100;
        if (allProvReviews.length > 0) {
          const avg = allProvReviews.reduce((sum, r) => sum + r.rating, 0) / allProvReviews.length;
          newTrust = Math.round(avg * 20); 
        }
        await ProviderModel.findByIdAndUpdate(providerId, { trustScore: newTrust });
      } catch (err) {
        console.error("Failed to update provider trust score:", err);
      }
    }

    return await review.populate([
      { path: "user", select: "firstName lastName" },
      { path: "experience", select: "name" },
    ]);
  }

  async getExperienceReviews(experienceId, query) {
    const { page = 1, limit = 10, sort = "-createdAt" } = query;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ experience: experienceId })
        .populate("user", "firstName lastName")
        .sort(sort)
        .skip(Number(skip))
        .limit(Number(limit)),
      Review.countDocuments({ experience: experienceId }),
    ]);

    return { total, page: Number(page), limit: Number(limit), results: reviews.length, reviews };
  }

  async getExperienceStats(experienceId) {
    const stats = await Review.aggregate([
      { $match: { experience: new mongoose.Types.ObjectId(experienceId) } },
      {
        $group: {
          _id: "$experience",
          averageRating: { $avg: "$rating" },
          averageTrustScore: { $avg: "$trustScore" },
          totalReviews: { $sum: 1 },
          ratings: { $push: "$rating" },
        },
      },
    ]);

    if (!stats.length) {
      return { averageRating: 0, totalReviews: 0, ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats[0].ratings.forEach((r) => { breakdown[r] = (breakdown[r] || 0) + 1; });

    return {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      averageTrustScore: Math.round(stats[0].averageTrustScore || 100),
      totalReviews: stats[0].totalReviews,
      ratingBreakdown: breakdown,
    };
  }

  async getMyReviews(userId) {
    return await Review.find({ user: userId })
      .populate("experience", "name base_price")
      .sort("-createdAt");
  }

  async getAllReviews(query) {
    const { page = 1, limit = 20, rating, experienceId } = query;
    const skip = (page - 1) * limit;
    const filter = {};

    if (rating) filter.rating = Number(rating);
    if (experienceId) filter.experience = experienceId;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "firstName lastName email")
        .populate("experience", "name")
        .sort("-createdAt")
        .skip(Number(skip))
        .limit(Number(limit)),
      Review.countDocuments(filter),
    ]);

    return { total, page: Number(page), limit: Number(limit), results: reviews.length, reviews };
  }

  async update(reviewId, userId, data) {
    const review = await Review.findById(reviewId);
    if (!review) throw new AppError.BadRequestException("Review not found");

    if (review.user.toString() !== userId.toString()) {
      throw new AppError.forbiddenException("You can only edit your own reviews");
    }

    return await Review.findByIdAndUpdate(reviewId, data, { new: true, runValidators: true })
      .populate("user", "firstName lastName")
      .populate("experience", "name");
  }

  async delete(reviewId, userId, userRole) {
    const review = await Review.findById(reviewId);
    if (!review) throw new AppError.BadRequestException("Review not found");

    if (userRole !== "admin" && review.user.toString() !== userId.toString()) {
      throw new AppError.forbiddenException("You can only delete your own reviews");
    }

    await Review.findByIdAndDelete(reviewId);
  }
}

export default new ReviewService();

