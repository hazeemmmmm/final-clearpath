import mongoose from 'mongoose';
import { devConfig } from '../src/config/env/dev.config.js';
import { Experience } from '../src/db/models/experience.model.js';

const DB_URL = devConfig.DB_URL;

async function run() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(DB_URL);
  console.log('✅ Connected!');

  console.log('🧹 Deleting all experiences except Giza Pyramids & Sphinx Explorer...');
  const result = await Experience.deleteMany({
    name: { $ne: "Giza Pyramids & Sphinx Explorer" }
  });
  console.log(`✅ Deleted ${result.deletedCount} experiences!`);

  const countAfter = await Experience.countDocuments({});
  console.log(`📊 Experiences remaining in DB: ${countAfter}`);

  await mongoose.disconnect();
  console.log('🔌 Disconnected!');
}

run().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
