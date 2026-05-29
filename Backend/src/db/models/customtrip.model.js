import mongoose from "mongoose";

const customActivitySchema = new mongoose.Schema({
  activity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: false },
  price: { type: Number, required: true },
  status: { type: String, enum: ["active", "removed"], default: "active" }
}, { _id: false });

const customDaySchema = new mongoose.Schema({
  day_number: { type: Number, required: true },
  title: { type: String, trim: true },
  image: { type: String, trim: true },
  description: { type: String, trim: true },
  activities: [customActivitySchema],
  status: { type: String, enum: ["active", "removed"], default: "active" }
}, { _id: false });

const customTripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  experience: { type: mongoose.Schema.Types.ObjectId, ref: "Experience", required: true },
  combinedExperiences: [{ type: mongoose.Schema.Types.ObjectId, ref: "Experience" }],
  itinerary: [customDaySchema],
  extra_activities: [customActivitySchema],
  total_price: { type: Number, default: 0 }
}, { timestamps: true });

// Pre-save to auto calculate total price
customTripSchema.pre("save", function(next) {
  let total = 0;
  if (this.itinerary) {
    this.itinerary.forEach(day => {
      if (day.status !== "removed" && day.activities) {
        day.activities.forEach(act => {
          if (act.status === "active") {
            total += act.price || 0;
          }
        });
      }
    });
  }
  if (this.extra_activities) {
    this.extra_activities.forEach(act => {
      if (act.status === "active") {
        total += act.price || 0;
      }
    });
  }
  this.total_price = total;
  next();
});

export const CustomTrip = mongoose.model("CustomTrip", customTripSchema);