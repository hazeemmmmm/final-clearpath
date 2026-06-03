import mongoose from 'mongoose';
import { devConfig } from './src/config/env/dev.config.js';
import { Destination } from './src/db/models/destination.model.js';

// GeoJSON format: coordinates = [longitude, latitude]
const COORDS = {
  'Cairo':         [31.2357, 30.0444],
  'Alexandria':    [29.9187, 31.2001],
  'Sharm El Sheikh': [34.4309, 27.9158],
  'Ain Sokhna':    [32.3481, 29.6077],
  'Luxor':         [32.6396, 25.6872],
  'Aswan':         [32.8998, 24.0889],
  'Hurghada':      [33.8116, 27.2579],
  'Dahab':         [34.5190, 28.5010],
};

async function seedCoordinates() {
  try {
    await mongoose.connect(devConfig.DB_URL);
    console.log("Connected to MongoDB.");

    const destinations = await Destination.find();
    let updated = 0;

    for (const dest of destinations) {
      const coords = COORDS[dest.name];
      if (!coords) {
        console.log(`  SKIP  ${dest.name} — no coordinates defined`);
        continue;
      }
      dest.coordinates = { type: 'Point', coordinates: coords };
      await dest.save();
      console.log(`  ✓  ${dest.name} → [lng: ${coords[0]}, lat: ${coords[1]}]`);
      updated++;
    }

    console.log(`\nDone. ${updated}/${destinations.length} destinations updated with coordinates.`);
  } catch (err) {
    console.error("Failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seedCoordinates();
