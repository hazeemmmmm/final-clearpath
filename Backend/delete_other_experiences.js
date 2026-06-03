import mongoose from 'mongoose';
import { devConfig } from './src/config/env/dev.config.js';
import { Experience } from './src/db/models/experience.model.js';

const DB_URL = devConfig.DB_URL;

async function run() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(DB_URL);
  console.log('✅ Connected!');

  console.log('🧹 Deleting all experiences except the Ain Sokhna one...');
  const result = await Experience.deleteMany({
    _id: { $ne: new mongoose.Types.ObjectId("6a1d88f9ed7278b571da469e") }
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
