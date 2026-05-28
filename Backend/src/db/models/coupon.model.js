import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discount_percentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  expires_at: {
    type: Date,
    required: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  used_by: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, { timestamps: true });

export const Coupon = mongoose.model("Coupon", couponSchema);
