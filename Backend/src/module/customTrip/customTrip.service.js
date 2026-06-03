import { CustomTrip } from "../../db/models/customtrip.model.js";
import { Experience } from "../../db/models/experience.model.js";
import mongoose from "mongoose";
import { calculateBookingTotal } from "../../utils/pricingHelper.js";

class CustomTripService {

  // =========================
  // ➕ CREATE FROM EXPERIENCE
  // =========================
  async create(userId, experienceId) {
    const exp = await Experience.findById(experienceId);

    if (!exp) throw new Error("Experience not found");

    // prevent duplicate - only return active, unbooked customization
    const customTrips = await CustomTrip.find({
      user: userId,
      experience: experienceId,
    }).sort({ createdAt: -1 });

    let existing = null;
    for (const trip of customTrips) {
      const isBooked = await mongoose.model("Booking").findOne({ customTrip: trip._id });
      if (!isBooked) {
        existing = trip;
        break;
      }
    }

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

    // Find custom trips that are not booked yet
    const customTrips = await CustomTrip.find({
      user: userId,
      experience: experienceId,
    }).sort({ createdAt: -1 });

    let custom = null;
    for (const trip of customTrips) {
      const isBooked = await mongoose.model("Booking").findOne({ customTrip: trip._id });
      if (!isBooked) {
        custom = await CustomTrip.findById(trip._id)
          .populate("experience")
          .populate("combinedExperiences")
          .populate("itinerary.activities.activity")
          .populate("extra_activities.activity");
        break;
      }
    }

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

    // 🔥 CUSTOM TRIP → calculate final result using unified pricing authority
    const pricing = await calculateBookingTotal({
      booking_type: "Trip",
      customTrip: custom._id,
      numberOfGuests: 1
    });

    return {
      source: "customTrip",
      data: {
        _id: custom._id,
        user: custom.user,
        experience: custom.experience,
        combinedExperiences: custom.combinedExperiences || [],
        itinerary: custom.itinerary || [],
        extra_activities: custom.extra_activities || [],
        total_price: pricing.bookingTotalOnly,
        original_price: pricing.subtotal,
        ai_discount_applied: false,
        discount_amount: pricing.discountAmount,
        breakdown: {
          basePrice: pricing.basePrice,
          transportCost: pricing.transportCost,
          subtotal: pricing.subtotal,
          taxes: pricing.taxes,
          serviceFees: pricing.serviceFees,
          extraActivitiesCost: pricing.extraActivitiesCost,
          totalPrice: pricing.bookingTotalOnly
        }
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

    const newDate = activityObj.date;
    const newStart = activityObj.startTime;
    const newEnd = activityObj.endTime;

    if (newDate && newStart && newEnd) {
      const isOverlap = (d1, s1, e1, d2, s2, e2) => {
        if (d1 !== d2) return false;
        return s1 < e2 && s2 < e1;
      };

      // 1. Check current trip's itinerary
      if (trip.itinerary) {
        for (const d of trip.itinerary) {
          if (d.status !== "removed" && d.activities) {
            for (const act of d.activities) {
              if (act.status !== "removed" && act.date === newDate && act.startTime && act.endTime) {
                if (isOverlap(newDate, newStart, newEnd, act.date, act.startTime, act.endTime)) {
                  const err = new Error("Schedule Conflict Detected. This activity overlaps with another booked activity.");
                  err.statusCode = 400;
                  throw err;
                }
              }
            }
          }
        }
      }

      // 2. Check other bookings for the same user
      const Booking = mongoose.model("Booking");
      const userBookings = await Booking.find({ user: trip.user, status: { $ne: "Cancelled" } })
        .populate({
          path: "customTrip",
          populate: "itinerary.activities.activity"
        });
      
      for (const booking of userBookings) {
        if (booking.snapshot && booking.snapshot.itinerary) {
          for (const d of booking.snapshot.itinerary) {
            if (d.activities) {
              for (const act of d.activities) {
                if (act.date === newDate && act.startTime && act.endTime) {
                  if (isOverlap(newDate, newStart, newEnd, act.date, act.startTime, act.endTime)) {
                    const err = new Error("Schedule Conflict Detected. This activity overlaps with another booked activity.");
                    err.statusCode = 400;
                    throw err;
                  }
                }
              }
            }
          }
        }
        if (booking.customTrip && booking.customTrip.itinerary) {
          for (const d of booking.customTrip.itinerary) {
            if (d.status !== "removed" && d.activities) {
              for (const act of d.activities) {
                if (act.status !== "removed" && act.date === newDate && act.startTime && act.endTime) {
                  if (isOverlap(newDate, newStart, newEnd, act.date, act.startTime, act.endTime)) {
                    const err = new Error("Schedule Conflict Detected. This activity overlaps with another booked activity.");
                    err.statusCode = 400;
                    throw err;
                  }
                }
              }
            }
          }
        }
      }
    }

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

  // =========================
  // 🗺️ COMBINE DESTINATION / PACKAGE
  // =========================
  async combine(userId, customTripId, targetPackageId) {
    const trip = await CustomTrip.findOne({ _id: customTripId, user: userId });
    if (!trip) throw new Error("Custom Trip not found");

    const targetExp = await Experience.findById(targetPackageId);
    if (!targetExp) throw new Error("Target package experience not found");

    // Shift day numbers of the target itinerary and append
    const currentDaysCount = trip.itinerary.length;
    const shiftedItinerary = (targetExp.itinerary || []).map(day => {
      return {
        day_number: currentDaysCount + day.day_number,
        title: day.title || "",
        description: day.description || "",
        image: day.image || "",
        activities: (day.activities || []).map(act => ({
          activity: act.activity,
          provider: act.provider || null,
          price: Number(act.price) || 0,
          status: "active"
        })),
        status: "active"
      };
    });

    trip.itinerary.push(...shiftedItinerary);

    if (!trip.combinedExperiences) {
      trip.combinedExperiences = [];
    }

    if (!trip.combinedExperiences.includes(targetPackageId)) {
      trip.combinedExperiences.push(targetPackageId);
    }

    await trip.save();
    return trip;
  }
}

export default new CustomTripService();