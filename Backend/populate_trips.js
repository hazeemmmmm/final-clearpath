import mongoose from "mongoose";
import { Experience } from "./src/db/models/experience.model.js";
import { User } from "./src/db/models/user.model.js";
import { Destination } from "./src/db/models/destination.model.js";
import ExperienceService from "./src/module/experience/experience.service.js";
import { devConfig } from "./src/config/env/dev.config.js";

async function populateExperiences() {
  try {
    await mongoose.connect(devConfig.DB_URL);
    console.log("Connected to database successfully!");

    // Ensure Dahab Destination is resolved/created
    let dahabDest = await Destination.findOne({ name: { $regex: /^Dahab$/i } });
    if (!dahabDest) {
      dahabDest = await Destination.create({
        name: "Dahab",
        location: "South Sinai, Egypt",
        description: "The gold town, offering breathtaking coral reefs, windsurfing and mountains."
      });
    }
    console.log("Dahab Destination ID resolved to:", dahabDest._id);

    // Get a supervisor to assign
    let supervisor = await User.findOne({ role: "supervisor" });
    if (!supervisor) {
      // Create a default supervisor if none exists
      supervisor = await User.create({
        firstName: "Kareem",
        lastName: "Selim",
        email: "kareem.supervisor@clearpath.com",
        password: "defaultPassword123",
        role: "supervisor",
        isVerified: true
      });
    }
    console.log("Assigned Supervisor ID resolved to:", supervisor._id);

    // 🟢 3 Trips for Dahab (Multi-day)
    const trips = [
      {
        name: "Dahab Ultimate Hiking & Bedouin Culture Trip",
        type: "Trip",
        destination: "Dahab",
        base_price: 3200,
        duration_days: 3,
        capacity: 12,
        supervisor: supervisor._id,
        description: "An intensive 3-day deep desert safari covering Mount Sinai climbing, Bedouin camps, and local traditional camel logistics.",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800",
        images: [
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800",
          "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800"
        ],
        itinerary: [
          {
            day_number: 1,
            title: "Day 1 - Canyon Trekking",
            image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800",
            description: "Guided hike through Dahab Colored Canyon, exploring breathtaking rock formations.",
            activities: [
              { activity: "Colored Canyon Hiking", provider: "Sinai Local Guides", price: 300, description: "Professional Bedouin guided safety trek." }
            ]
          },
          {
            day_number: 2,
            title: "Day 2 - Mount Sinai Climb",
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800",
            description: "Night climb up Mount Sinai for a spectacular sunrise over the peninsula.",
            activities: [
              { activity: "St. Catherine Sunrise Climb", provider: "Bedouin Guides Co", price: 450, description: "Sunrise trek and camel ride logistics." }
            ]
          },
          {
            day_number: 3,
            title: "Day 3 - Bedouin Camp Feast",
            image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=800",
            description: "Concluding the trip with traditional herbal tea and a desert feast under the stars.",
            activities: [
              { activity: "Desert Stargazing & Feast", provider: "Bedouin Oasis Camp", price: 350, description: "Bedouin dinner with local musical shows." }
            ]
          }
        ]
      },
      {
        name: "Dahab Marine Safari & Deep Coral Diving Trip",
        type: "Trip",
        destination: "Dahab",
        base_price: 4500,
        duration_days: 3,
        capacity: 8,
        supervisor: supervisor._id,
        description: "A premium 3-day deep diving excursion spanning Blue Hole, Three Pools, and Gabr El Bint via luxury speedboats.",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800",
        images: [
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800",
          "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800"
        ],
        itinerary: [
          {
            day_number: 1,
            title: "Day 1 - Gabr El Bint Snorkeling",
            image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800",
            description: "Speedboat ride to Gabr El Bint, an untouched marine park with stunning reefs.",
            activities: [
              { activity: "Gabr El Bint Speedboat Snorkeling", provider: "Red Sea Marine Co", price: 500, description: "High-speed cruise and full snorkeling gear." }
            ]
          },
          {
            day_number: 2,
            title: "Day 2 - Blue Hole Deep Diving",
            image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800",
            description: "Guided deep-sea scuba dive at the legendary Dahab Blue Hole.",
            activities: [
              { activity: "Blue Hole Scuba Diving Pro", provider: "Orca Dive Club Dahab", price: 800, description: "Full tank scuba diving with certified PADI guides." }
            ]
          },
          {
            day_number: 3,
            title: "Day 3 - Three Pools Coral Garden",
            image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800",
            description: "Wandering through the gorgeous Three Pools and enjoying a coral garden exploration.",
            activities: [
              { activity: "Three Pools Snorkeling Guide", provider: "Local Reef Experts", price: 200, description: "Shallow pools family friendly snorkeling." }
            ]
          }
        ]
      },
      {
        name: "Dahab Luxury Wellness & Windsurfing Retreat",
        type: "Trip",
        destination: "Dahab",
        base_price: 5900,
        duration_days: 3,
        capacity: 10,
        supervisor: supervisor._id,
        description: "Rejuvenate yourself with our 3-day wellness program focusing on yoga, windsurfing at Dahab Lagoon, and luxury hotel accommodations.",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800",
        images: [
          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800",
          "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800"
        ],
        itinerary: [
          {
            day_number: 1,
            title: "Day 1 - Lagoon Windsurfing",
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800",
            description: "Beginners to advanced windsurfing training session in the calm waters of Dahab Lagoon.",
            activities: [
              { activity: "Lagoon Windsurfing Masterclass", provider: "Harry Nass Surf Center", price: 600, description: "Pro windsurf equipment rental and personal coaching." }
            ]
          },
          {
            day_number: 2,
            title: "Day 2 - Sunrise Beach Yoga",
            image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800",
            description: "A calming morning meditation and yoga session right on the shores of Blue Lagoon.",
            activities: [
              { activity: "Sunrise Yoga & Meditation", provider: "Coral Coast Wellness", price: 250, description: "Sunset yoga mats and herbal drinks included." }
            ]
          },
          {
            day_number: 3,
            title: "Day 3 - Sound Healing Therapy",
            image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800",
            description: "Closing sound bowl vibration healing and relaxation in Sinai hills.",
            activities: [
              { activity: "Tibetan Sound Bowl Therapy", provider: "Sinai Healing Sanctuary", price: 400, description: "Relaxing sound healing bath in Sinai peaks." }
            ]
          }
        ]
      }
    ];

    // 🟢 3 Dayuse Packages for Dahab (Single-day)
    const dayuses = [
      {
        name: "Dahab Dayuse: Blue Hole Diving & Camel Safari",
        type: "Package",
        destination: "Dahab",
        base_price: 950,
        duration_days: 1,
        capacity: 20,
        supervisor: supervisor._id,
        description: "The classic Dahab single-day experience. Spend the day diving at the Blue Hole, riding camels along the coastline, and eating Bedouin lunch.",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800",
        images: [
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800",
          "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=800"
        ],
        itinerary: [
          {
            day_number: 1,
            title: "Single Day - Blue Hole Camel Excursion",
            image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800",
            description: "Morning camel ride from Blue Hole protectorate, full snorkeling at the reef, and freshly grilled Bedouin lunch.",
            activities: [
              { activity: "Blue Hole Snorkeling", provider: "Red Sea Marine Co", price: 200, description: "Mask, snorkel, and life jacket gear rentals." },
              { activity: "Coastline Camel Safari", provider: "Bedouin Guides Co", price: 150, description: "Camel trekking along the Gulf of Aqaba." }
            ]
          }
        ]
      },
      {
        name: "Dahab Dayuse: Wadi Gnai Quad Biking & Climbing",
        type: "Package",
        destination: "Dahab",
        base_price: 1100,
        duration_days: 1,
        capacity: 15,
        supervisor: supervisor._id,
        description: "Adrenaline packed quad bike safari through Dahab dry canyons, followed by basic rock climbing at Wadi Gnai's granite rocks.",
        image: "https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=800",
        images: [
          "https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=800",
          "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800"
        ],
        itinerary: [
          {
            day_number: 1,
            title: "Single Day - Canyons Quad Bike & Climbing",
            image: "https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=800",
            description: "Quad biking in Sinai canyons, followed by safe harness rock climbing at granite walls of Wadi Gnai.",
            activities: [
              { activity: "Wadi Gnai Quad Biking", provider: "Dahab Safari Center", price: 400, description: "2 hours single seat quad bike rental." },
              { activity: "Granite Rock Climbing", provider: "Sinai Local Guides", price: 300, description: "Safety harnesses, helmets, and instructors." }
            ]
          }
        ]
      },
      {
        name: "Dahab Dayuse: Three Pools snorkeling & Glassboat ride",
        type: "Package",
        destination: "Dahab",
        base_price: 850,
        duration_days: 1,
        capacity: 25,
        supervisor: supervisor._id,
        description: "A leisure family package featuring a scenic glassboat excursion to look at Aqaba's premium coral reefs, ending with a snorkeling swim at Three Pools.",
        image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800",
        images: [
          "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800"
        ],
        itinerary: [
          {
            day_number: 1,
            title: "Single Day - Family Glassboat & Coral snorkeling",
            image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800",
            description: "1-hour glassboat tour to view marine life without getting wet, followed by a snorkeling session inside Three Pools.",
            activities: [
              { activity: "Dahab Glassboat Coral Tour", provider: "Glassboat Cruises Co", price: 200, description: "Glass boat ride with coral guides." },
              { activity: "Three Pools Snorkeling swim", provider: "Local Reef Experts", price: 150, description: "Snorkeling guides inside the shallow reef pools." }
            ]
          }
        ]
      }
    ];

    console.log("Populating 3 Trips...");
    for (const trip of trips) {
      const created = await ExperienceService.create(trip);
      console.log(`- Created Trip: "${created.name}" (ID: ${created._id})`);
    }

    console.log("Populating 3 Dayuses...");
    for (const dayuse of dayuses) {
      const created = await ExperienceService.create(dayuse);
      console.log(`- Created Dayuse: "${created.name}" (ID: ${created._id})`);
    }

    console.log("\nPOPULATION COMPLETE! Programmatic verification succeeded.");

  } catch (error) {
    console.error("Error populating database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

populateExperiences();
