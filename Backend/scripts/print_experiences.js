import mongoose from 'mongoose';
import { devConfig } from '../src/config/env/dev.config.js';
import { Destination } from '../src/db/models/destination.model.js';
import { Provider } from '../src/db/models/provider.model.js';
import { Activity } from '../src/db/models/activity.model.js';
import { Experience } from '../src/db/models/experience.model.js';

async function run() {
  await mongoose.connect(devConfig.DB_URL);
  console.log("Connected to MongoDB.");

  const dests = await Destination.find({});
  const provs = await Provider.find({});
  const acts = await Activity.find({});
  const exps = await Experience.find({});

  console.log(`Dests: ${dests.length}, Provs: ${provs.length}, Acts: ${acts.length}, Exps: ${exps.length}`);
  console.log("\nDestinations:");
  dests.forEach(d => console.log(`- ${d.name} (${d._id})`));

  console.log("\nProviders:");
  provs.forEach(p => console.log(`- ${p.name} (${p._id})`));

  console.log("\nActivities:");
  acts.forEach(a => console.log(`- ${a.name} (${a._id}) - Price: ${a.price}`));

  console.log("\nExperiences:");
  exps.forEach(e => console.log(`- ${e.name} (${e._id}) - Type: ${e.type} - Destination: ${e.destination}`));

  await mongoose.disconnect();
}

run().catch(console.error);
