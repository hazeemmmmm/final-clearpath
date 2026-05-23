import mongoose from "mongoose";
import { User } from "./src/db/models/user.model.js";
import { devConfig } from "./src/config/env/dev.config.js";

async function makeAdmin() {
  try {
    await mongoose.connect(devConfig.DB_URL);
    console.log("Connected to database successfully");
    const result = await User.findOneAndUpdate(
      { email: "admin_test_123@gmail.com" },
      { role: "admin", isVerified: true },
      { new: true }
    );
    if (result) {
      console.log("SUCCESS: Test user is now upgraded to admin role!");
      console.log("Details:", {
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        role: result.role,
        isVerified: result.isVerified
      });
    } else {
      console.log("ERROR: Test user 'admin_test_123@gmail.com' was not found in database.");
    }
  } catch (error) {
    console.error("Database connection or query error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

makeAdmin();
