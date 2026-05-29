import { CustomTrip } from "../../db/models/customtrip.model.js";
import { Experience } from "../../db/models/experience.model.js";

class CustomTripService {

  // =========================
  // ➕ CREATE FROM EXPERIENCE
  // =========================
  async create(userId, experienceId) {
    const exp = await Experience.findById(experienceId);

    if (!exp) throw new Error("Experience not found");

    // prevent duplicate
    const existing = await CustomTrip.findOne({
      user: userId,
      experience: experienceId,
    });

    if (existing) return existing;

    return await CustomTrip.create({
      user: userId,
      experience: experienceId,
      itinerary: exp.itinerary,
      extra_activities: [],
    });
  }

  // =========================
  // 📋 GET USER TRIPS
  // =========================
  async getUserTrips(userId) {
    return await CustomTrip.find({ user: userId })
      .populate("experience")
      .populate("itinerary.activities.activity")
      .populate("extra_activities.activity");
  }

  // =========================
  // 🔍 GET ONE TRIP
  // =========================
  async getOne(id) {
    return await CustomTrip.findById(id)
      .populate("experience")
      .populate("itinerary.activities.activity")
      .populate("extra_activities.activity");
  }

  // =========================
  // 🧠 GET FINAL TRIP (IMPORTANT 🔥)
  // لو مفيش تعديل → Experience
  // لو فيه تعديل → CustomTrip
  // =========================
  async getFinalTrip(userId, experienceId) {

    const custom = await CustomTrip.findOne({
      user: userId,
      experience: experienceId,
    })
      .populate("experience")
      .populate("itinerary.activities.activity")
      .populate("extra_activities.activity");

    // 🔵 NO CUSTOMIZATION → return experience
    if (!custom) {
      const exp = await Experience.findById(experienceId)
        .populate("destination")
        .populate("itinerary.activities.activity");

      if (!exp) throw new Error("Experience not found");

      return {
        source: "experience",
        data: exp,
      };
    }

    // 🔥 CUSTOM TRIP → calculate final result
    let total = 0;
    let extraActivitiesCount = 0;

    if (custom.itinerary) {
      custom.itinerary.forEach(day => {
        if (day.status !== "removed" && day.activities) {
          day.activities.forEach(act => {
            if (act.status === "active") {
              total += act.price || 0;
            }
          });
        }
      });
    }

    if (custom.extra_activities) {
      custom.extra_activities.forEach(act => {
        if (act.status === "active") {
          total += act.price || 0;
          extraActivitiesCount++;
        }
      });
    }

    let originalTotal = total;
    let aiDiscountApplied = false;
    let discountAmount = 0;

    // AI-Based Fixed-Price Package Optimization (Bundle Discount)
    if (extraActivitiesCount >= 3) {
      aiDiscountApplied = true;
      discountAmount = total * 0.10; // 10% discount for 3+ extra activities
      total = total - discountAmount;
    }

    // Add base_price from the experience!
    const basePrice = custom.experience ? custom.experience.base_price : 0;
    total += basePrice;
    originalTotal += basePrice;

    return {
      source: "customTrip",
      data: {
        _id: custom._id,
        user: custom.user,
        experience: custom.experience,
        itinerary: custom.itinerary || [],
        extra_activities: custom.extra_activities || [],
        total_price: total,
        original_price: originalTotal,
        ai_discount_applied: aiDiscountApplied,
        discount_amount: discountAmount
      },
    };
  }

  // =========================
  // ➕ ADD FULL DAY (FOR DAYUSE INJECT)
  // =========================
  async addDay(tripId, dayObj) {
    const trip = await CustomTrip.findById(tripId);

    if (!trip) throw new Error("Trip not found");

    const dayNumber = trip.itinerary.length + 1;

    const newDay = {
      day_number: dayNumber,
      title: dayObj.title || "",
      description: dayObj.description || "",
      image: dayObj.image || "",
      activities: (dayObj.activities || []).map(act => ({
        activity: act.activity?._id || act.activity,
        price: Number(act.price) || 0,
        provider: act.provider?._id || act.provider || null,
        status: "active"
      })),
      status: "active"
    };

    trip.itinerary.push(newDay);
    await trip.save();
    return trip;
  }

  // =========================
  // ➕ ADD ACTIVITY TO DAY
  // =========================
  async addActivity(tripId, dayNumber, activityObj) {
    const trip = await CustomTrip.findById(tripId);

    if (!trip) throw new Error("Trip not found");

    let day = trip.itinerary.find(d => d.day_number === dayNumber);

    if (!day) {
      day = {
        day_number: dayNumber,
        activities: [],
        status: "active",
      };
      trip.itinerary.push(day);
    }

    day.activities.push({
      ...activityObj,
      status: "active",
    });

    await trip.save();
    return trip;
  }

  // =========================
  // ❌ REMOVE ACTIVITY (TOGGLE)
  // =========================
  async removeActivity(tripId, dayNumber, activityId) {
    const trip = await CustomTrip.findById(tripId);

    if (!trip) throw new Error("Trip not found");

    const day = trip.itinerary.find(d => d.day_number === dayNumber);

    if (!day) return trip;

    const activity = day.activities.find(
      a => a.activity.toString() === activityId.toString()
    );

    if (activity) {
      activity.status = activity.status === "removed" ? "active" : "removed";
    }

    await trip.save();
    return trip;
  }

  // =========================
  // ❌ REMOVE DAY (TOGGLE)
  // =========================
  async removeDay(tripId, dayNumber) {
    const trip = await CustomTrip.findById(tripId);

    if (!trip) throw new Error("Trip not found");

    const day = trip.itinerary.find(d => d.day_number === dayNumber);

    if (day) {
      day.status = day.status === "removed" ? "active" : "removed";
    }

    await trip.save();
    return trip;
  }

  // =========================
  // ➕ ADD EXTRA ACTIVITY
  // =========================
  async addExtraActivity(tripId, activityObj) {
    const trip = await CustomTrip.findById(tripId);

    if (!trip) throw new Error("Trip not found");

    trip.extra_activities.push({
      ...activityObj,
      status: "active",
    });

    await trip.save();
    return trip;
  }

  // =========================
  // ❌ REMOVE EXTRA ACTIVITY
  // =========================
  async removeExtraActivity(tripId, activityId) {
    const trip = await CustomTrip.findById(tripId);

    if (!trip) throw new Error("Trip not found");

    const act = trip.extra_activities.find(
      a => a.activity.toString() === activityId.toString()
    );

    if (act) {
      act.status = "removed";
    }

    await trip.save();
    return trip;
  }
}

export default new CustomTripService();