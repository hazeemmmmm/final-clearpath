import mongoose from "mongoose";

const supervisorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  specialization: { type: String, required: true, trim: true }, // e.g., Hiking, Diving, Safari
  unavailableDates: [{ type: Date }]
}, { timestamps: true });

export const Supervisor = mongoose.model("Supervisor", supervisorSchema);
