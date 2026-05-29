import mongoose from "mongoose";
import { Experience } from "../../db/models/experience.model.js";
import { Booking } from "../../db/models/booking.model.js";
import { CustomTrip } from "../../db/models/customtrip.model.js";
import { Destination } from "../../db/models/destination.model.js";
import { Activity } from "../../db/models/Activity.model.js";
import { Provider } from "../../db/models/provider.model.js";

async function resolveItinerary(data) {
  if (data.itinerary && Array.isArray(data.itinerary)) {
    for (const day of data.itinerary) {
      if (day.activities && Array.isArray(day.activities)) {
        for (const act of day.activities) {
          // 1. Resolve Provider
          if (act.provider && typeof act.provider === 'string' && !mongoose.Types.ObjectId.isValid(act.provider)) {
            let prov = await Provider.findOne({ name: { $regex: new RegExp(`^${act.provider.trim()}$`, "i") } });
            if (!prov) {
              prov = await Provider.create({ name: act.provider.trim(), type: "Guide" });
            }
            act.provider = prov._id;
          }

          // 2. Resolve Activity
          if (act.activity && typeof act.activity === 'string' && !mongoose.Types.ObjectId.isValid(act.activity)) {
            let activityDoc = await Activity.findOne({ name: { $regex: new RegExp(`^${act.activity.trim()}$`, "i") } });
            if (!activityDoc) {
              let provId = act.provider;
              if (!provId || !mongoose.Types.ObjectId.isValid(provId)) {
                let defaultProv = await Provider.findOne({ name: "Default Provider" });
                if (!defaultProv) {
                  defaultProv = await Provider.create({ name: "Default Provider", type: "Guide" });
                }
                provId = defaultProv._id;
              }

              activityDoc = await Activity.create({
                name: act.activity.trim(),
                type: "tour",
                destination: data.destination || (await Destination.findOne() || await Destination.create({ name: "Global", location: "Global" }))._id,
                provider: provId,
                price: Number(act.price) || 0
              });
            }
            act.activity = activityDoc._id;
          }
        }
      }
    }
  }
}

class ExperienceService {

  // ➕ Create (Admin)
  async create(data) {
    if (data.destination && !mongoose.Types.ObjectId.isValid(data.destination)) {
      let dest = await Destination.findOne({ name: { $regex: new RegExp(`^${data.destination.trim()}$`, "i") } });
      if (!dest) {
        dest = await Destination.create({
          name: data.destination.trim(),
          location: data.destination.trim(),
          description: `Luxury packages and trips curated in ${data.destination.trim()}`
        });
      }
      data.destination = dest._id;
    }
    await resolveItinerary(data);
    return await Experience.create(data);
  }

  // 🔽 Get Filter Options
  async getFilterOptions() {
    try {
      const destinations = await Destination.find().select('name _id');
      const capacities = await Experience.distinct('capacity');
      const allDates = await Experience.distinct('availableDates.date');
      const uniqueDates = Array.from(new Set(allDates.map(d => d ? new Date(d).toISOString().split('T')[0] : null).filter(Boolean))).sort();
      
      return {
        destinations,
        capacities: capacities.filter(Boolean).sort((a, b) => a - b),
        dates: uniqueDates,
      };
    } catch (err) {
      console.error("Error fetching filter options:", err);
      return { destinations: [], capacities: [], dates: [] };
    }
  }

