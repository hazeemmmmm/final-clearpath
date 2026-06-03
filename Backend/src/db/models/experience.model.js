import mongoose from "mongoose";

const activityItemSchema = new mongoose.Schema(
  {
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
    },

    image: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const itineraryDaySchema = new mongoose.Schema(
  {
    day_number: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    culturalGuide: {
      type: String,
      trim: true,
      default: "",
    },

    activities: [activityItemSchema],
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["Trip", "Package"],
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    duration_days: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // 💣 جديد (للسيرش والحجز)
    capacity: {
      type: Number,
      default: 10,
    },

    availableDates: [
      {
        date: Date,
        availableSeats: Number,
      },
    ],

    addons: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String }
      }
    ],

    // 🖼️ Curated High-Quality Real Egyptian Travel Images
    image: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },

    included: {
      type: [String],
      default: [],
    },
    excluded: {
      type: [String],
      default: [],
    },
    priceBreakdown: [
      {
        label: { type: String, required: true },
        amount: { type: Number, required: true },
      }
    ],
    airportPickup: {
      type: Boolean,
      default: false,
    },

    /**
     * 📖 Linked Packing / Adventure Guide
     * References an existing PackingGuide document by ObjectId.
     * Populated automatically when the experience is fetched, so the
     * frontend receives the full guide object (essentials, safetyTips,
     * clothing, difficultyLevel, etc.) without extra API calls.
     */
    packingGuide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PackingGuide',
      default: null,
    },

    itinerary: [itineraryDaySchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);



// calculatedPrice (محسن)

experienceSchema.virtual("calculatedPrice").get(function () {
  return this.price;
});

export const Experience = mongoose.model("Experience", experienceSchema);