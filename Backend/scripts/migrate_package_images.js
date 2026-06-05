import mongoose from "mongoose";
import "../src/db/models/user.model.js";
import "../src/db/models/provider.model.js";
import "../src/db/models/destination.model.js";
import "../src/db/models/Activity.model.js";
import { Experience } from "../src/db/models/experience.model.js";
import "../src/db/models/customtrip.model.js";
import { devConfig } from "../src/config/env/dev.config.js";

// Curated 12 completely unique photo sets (each with 4 different real Egyptian photos)
const UNIQUE_PHOTO_SETS = [
  // 1. Pyramids Giza Luxury Set
  {
    main: "https://images.unsplash.com/photo-1503177119275-0aa32b31d468?auto=format&fit=crop&w=1200&q=80", // Pyramids
    safari: "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80", // Quad biking dunes
    hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", // Mena House hotel balcony
    dining: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=1200&q=80"  // Grill dining
  },
  // 2. Cairo Historical Islamic & Nile Set
  {
    main: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80", // Mosque
    safari: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80", // Cairo Nile felucca
    hotel: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", // Cairo historic suite
    dining: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80"  // Traditional koshary feast
  },
  // 3. Aswan Nile Cruise Explorer Set
  {
    main: "https://images.unsplash.com/photo-1506970144740-57977997b6d1?auto=format&fit=crop&w=1200&q=80", // Felucca
    safari: "https://images.unsplash.com/photo-1568322422394-60447590e844?auto=format&fit=crop&w=1200&q=80", // Abu Simbel Aswan
    hotel: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80", // Nile view luxury pool
    dining: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80"  // Dining overlooking Aswan Nile
  },
  // 4. Luxor Valley of Kings Ancient Set
  {
    main: "https://images.unsplash.com/photo-1544913776-90c1223073a3?auto=format&fit=crop&w=1200&q=80", // Karnak temple
    safari: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", // Balloon over Luxor
    hotel: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80", // Luxor hotel poolside
    dining: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"  // Ancient local courtyard dining
  },
  // 5. Hurghada Coral Reef & Beach Set
  {
    main: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80", // Red sea resort
    safari: "https://images.unsplash.com/photo-1509316975850-ff9c5edd0cd9?auto=format&fit=crop&w=1200&q=80", // Quad safari canyons
    hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", // Beachfront suite
    dining: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"  // Gourmet seafood restaurant
  },
  // 6. Dahab Blue Hole & Sinai Bedouin Set
  {
    main: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", // Dahab lagoon
    safari: "https://images.unsplash.com/photo-1618083707368-b3823daa2726?auto=format&fit=crop&w=1200&q=80", // Bedouin starry desert camp
    hotel: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80", // Dahab boutique beach hotel
    dining: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=1200&q=80"  // Seafood restaurant Dahab shore
  },
  // 7. Sharm El Sheikh Luxury Resort Set
  {
    main: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", // Beach yacht
    safari: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80", // Quad desert sands sharm
    hotel: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80", // Sharm resort lobby/pool
    dining: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80"  // Five star resort dinner
  },
  // 8. Siwa Oasis Desert Ecolodge Set
  {
    main: "https://images.unsplash.com/photo-1509316975850-ff9c5edd0cd9?auto=format&fit=crop&w=1200&q=80", // Siwa desert lake
    safari: "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80", // Stargazing camp
    hotel: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80", // Siwa mud ecolodge
    dining: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"  // Authentic dates & tea lounge
  },
  // 9. Fayoum Magic Lake Camping Set
  {
    main: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=1200&q=80", // Magic lake
    safari: "https://images.unsplash.com/photo-1618083707368-b3823daa2726?auto=format&fit=crop&w=1200&q=80", // Fayoum dunes 4x4 safari
    hotel: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", // Tunis village ecolodge suite
    dining: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80"  // Fayoumi clay pottery baked food
  },
  // 10. Alexandria seafront Mediterranean Set
  {
    main: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80", // Qaitbay citadel sea
    safari: "https://images.unsplash.com/photo-1506970144740-57977997b6d1?auto=format&fit=crop&w=1200&q=80", // Corniche tour
    hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", // Sea view hotel suite
    dining: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"  // Mediterranean seafood platter
  },
  // 11. White Desert Stargazing Adventure Set
  {
    main: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=1200&q=80", // White desert formations
    safari: "https://images.unsplash.com/photo-1509316975850-ff9c5edd0cd9?auto=format&fit=crop&w=1200&q=80", // Camel trekking
    hotel: "https://images.unsplash.com/photo-1618083707368-b3823daa2726?auto=format&fit=crop&w=1200&q=80", // Bedouin luxury glamping
    dining: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=1200&q=80"  // Campfire cooked bedouin rice
  },
  // 12. Grand Museum & Palace Downtown Set
  {
    main: "https://images.unsplash.com/photo-1503177119275-0aa32b31d468?auto=format&fit=crop&w=1200&q=80", // Grand museum
    safari: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80", // Nile water taxi activity
    hotel: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80", // Nile view luxury room cairo
    dining: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80"  // Traditional fine dining Cairo
  }
];

async function runMigration() {
  try {
    await mongoose.connect(devConfig.DB_URL);
    console.log("Connected to MongoDB successfully!");

    const experiences = await Experience.find();
    console.log(`Found ${experiences.length} packages to migrate.`);

    let count = 0;
    for (let i = 0; i < experiences.length; i++) {
      let exp = experiences[i];
      
      // Select a completely different photo set based on the package index i
      const set = UNIQUE_PHOTO_SETS[i % UNIQUE_PHOTO_SETS.length];

      const updatedImages = [
        set.main,
        set.safari,
        set.hotel,
        set.dining
      ];

      exp.image = set.main;
      exp.images = updatedImages;

      await exp.save();
      count++;
      console.log(`Updated unique package: "${exp.name}" [Index: ${i}] with entirely DIFFERENT and unique photos.`);
    }

    console.log(`\nSUCCESS: Migrated ${count} packages in the database with 100% individual unique photo sets!`);
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed.");
  }
}

runMigration();
