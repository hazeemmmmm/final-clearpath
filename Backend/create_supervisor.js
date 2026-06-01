import mongoose from "mongoose";
import { User } from "./src/db/models/user.model.js";
import { devConfig } from "./src/config/env/dev.config.js";
import bcrypt from "bcryptjs";

async function createSupervisor() {
  try {
    await mongoose.connect(devConfig.DB_URL);
    console.log("Connected to database successfully");

    const email = "supervisor_test@clearpath.com";
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      console.log("User already exists. Updating role to supervisor...");
      user.role = "supervisor";
      user.isVerified = true;
      await user.save();
    } else {
      console.log("User does not exist. Creating new supervisor user...");
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("SuperPass123!", salt);

      user = new User({
        firstName: "Super",
        lastName: "Visor",
        email: email,
        password: hashedPassword,
        role: "supervisor",
        isVerified: true,
        phoneNumber: "+201234567890",
        gender: "male",
        nationality: "Egyptian",
        ageDate: new Date("1990-01-01"),
        userAgent: 1 // USER_AGENT.local
      });

      await user.save();
    }

    console.log("SUCCESS: Supervisor account is set up!");
    console.log("Details:", {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    });

  } catch (error) {
    console.error("Database connection or query error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

createSupervisor();
