import mongoose from "mongoose";

const DB_URL = "mongodb://127.0.0.1:27017/clearpath";

await mongoose.connect(DB_URL);
console.log("✅ Connected to MongoDB\n");

const users = await mongoose.connection.db
  .collection("users")
  .find({}, { projection: { email: 1, isVerified: 1, role: 1, firstName: 1, lastName: 1 } })
  .toArray();

console.log(`📋 Total users: ${users.length}\n`);
users.forEach((u, i) => {
  console.log(`[${i + 1}] ${u.email}`);
  console.log(`    isVerified: ${u.isVerified}`);
  console.log(`    role: ${u.role}`);
  console.log(`    name: ${u.firstName} ${u.lastName}`);
  console.log();
});

await mongoose.disconnect();
