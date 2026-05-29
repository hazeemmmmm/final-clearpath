import { Booking } from '../../db/models/booking.model.js';
import { Experience } from '../../db/models/experience.model.js';
import { User } from '../../db/models/user.model.js';
import { Provider } from '../../db/models/provider.model.js';
import { Review } from '../../db/models/review.model.js';
import { Interaction } from '../../db/models/interaction.model.js';

// Get Intelligence Flags
export const getIntelligenceDashboard = async (req, res, next) => {
  try {
    const isDemoMode = req.query.demo === "true";

    const flags = {
      demandAlerts: [],
      fraudAlerts: [],
      trustScores: []
    };

    // 1. Demand Forecasting (AI-Powered with Real Analytics)
    const experiences = await Experience.find().lean();
    const bookings = await Booking.find().lean();
    const interactions = await Interaction.find().lean();
    
    for (const exp of experiences) {
      const expIdStr = String(exp._id);
      const expBookings = bookings.filter(b => String(b.experience) === expIdStr && b.status === "Confirmed");
      
      const expViews = interactions.filter(i => String(i.experience) === expIdStr && i.actionType === "VIEW");
      const expWishlists = interactions.filter(i => String(i.experience) === expIdStr && i.actionType === "WISHLIST_ADD");
      
      const totalInterest = expViews.length + expWishlists.length * 2; // Wishlists carry more weight
      const bookingCount = expBookings.length;

      // Rule 1: High Demand / Low Capacity Warning
      if (totalInterest > 10 && bookingCount > 2) {
        flags.demandAlerts.push({
          type: "High Demand",
          experienceId: exp._id,
          experienceName: exp.name,
          message: `Real-time analytics show high demand (${expViews.length} views, ${expWishlists.length} wishlists). Projected to reach maximum capacity soon. Suggest allocating more guides.`,
          actionRecommended: `Auto-Assign Guides`
        });
      } 
      // Rule 2: High Interest but Low Conversion (Price Sensitivity)
      else if (totalInterest > 15 && bookingCount === 0) {
        flags.demandAlerts.push({
          type: "Conversion Drop",
          experienceId: exp._id,
          experienceName: exp.name,
          message: `High views & wishlists (${totalInterest} points) but NO bookings. Price sensitivity detected.`,
          actionRecommended: `Deploy Smart 15% Discount`
        });
      }
    }

    // 🎓 Academic Presentation Demo Injection
    if (isDemoMode && flags.demandAlerts.length === 0) {
       flags.demandAlerts.push({
          type: "High Demand",
          experienceId: "demo-mohra",
          experienceName: "Mohra Hiking Package (Simulated)",
          message: `Projected 95% capacity by mid-July. Current guide ratio is extremely low.`,
          actionRecommended: `Auto-Assign Guide Yasmine`
       });
       flags.demandAlerts.push({
          type: "Conversion Drop",
          experienceId: "demo-siwa",
          experienceName: "Siwa Oasis Retreat (Simulated)",
          message: `High views & wishlists but low bookings. Price sensitivity detected for August.`,
          actionRecommended: `Deploy Smart 15% Discount`
       });
    }

    // 2. Fraud & Scam Risk Detection (Rule-Based)
    const users = await User.find({ role: "user" }).lean();
    
    for (const user of users) {
      if (user.isFlagged) {
        flags.fraudAlerts.push({
          userId: user._id,
          userName: `${user.firstName} ${user.lastName}`,
          severity: "Flagged / تم التجميد",
          isFlagged: true,
          message: `Account is currently restricted/suspended: ${user.flaggedReason || 'Spam behavior detected.'}`,
          actionRecommended: "Unflag Account"
        });
        continue;
      }

      const userBookings = bookings.filter(b => String(b.user) === String(user._id));
      const cancelled = userBookings.filter(b => b.status === "Cancelled").length;
      
      if (userBookings.length > 0 && cancelled >= 2) {
        flags.fraudAlerts.push({
          userId: user._id,
          userName: `${user.firstName} ${user.lastName}`,
          severity: "High",
          isFlagged: false,
          message: `User has an abnormally high cancellation rate (${cancelled} cancellations). Potential spam behavior detected.`,
          actionRecommended: "Flag Account"
        });
      }
    }

    // 🎓 Academic Presentation Demo Injection
    if (isDemoMode && flags.fraudAlerts.length === 0) {
      flags.fraudAlerts.push({
        userId: "demo-user-123",
        userName: "John Doe (Simulated Alert)",
        severity: "High",
        isFlagged: false,
        message: "User has cancelled 4 bookings within 24 hours. High risk of spam or competitor probing.",
        actionRecommended: "Flag Account"
      });
    }

    // 3. Trust Scoring (Real Rating calculation + Academic fallback)
    const providers = await Provider.find().lean();
    const reviews = await Review.find().lean();

    for (const provider of providers) {
      const providerReviews = reviews.filter(r => String(r.provider) === String(provider._id));
      let score = provider.trustScore !== undefined ? provider.trustScore : 100;
      
      if (providerReviews.length > 0) {
        const avgRating = providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;
        score = Math.round(avgRating * 20); // 5 stars -> 100, 4 stars -> 80
      }
      
      flags.trustScores.push({
        providerId: provider._id,
        providerName: provider.name,
        trustScore: score,
        tier: score >= 80 ? "Premium Trusted" : (score >= 60 ? "Verified" : "Under Review")
      });
    }

    // 🎓 Academic Presentation Demo Injection
    if (isDemoMode && flags.trustScores.length === 0) {
      flags.trustScores.push(
        { providerId: "demo-p1", providerName: "Desert Nomads Team (Simulated)", trustScore: 95, tier: "Premium Trusted" },
        { providerId: "demo-p2", providerName: "Siwa Eco-Tours (Simulated)", trustScore: 88, tier: "Premium Trusted" },
        { providerId: "demo-p3", providerName: "Nile Cruise Co. (Simulated)", trustScore: 55, tier: "Under Review" }
      );
    }

    return res.status(200).json({ success: true, data: flags });
  } catch (error) {
    console.error("Intelligence Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate intelligence report." });
  }
};

// PATCH /admin/flag-user/:userId
export const flagUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reason = "Flagged due to suspicious booking activities." } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isFlagged: true, flaggedReason: reason },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: `User ${user.firstName} ${user.lastName} successfully flagged and restricted.`,
      user
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /admin/unflag-user/:userId
export const unflagUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isFlagged: false, flaggedReason: "" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: `User ${user.firstName} ${user.lastName} restrictions successfully removed.`,
      user
    });
  } catch (error) {
    return next(error);
  }
};
