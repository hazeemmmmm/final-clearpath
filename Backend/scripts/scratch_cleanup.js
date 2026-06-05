import mongoose from 'mongoose';
import { devConfig } from '../src/config/env/dev.config.js';
import { Experience } from '../src/db/models/experience.model.js';
import { Destination } from '../src/db/models/destination.model.js';
import { PackingGuide } from '../src/db/models/packingguide.model.js';

async function runCleanup() {
  try {
    await mongoose.connect(devConfig.DB_URL);
    console.log("Connected to MongoDB successfully.");

    const cairo = await Destination.findOne({ name: 'Cairo' });
    if (!cairo) {
      console.error("Cairo destination not found.");
      return;
    }
    const cairoId = cairo._id;

    // Find all experiences NOT in Cairo
    const nonCairoExps = await Experience.find({ destination: { $ne: cairoId } });
    const nonCairoExpIds = nonCairoExps.map(e => e._id);
    const nonCairoExpNames = nonCairoExps.map(e => e.name);

    console.log("Non-Cairo experiences to delete:", nonCairoExpNames);

    // Delete experiences
    const delExp = await Experience.deleteMany({ destination: { $ne: cairoId } });
    console.log(`Deleted ${delExp.deletedCount} experiences.`);

    // Delete associated packing guides
    const delGuides = await PackingGuide.deleteMany({ experience: { $in: nonCairoExpIds } });
    console.log(`Deleted ${delGuides.deletedCount} packing guides.`);

  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runCleanup();
