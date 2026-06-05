import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const DB_URL = "mongodb://127.0.0.1:27017/clearpath";
const EMAIL = process.argv[2];
const PASSWORD = process.argv[3];

if (!EMAIL || !PASSWORD) {
  console.log("Usage: node test_login.js <email> <password>");
  process.exit(1);
}

await mongoose.connect(DB_URL);
console.log("✅ Connected to MongoDB\n");

const user = await mongoose.connection.db
  .collection("users")
  .findOne({ email: EMAIL.toLowerCase() });

if (!user) {
  console.log(`❌ User not found: ${EMAIL}`);
  process.exit(1);
}

console.log(`✅ User found:`);
console.log(`   Email: ${user.email}`);
console.log(`   isVerified: ${user.isVerified}`);
console.log(`   role: ${user.role}`);
console.log(`   Password hash in DB: ${user.password}`);
console.log();

const match = await bcrypt.compare(PASSWORD, user.password);
console.log(`🔑 Password match result: ${match}`);

if (!match) {
  console.log(`\n❌ Password does NOT match the stored hash`);
  console.log(`   Try resetting the password`);
} else {
  console.log(`\n✅ Password is CORRECT - issue is elsewhere`);
}

await mongoose.disconnect();
