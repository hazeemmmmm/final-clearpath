import mongoose from "mongoose";
import { devConfig } from "../config/env/dev.config.js";

// Pre-import all schemas to register them with mongoose
import "./models/user.model.js";
import "./models/provider.model.js";
import "./models/destination.model.js";
import "./models/Activity.model.js";
import "./models/experience.model.js";
import "./models/customtrip.model.js";
import "./models/booking.model.js";
import "./models/review.model.js";
import "./models/payment.model.js";
import "./models/chatbot.model.js";
import "./models/wishlist.model.js";
import "./models/token.model.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Reconnection handler — retries until the DB is back
const reconnect = async (attempt = 1) => {
  const delay = Math.min(5000 * attempt, 30000); // max 30s between retries
  console.log(`[DB] Reconnecting in ${delay / 1000}s (attempt ${attempt})...`);
  await new Promise(r => setTimeout(r, delay));
  try {
    await mongoose.connect(devConfig.DB_URL, MONGOOSE_OPTS);
  } catch {
    reconnect(attempt + 1);
  }
};

const MONGOOSE_OPTS = {
  serverSelectionTimeoutMS: 10000,  // give up selecting a server after 10s
  heartbeatFrequencyMS: 10000,       // ping server every 10s
  retryWrites: true,
  retryReads: true,
};

export const connectDB = async () => {
  // ── Connection lifecycle events ──────────────────────────
  mongoose.connection.on("connected",    () => console.log("[DB] Connected ✓"));
  mongoose.connection.on("disconnected", () => {
    console.warn("[DB] Disconnected — attempting reconnect...");
    reconnect();
  });
  mongoose.connection.on("error", (err) => {
    console.error("[DB] Connection error:", err.message);
  });

  try {
    console.log("Connecting to DB URL:", devConfig.DB_URL);
    await mongoose.connect(devConfig.DB_URL, MONGOOSE_OPTS);
    console.log("Database connected successfully");

    // Auto-seed mechanism
    const db = mongoose.connection.db;
    const experiencesCount = await db.collection("experiences").countDocuments();

    if (experiencesCount === 0) {
      console.log("Empty database detected. Starting auto-seed...");
      const seedPath = path.join(__dirname, "seedData.json");
      if (fs.existsSync(seedPath)) {
        const seedRaw = fs.readFileSync(seedPath, "utf8");
        const seedData = JSON.parse(seedRaw);

        // Convert string IDs back to ObjectId if necessary
        const toObjectId = (id) => new mongoose.Types.ObjectId(id);

        const parseDocs = (docs) => {
          return docs.map(doc => {
            const newDoc = { ...doc };
            if (newDoc._id) newDoc._id = toObjectId(newDoc._id);
            
            // Convert foreign keys/references in experiences
            if (newDoc.destination) newDoc.destination = toObjectId(newDoc.destination);
            
            // Convert references in itinerary activities
            if (newDoc.itinerary && Array.isArray(newDoc.itinerary)) {
              newDoc.itinerary = newDoc.itinerary.map(day => {
                const newDay = { ...day };
                if (newDay.activities && Array.isArray(newDay.activities)) {
                  newDay.activities = newDay.activities.map(act => {
                    const newAct = { ...act };
                    if (newAct.activity) newAct.activity = toObjectId(newAct.activity);
                    if (newAct.provider) newAct.provider = toObjectId(newAct.provider);
                    return newAct;
                  });
                }
                return newDay;
              });
            }

            // Convert references in activities
            if (newDoc.provider) newDoc.provider = toObjectId(newDoc.provider);
            
            return newDoc;
          });
        };

        if (seedData.destinations && seedData.destinations.length > 0) {
          await db.collection("destinations").insertMany(parseDocs(seedData.destinations));
          console.log(`Seeded ${seedData.destinations.length} destinations.`);
        }

        if (seedData.activities && seedData.activities.length > 0) {
          await db.collection("activities").insertMany(parseDocs(seedData.activities));
          console.log(`Seeded ${seedData.activities.length} activities.`);
        }

        if (seedData.experiences && seedData.experiences.length > 0) {
          await db.collection("experiences").insertMany(parseDocs(seedData.experiences));
          console.log(`Seeded ${seedData.experiences.length} experiences.`);
        }

        if (seedData.users && seedData.users.length > 0) {
          // Check if users already exist to avoid duplicates
          const parsedUsers = parseDocs(seedData.users);
          for (const user of parsedUsers) {
            const exists = await db.collection("users").findOne({ email: user.email });
            if (!exists) {
              await db.collection("users").insertOne(user);
            }
          }
          console.log("Seeded default administrative & provider accounts.");
        }

        console.log("Auto-seed process finished successfully!");
      } else {
        console.log("seedData.json file not found, skipping auto-seed.");
      }
    }
  } catch (error) {
    console.error("[DB] Initial connection failed:", error.message);
    reconnect();  // keep retrying until it connects
  }
};