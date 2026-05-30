import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  country:     { type: String, trim: true, default: 'Egypt' },
  city:        { type: String, required: true, trim: true },
  location:    { type: String, trim: true },   // kept for backward compatibility
  image:       { type: String, trim: true },   // cover photo URL
  description: { type: String, trim: true },
}, { timestamps: true });

export const Destination = mongoose.model("Destination", destinationSchema);