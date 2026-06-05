/**
 * One-time script to reset a user's password directly in the DB.
 * Use when a password was double-hashed due to the old registration bug.
 *
 * Usage:
 *   node fix_user_password.js <email> <newPassword>
 * Example:
 *   node fix_user_password.js fsdokiko@gmail.com Mm@200543mavy
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { devConfig } from '../src/config/env/dev.config.js';

const [,, email, newPassword] = process.argv;

if (!email || !newPassword) {
  console.error('Usage: node fix_user_password.js <email> <newPassword>');
  process.exit(1);
}

async function run() {
  await mongoose.connect(devConfig.DB_URL);
  console.log('Connected to MongoDB.');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await User.updateOne({ _id: user._id }, { password: hashed });

  console.log(`Password fixed for: ${email}`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