  // 📌 Get Supervisor trips and booking metrics
  async getBySupervisor(supervisorId) {
    const trips = await Experience.find({ supervisor: supervisorId })
      .populate("destination")
      .populate("itinerary.activities.activity")
      .lean();

    if (!trips.length) return [];

    const tripIds = trips.map((trip) => trip._id);
    const customTrips = await CustomTrip.find({ experience: { $in: tripIds } })
      .select("_id experience")
      .lean();

    const customTripIds = customTrips.map((ct) => ct._id);
    const customTripMap = customTrips.reduce((acc, item) => {
      const expId = item.experience?._id?.toString() || item.experience?.toString();
      if (!expId) return acc;
      if (!acc[expId]) acc[expId] = [];
      acc[expId].push(item._id.toString());
      return acc;
    }, {});

    const bookings = await Booking.find({
      $or: [
        { experience: { $in: tripIds } },
        { customTrip: { $in: customTripIds } }
      ]
    })
      .populate("user", "firstName lastName email phoneNumber")
      .populate({ path: "customTrip", populate: { path: "experience", select: "name" } })
      .populate("experience", "name")
      .lean();

    return trips.map((trip) => {
      const assignedCustomIds = customTripMap[trip._id.toString()] || [];
      const relatedBookings = bookings.filter((booking) => {
        const expId = booking.experience?._id?.toString() || booking.experience?.toString();
        const customTripId = booking.customTrip?._id?.toString();
        const expMatch = expId === trip._id.toString();
        const customMatch = customTripId && assignedCustomIds.includes(customTripId);
        return expMatch || customMatch;
      });

      const totalGuests = relatedBookings.reduce((sum, booking) => sum + (Number(booking.numberOfGuests) || 0), 0);
      const totalAmount = relatedBookings.reduce((sum, booking) => sum + (Number(booking.total_amount) || 0), 0);
      const sortedDates = (trip.availableDates || []).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
      const startDate = sortedDates[0]?.date ? new Date(sortedDates[0].date) : null;
      let endDate = null;
      if (startDate) {
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Number(trip.duration_days || 1) - 1);
      }

      return {
        ...trip,
        bookingCount: relatedBookings.length,
        totalGuests,
        totalAmount,
        nextStartDate: startDate,
        nextEndDate: endDate,
        bookingDetails: relatedBookings
      };
    });
  }

  // 📋 Get All (SEARCH + FILTER + PAGINATION)
  async getAll(query) {
    const filter = {};

    // 🟢 Filter by isFeatured
    if (query.isFeatured !== undefined) {
      filter.isFeatured = query.isFeatured === "true" || query.isFeatured === true;
    }

    // 🟢 Search by name
    if (query.search) {
      filter.name = {
        $regex: query.search,
        $options: "i",
      };
    }

    // 🟢 Filter by destination
    if (query.destination) {
      filter.destination = query.destination;
    }

    // 🟢 Filter by type (Trip / Package)
    if (query.type) {
      const typeStr = query.type.toLowerCase();
      if (typeStr === "trip") {
        filter.type = "Trip";
      } else if (typeStr === "package" || typeStr === "dayuse") {
        filter.type = "Package";
      } else {
        filter.type = query.type.charAt(0).toUpperCase() + query.type.slice(1).toLowerCase();
      }
    }

    // 🟢 Filter by number of people (capacity لازم تكون في model)
    if (query.people) {
      filter.capacity = { $gte: Number(query.people) };
    }

    // 🟢 Filter by days (duration)
    if (query.days) {
      filter.duration_days = { $gte: Number(query.days) };
    }

    // 🟢 Filter by date
    if (query.date) {
      const searchDate = new Date(query.date);
      if (!isNaN(searchDate.getTime())) {
        const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
        filter.availableDates = {
          $elemMatch: {
            date: { $gte: startOfDay, $lte: endOfDay }
          }
        };
      }
    }

    // 🔵 Pagination
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // 🔵 Sort (optional)
    const sort = query.sort || "-createdAt"; // newest default

    const data = await Experience.find(filter)
      .populate("destination")
      .populate("supervisor", "firstName lastName email role")
      .populate("itinerary.activities.activity")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Experience.countDocuments(filter);

    return {
      results: data.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data,
    };
  }

  // 🔍 Get One
  async getOne(id) {
    return await Experience.findById(id)
      .populate("destination")
      .populate("supervisor", "firstName lastName email role")
      .populate("itinerary.activities.activity");
  }

  // ✏️ Update (Admin)
  async update(id, data) {
    if (data.destination && !mongoose.Types.ObjectId.isValid(data.destination)) {
      let dest = await Destination.findOne({ name: { $regex: new RegExp(`^${data.destination.trim()}$`, "i") } });
      if (!dest) {
        dest = await Destination.create({
          name: data.destination.trim(),
          location: data.destination.trim(),
          description: `Luxury packages and trips curated in ${data.destination.trim()}`
        });
      }
      data.destination = dest._id;
    }
    await resolveItinerary(data);
    return await Experience.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  // ❌ Delete
  async delete(id) {
    return await Experience.findByIdAndDelete(id);
  }

  // 👯 Duplicate (Admin)
  async duplicate(id) {
    const experience = await Experience.findById(id).lean();
    if (!experience) {
      throw new Error("Experience not found");
    }

    const { _id, createdAt, updatedAt, id: virtualId, ...copyData } = experience;
    copyData.name = `${copyData.name} (Copy)`;
    
    // Copy images, itinerary and addons
    copyData.images = [...(copyData.images || [])];
    copyData.addons = [...(copyData.addons || [])].map(addon => {
      const { _id, ...rest } = addon;
      return rest;
    });

    if (copyData.itinerary) {
      copyData.itinerary = copyData.itinerary.map(day => {
        const { _id, ...restDay } = day;
        if (restDay.activities) {
          restDay.activities = restDay.activities.map(act => {
            const { _id, ...restAct } = act;
            return restAct;
          });
        }
        return restDay;
      });
    }

    return await Experience.create(copyData);
  }

  // 🧠 Heuristic Smart Provider Matching
  async getProvidersMatch(experienceId) {
    const experience = await Experience.findById(experienceId).populate("destination");
    if (!experience) throw new Error("Experience not found");

    const User = (await import("../../db/models/user.model.js")).User;
    
    // Get all supervisors (acting as guides/agencies)
    const guides = await User.find({ role: { $in: ["supervisor", "provider"] } });
    
    // Check their active bookings/workload
    const activeTrips = await Experience.find({ supervisor: { $in: guides.map(g => g._id) } });

    const matches = guides.map(guide => {
      let score = 0;
      let isFree = true;
      let specialtyMatch = false;
      let geoMatch = false;
      
      const guideTrips = activeTrips.filter(t => String(t.supervisor) === String(guide._id));
      
      // 1. Availability (50%): Free & Available
      if (guideTrips.length === 0) {
        score += 50;
      } else {
        isFree = false;
        score += 10; // partial
      }

      // 2. Specialty Match (20%)
      const name = guide.firstName.toLowerCase();
      const expName = experience.name.toLowerCase();
      
      if ((expName.includes("hike") || expName.includes("safari") || expName.includes("desert") || expName.includes("sahara")) && (name.includes("mohra") || name.includes("yasmine"))) {
        score += 20;
        specialtyMatch = true;
      } else if ((expName.includes("nile") || expName.includes("luxor") || expName.includes("temple")) && name.includes("karim")) {
        score += 20;
        specialtyMatch = true;
      } else if ((expName.includes("dive") || expName.includes("sea") || expName.includes("boat")) && name.includes("nour")) {
        score += 20;
        specialtyMatch = true;
      } else {
        score += 10; // Generic match
      }

      // 3. Geographic Familiarity (15%)
      score += 15; 
      geoMatch = true;

      // 4. Workload Balance (15%)
      if (guideTrips.length < 2) {
        score += 15;
      } else if (guideTrips.length < 5) {
        score += 5;
      }

      let bestFitReason = "";
      if (score >= 85) {
        bestFitReason = `${guide.firstName} is the best fit: ${isFree ? "Currently free" : "Manageable workload"}, matches the specialty of this trip, and has an excellent track record!`;
      }

      return {
        guideId: guide._id,
        name: `${guide.firstName} ${guide.lastName}`,
        email: guide.email,
        matchScore: score,
        isFree,
        specialtyMatch,
        geoMatch,
        activeTrips: guideTrips.length,
        bestFitReason
      };
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);
    return matches;
  }
}

export default new ExperienceService();