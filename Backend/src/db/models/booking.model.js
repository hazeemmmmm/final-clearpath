import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customTrip: { type: mongoose.Schema.Types.ObjectId, ref: "CustomTrip", required: false },
  experience: { type: mongoose.Schema.Types.ObjectId, ref: "Experience", required: false },
  booking_type: { type: String, enum: ["Trip", "Package"], required: false },
  booking_date: { type: Date, default: Date.now },
  travel_date: { type: Date },
  numberOfGuests: { type: Number, default: 1, min: 1 },
  total_amount: { type: Number, required: true }, // هنا هيتحسب
  status: { type: String, enum: ["Confirmed","Pending","Cancelled"], default: "Pending" },
  cancellationInfo: {
    canceledAt: { type: Date },
    feePercent: { type: Number },
    feeAmount: { type: Number },
    refundedAmount: { type: Number }
  }
}, { timestamps: true, strictPopulate: false });

// Middleware: قبل التحقق والحفظ، نحسب السعر
bookingSchema.pre("validate", async function(next) {
  if (!this.total_amount) {
    let singlePrice = 0;
    if (this.customTrip) {
      const customTrip = await mongoose.model("CustomTrip").findById(this.customTrip)
        .populate("experience");
      if (customTrip) {
        singlePrice = customTrip.total_price || (customTrip.experience ? customTrip.experience.base_price : 0);
      } else {
        return next(new Error("CustomTrip not found"));
      }
    } else if (this.experience) {
      const exp = await mongoose.model("Experience").findById(this.experience);
      if (exp) {
        // base_price plus any default itinerary activity prices
        let total = exp.base_price;
        if (exp.itinerary) {
          exp.itinerary.forEach(day => {
            if (day.activities) {
              day.activities.forEach(act => {
                total += act.price || 0;
              });
            }
          });
        }
        singlePrice = total;
      } else {
        return next(new Error("Experience not found"));
      }
    }
    this.total_amount = singlePrice * (this.numberOfGuests || 1);
  }

  next();
});

export const Booking = mongoose.model("Booking", bookingSchema);