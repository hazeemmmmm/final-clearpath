import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Experience } from '../src/db/models/experience.model.js';
import { User } from '../src/db/models/user.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clearpath';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const experiences = await Experience.find().populate('supervisor').lean();
  console.log('\n--- Experience Supervisors ---');
  experiences.forEach(e => {
    console.log(`Experience: ${e.name}`);
    console.log(`Supervisor Field:`, e.supervisor);
    console.log(`-----------------------------`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
