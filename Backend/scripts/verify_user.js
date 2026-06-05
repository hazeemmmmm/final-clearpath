import mongoose from "mongoose";

const DB_URL = "mongodb://127.0.0.1:27017/clearpath";
const EMAIL_TO_VERIFY = process.argv[2];

if (!EMAIL_TO_VERIFY) {
  console.log("Usage: node verify_user.js <email>");
  process.exit(1);
}

await mongoose.connect(DB_URL);
console.log("✅ Connected to MongoDB");

const result = await mongoose.connection.db
  .collection("users")
  .findOneAndUpdate(
    { email: EMAIL_TO_VERIFY.toLowerCase() },
    { $set: { isVerified: true }, $unset: { otp: "", otpExpiry: "" } },
    { returnDocument: "after" }
  );

if (!result) {
  console.log(`❌ User not found: ${EMAIL_TO_VERIFY}`);
} else {
  console.log(`✅ User verified successfully!`);
  console.log(`   Email: ${result.email}`);
  console.log(`   isVerified: ${result.isVerified}`);
  console.log(`   Role: ${result.role}`);
}

await mongoose.disconnect();
console.log("✅ Done");
