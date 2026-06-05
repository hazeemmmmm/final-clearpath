import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const DB_URL = "mongodb://127.0.0.1:27017/clearpath";
const EMAIL = process.argv[2];
const NEW_PASSWORD = process.argv[3];

if (!EMAIL || !NEW_PASSWORD) {
  console.log("Usage: node reset_password.js <email> <newpassword>");
  process.exit(1);
}

await mongoose.connect(DB_URL);
console.log("✅ Connected to MongoDB\n");

const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);

const result = await mongoose.connection.db
  .collection("users")
  .updateOne(
    { email: EMAIL.toLowerCase() },
    { $set: { password: hashedPassword, isVerified: true }, $unset: { otp: "", otpExpiry: "" } }
  );

if (result.matchedCount === 0) {
  console.log(`❌ User not found: ${EMAIL}`);
} else {
  console.log(`✅ Password reset successfully for: ${EMAIL}`);
  console.log(`   New password: ${NEW_PASSWORD}`);
  console.log(`   isVerified set to: true`);
  
  // Verify it works
  const user = await mongoose.connection.db.collection("users").findOne({ email: EMAIL.toLowerCase() });
  const verify = await bcrypt.compare(NEW_PASSWORD, user.password);
  console.log(`   Verification test: ${verify ? "✅ PASS" : "❌ FAIL"}`);
}

await mongoose.disconnect();
console.log("✅ Done");
