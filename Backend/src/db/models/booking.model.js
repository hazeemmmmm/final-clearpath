import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customTrip: { type: mongoose.Schema.Types.ObjectId, ref: "CustomTrip", required: false },
  experience: { type: mongoose.Schema.Types.ObjectId, ref: "Experience", required: false },
  booking_type: { type: String, enum: ["Trip", "Package"], required: false },
  booking_date: { type: Date, default: Date.now },
  travel_date: { type: Date },
  numberOfGuests: { type: Number, default: 1, min: 1 },
  total_amount: { type: Number, required: true }, 
  couponCode: { type: String, required: false },
  discount_amount: { type: Number, default: 0 },
  status: { type: String, enum: ["Confirmed","Pending","Cancelled"], default: "Pending" },
  payment_status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  // AI Fraud & Risk Detection Fields
  riskScore: {
    type: Number,
    default: 0,
  },
  fraudAlert: {
    type: Boolean,
    default: false,
  },
  payment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },
  cancellationInfo: {
    canceledAt: { type: Date },
    feePercent: { type: Number },
    feeAmount: { type: Number },
    refundedAmount: { type: Number }
  }
}, { timestamps: true, strictPopulate: false });

bookingSchema.pre("validate", async function(next) {
  if (this.total_amount && !this.couponCode) {
    // If total_amount is already set correctly by the service and no coupon is being applied, skip
    return next();
  }

  // Calculate Discount if a coupon is applied
  if (this.couponCode) {
    const coupon = await mongoose.model("Coupon").findOne({ code: this.couponCode, is_active: true });
    if (coupon && coupon.expires_at > new Date()) {
      const discount = (this.total_amount * coupon.discount_percentage) / 100;
      this.discount_amount = (this.discount_amount || 0) + discount;
      this.total_amount -= discount;
    } else {
      this.couponCode = null; // invalid coupon
    }
  }

  next();
});

export const Booking = mongoose.model("Booking", bookingSchema);