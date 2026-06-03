import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  country:     { type: String, trim: true, default: 'Egypt' },
  city:        { type: String, required: true, trim: true },
  location:    { type: String, trim: true },
  coordinates: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [31.2357, 30.0444] }
  },
  image:       { type: String, trim: true },
  description: { type: String, trim: true },
}, { timestamps: true });

destinationSchema.index({ coordinates: '2dsphere' }, { sparse: true });

export const Destination = mongoose.model("Destination", destinationSchema);