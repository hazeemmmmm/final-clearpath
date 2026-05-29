import mongoose from "mongoose";
import { Review } from "../../db/models/review.model.js";
import { Booking } from "../../db/models/booking.model.js";
import { CustomTrip } from "../../db/models/customtrip.model.js";
import * as AppError from "../../utils/error/index.js";

class ReviewService {
  async create(userId, data) {
    const { experience, rating, comment } = data;

    const existing = await Review.findOne({ user: userId, experience });
    if (existing) {
      throw new AppError.conflictException(
        "You have already reviewed this experience"
      );
    }

    // Check if user has a confirmed booking for this experience
    const userCustomTrips = await CustomTrip.find({ user: userId, experience });
    const customTripIds = userCustomTrips.map((ct) => ct._id);
    const confirmedBooking = await Booking.findOne({
      customTrip: { $in: customTripIds },
      status: "Confirmed",
    });

    // 🤖 AI Mock Analysis for Review Trust & Sentiment
    let trustScore = 100;
    let isSpam = false;
    let sentiment = 'Neutral';

    if (process.env.MOCK_GEMINI === 'true' || true) {
      const lowerComment = (comment || '').toLowerCase();
      
      // 1. Bot Spammy (Repetitive Gibberish)
      const words = lowerComment.split(/\s+/);
      const uniqueWords = new Set(words);
      if (words.length > 3 && uniqueWords.size === 1) {
        sentiment = 'Positive'; // "nice nice nice"
        trustScore = 15;
        isSpam = true;
      } else {
        // 2. Sentiment Analysis
        if (lowerComment.includes('amazing') || lowerComment.includes('great') || lowerComment.includes('incredible')) {
          sentiment = 'Positive';
        } else if (lowerComment.includes('bad') || lowerComment.includes('worst')) {
          sentiment = 'Negative';
        }

        // 3. Mismatch Rating Fraud (e.g. 1 star but says "amazing")
        if (sentiment === 'Positive' && rating <= 2) {
          trustScore = 35;
          isSpam = true;
        } else if (sentiment === 'Negative' && rating >= 4) {
          trustScore = 35;
          isSpam = true;
        } else if (sentiment === 'Positive' && rating >= 4) {
          // Authentic Positive
          trustScore = 100;
        }
      }

      // Base Trust adjustments
      if (!confirmedBooking) trustScore = Math.min(trustScore, 80); // Unverified purchase drops trust
    }

    // 4. Provider auto-linking logic
    let providerId = data.provider || null;
    if (!providerId) {
      const expDoc = await mongoose.model("Experience").findById(experience);
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
      sentiment
    });

    // 5. Update Provider's Trust Score in database
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

