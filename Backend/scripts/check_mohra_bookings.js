import mongoose from 'mongoose';
import { devConfig } from '../src/config/env/dev.config.js';
import { User } from '../src/db/models/user.model.js';

async function run() {
  await mongoose.connect(devConfig.DB_URL);
  console.log("Connected to MongoDB.");

  const users = await User.find({ firstName: /alaa/i }).lean();
  console.log(`Matching users: ${users.length}`);
  users.forEach(u => {
    console.log(`User: ${u.firstName} ${u.lastName} (${u.email}) - Role: ${u.role} - Flagged: ${u.isFlagged} - ID: ${u._id}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
