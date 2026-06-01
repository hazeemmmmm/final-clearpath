import mongoose from "mongoose";

const supervisorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  avatar: { type: String, default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" },
  bio: { type: String, required: true },
  trustScore: { type: Number, default: 95, min: 0, max: 100 },
  specialization: { type: String, required: false, trim: true }, // Optional specialization
  unavailableDates: [{ type: Date }]
}, { timestamps: true });

export const Supervisor = mongoose.model("Supervisor", supervisorSchema);
