import mongoose from "mongoose";
import { Experience } from "./src/db/models/experience.model.js";
import { Destination } from "./src/db/models/destination.model.js";
import ExperienceService from "./src/module/experience/experience.service.js";
import { devConfig } from "./src/config/env/dev.config.js";

async function testAddExperience() {
  try {
    await mongoose.connect(devConfig.DB_URL);
    console.log("Connected to MongoDB successfully!");

    const testPayload = {
      name: "Dahab Blue Hole & Canyon Adventure Test",
      type: "Trip",
      destination: "Dahab",
      base_price: 1500,
      duration_days: 2,
      capacity: 10,
      description: "A gorgeous luxury safari journey covering Dahab's finest locations, diving inside the Blue Hole, and climbing through the beautiful Canyon.",
      image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800",
      images: [
        "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800"
      ],
      itinerary: [
        {
          day_number: 1,
          description: "Arrival at Dahab, hotel check-in and evening diving excursion at the legendary Blue Hole.",
          activities: [
            {
              activity: "Blue Hole Scuba Diving",
              provider: "Red Sea Divers",
              price: 250
            }
          ]
        },
        {
          day_number: 2,
          description: "Wandering through the Canyon mountains and Bedouin lunch gathering.",
          activities: [
            {
              activity: "Canyon Hiking Tour",
              provider: "Bedouin Guides Co",
              price: 150
            }
          ]
        }
      ]
    };

    console.log("Adding experience using ExperienceService.create()...");
    const createdExp = await ExperienceService.create(testPayload);
    
    console.log("\nSUCCESS! Experience added successfully.");
    console.log("Created Experience ID:", createdExp._id);
    console.log("Created Experience Name:", createdExp.name);
    console.log("Resolved Destination ID:", createdExp.destination);
    console.log("Calculated Price (virtual):", createdExp.calculatedPrice);
    
  } catch (error) {
    console.error("Error during experience creation test:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

testAddExperience();
