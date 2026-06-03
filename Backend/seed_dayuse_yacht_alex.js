import mongoose from 'mongoose';
import { devConfig } from './src/config/env/dev.config.js';
import { Destination } from './src/db/models/destination.model.js';
import { Experience } from './src/db/models/experience.model.js';
import { Provider } from './src/db/models/provider.model.js';
import { Activity } from './src/db/models/Activity.model.js';
import { PackingGuide } from './src/db/models/packingguide.model.js';

async function seedDayuseYachtAlex() {
  try {
    await mongoose.connect(devConfig.DB_URL);
    console.log("Connected to MongoDB successfully!");

    const alexDest = await Destination.findOne({ name: 'Alexandria' });
    if (!alexDest) {
      console.error("Alexandria destination not found. Please seed basic destinations first.");
      process.exit(1);
    }

    // ─── Providers ───────────────────────────────────────────────
    let yachtClubProvider = await Provider.findOne({ name: 'Alexandria Eastern Harbour Yacht Club' });
    if (!yachtClubProvider) {
      yachtClubProvider = await Provider.create({
        name: 'Alexandria Eastern Harbour Yacht Club',
        type: 'TourOperator',
        trustScore: 94
      });
      console.log("Created Provider: Alexandria Eastern Harbour Yacht Club");
    }

    let clearPathLogisticsProvider = await Provider.findOne({ name: 'ClearPath Logistics' });
    if (!clearPathLogisticsProvider) {
      clearPathLogisticsProvider = await Provider.create({
        name: 'ClearPath Logistics',
        type: 'Transport',
        trustScore: 91
      });
      console.log("Created Provider: ClearPath Logistics");
    }

    let alexDivingProvider = await Provider.findOne({ name: 'Alex Diving Center' });
    if (!alexDivingProvider) {
      alexDivingProvider = await Provider.create({
        name: 'Alex Diving Center',
        type: 'Equipment',
        trustScore: 93
      });
      console.log("Created Provider: Alex Diving Center");
    }

    let blueHorizonProvider = await Provider.findOne({ name: 'Blue Horizon Yacht Catering' });
    if (!blueHorizonProvider) {
      blueHorizonProvider = await Provider.create({
        name: 'Blue Horizon Yacht Catering',
        type: 'TourOperator',
        trustScore: 89
      });
      console.log("Created Provider: Blue Horizon Yacht Catering");
    }

    const upsertActivity = async (data) => {
      let act = await Activity.findOne({ name: data.name });
      if (act) await Activity.deleteOne({ _id: act._id });
      act = await Activity.create({ ...data, destination: alexDest._id });
      console.log(`Created Activity: ${act.name} (${act.price} EGP)`);
      return act;
    };

    // ═══════════════════════════════════════════════════════════════
    // PACKAGE — Mediterranean Yacht Cruise & Sunken Ruins Discovery
    // ═══════════════════════════════════════════════════════════════

    // Activity 1: Citadel Panoramic Walk & Yacht Boarding (Included)
    const CitadelWalkAct = await upsertActivity({
      name: 'Citadel of Qaitbay Panoramic Walk & Yacht Boarding',
      type: 'tour',
      provider: clearPathLogisticsProvider._id,
      price: 0,
      description: "Gather at the iconic gates of the Citadel of Qaitbay overlooking the Mediterranean for panoramic photos, followed by VIP boarding onto a chartered luxury multi-deck yacht at the historic Eastern Harbour.",
      image: '/qaitbay_citadel.png'
    });

    // Activity 2: Snorkeling Over Cleopatra's Sunken Palace (4200 EGP)
    const SnorkelingAct = await upsertActivity({
      name: "Snorkeling Over Cleopatra's Sunken Palace & Pharos Ruins",
      type: 'tour',
      provider: alexDivingProvider._id,
      price: 4200,
      description: "The yacht anchors directly over the ancient underwater archaeological site off the Eastern Harbour. Accompanied by expert divers, snorkel through the submerged remains of the ancient Pharos lighthouse and Cleopatra's sunken palace — a living museum beneath the sea. Includes all snorkeling gear, wetsuit, and dedicated safety boat.",
      image: '/sunken_ruins_underwater.png'
    });

    // Activity 3: Fresh Catch Lunch At Sea & Sunset Cruise (Included)
    const SunsetCruiseAct = await upsertActivity({
      name: 'Fresh Catch Seafood Lunch At Sea & Mediterranean Sunset Cruise',
      type: 'food',
      provider: blueHorizonProvider._id,
      price: 0,
      description: "Savour a freshly grilled seafood lunch prepared live by the onboard chef — think whole sea bream, grilled prawns, and Mediterranean mezze — while the yacht cruises further into the open sea. The day ends with a breathtaking panoramic sunset over Alexandria's legendary skyline.",
      image: '/yacht_seafood_lunch.png'
    });

    const expName = 'Mediterranean Yacht Cruise & Sunken Ruins Discovery';
    let yachtExp = await Experience.findOne({ name: expName });
    if (yachtExp) {
      await Experience.deleteOne({ _id: yachtExp._id });
      await PackingGuide.deleteOne({ experience: yachtExp._id });
      console.log("Deleted existing Yacht Cruise experience.");
    }

    yachtExp = new Experience({
      name: expName,
      type: 'Package',
      description: "A full day of high-sea adventure off the coast of Alexandria — begin with a panoramic walk at the Citadel of Qaitbay before boarding a luxury chartered yacht. Snorkel through the actual submerged ruins of Cleopatra's palace and the ancient Pharos lighthouse, then feast on freshly grilled seafood at sea as the Mediterranean sun sets over the city skyline.",
      duration_days: 1,
      price: 4200,
      capacity: 12,
      destination: alexDest._id,
      availableDates: [
        { date: new Date('2026-06-21'), availableSeats: 12 },
        { date: new Date('2026-07-05'), availableSeats: 12 },
        { date: new Date('2026-07-19'), availableSeats: 12 },
        { date: new Date('2026-08-02'), availableSeats: 12 }
      ],
      priceBreakdown: [
        { label: "Snorkeling Over Cleopatra's Sunken Palace (incl. gear, wetsuit & safety boat)", amount: 4200 }
      ],
      image: '/qaitbay_harbour_boats.png',
      images: [
        '/qaitbay_harbour_boats.png',
        '/qaitbay_citadel.png',
        '/qaitbay_fishing_boats.png',
        '/sunken_city_statue.png',
        '/sunken_ruins_underwater.png',
        '/sunken_city_divers_wreck.png',
        '/yacht_diver_wreck.png',
        '/yacht_seafood_lunch.png',
        '/yacht_sunset_cruise.png'
      ],
      included: [
        'Luxury multi-deck private yacht charter for the full day',
        'Citadel of Qaitbay panoramic guided walk',
        'VIP yacht boarding & welcome drink',
        "Snorkeling over Cleopatra's Sunken Palace & Pharos ruins with expert diver guide",
        'Full snorkeling gear, wetsuit, and dedicated safety boat',
        'Freshly grilled seafood lunch prepared by onboard chef',
        'Mediterranean sunset cruise over Alexandria skyline'
      ],
      excluded: [
        'Transportation to/from Eastern Harbour',
        'Extra beverages beyond the package allowance',
        'SCUBA diving (snorkeling only — upgrade available on request)',
        'Tipping for crew and dive guides',
        'Travel insurance'
      ],
      itinerary: [
        {
          day_number: 1,
          title: 'Yacht, Sunken Ruins & Sunset Over Alexandria',
          image: '/qaitbay_harbour_boats.png',
          description: "Meet at 10:00 AM at the Citadel of Qaitbay for a panoramic walk and VIP yacht boarding. By 12:00 PM the yacht anchors over the sunken ruins for a 3-hour guided snorkeling session. At 3:30 PM, the onboard chef fires up the grill for a fresh seafood feast as the yacht cruises out for the panoramic Mediterranean sunset, returning to port by 6:00 PM.",
          activities: [
            { activity: CitadelWalkAct._id, provider: clearPathLogisticsProvider._id, price: 0, image: '/qaitbay_citadel.png' },
            { activity: SnorkelingAct._id, provider: alexDivingProvider._id, price: 4200, image: '/sunken_ruins_underwater.png' },
            { activity: SunsetCruiseAct._id, provider: blueHorizonProvider._id, price: 0, image: '/yacht_seafood_lunch.png' }
          ]
        }
      ]
    });

    await yachtExp.save();
    console.log("Successfully created: Mediterranean Yacht Cruise & Sunken Ruins Discovery!");

    const packingGuide = new PackingGuide({
      name: 'Mediterranean Yacht & Snorkeling Packing & Safety Guide',
      activityType: 'diving',
      experience: yachtExp._id,
      destination: alexDest._id,
      essentials: [
        { item: 'Swimwear', icon: '🩱', required: true },
        { item: 'Sunscreen SPF 50+ (waterproof)', icon: '🌞', required: true },
        { item: 'Sunglasses (UV400)', icon: '🕶️', required: true },
        { item: 'Water bottle (1.5L)', icon: '💧', required: true },
        { item: 'Towel', icon: '🏖️', required: true },
        { item: 'Cash (EGP) for extras & tips', icon: '💵', required: true },
        { item: 'Anti-seasickness medication (if prone)', icon: '💊', required: false },
        { item: 'Waterproof phone case', icon: '📱', required: false },
        { item: 'Underwater camera or GoPro', icon: '📸', required: false }
      ],
      clothing: [
        { item: 'Swimwear (1–2 sets)', notes: 'Wear one set, pack a spare for the cruise back' },
        { item: 'Lightweight cover-up or linen shirt', notes: 'Protection from midday Mediterranean sun on deck' },
        { item: 'Sandals or flip-flops', notes: 'Easy to slip on/off for the yacht deck and swimming' },
        { item: 'Hat with chin strap', notes: 'Wind on the open sea can blow hats off — secure chin strap recommended' }
      ],
      safetyTips: [
        { tip: 'Never snorkel alone — stay within 3 meters of your assigned dive buddy at all times', severity: 'danger' },
        { tip: 'Do NOT touch or stand on underwater ruins — disturbance damages the fragile archaeological site', severity: 'danger' },
        { tip: 'Apply waterproof sunscreen every 2 hours — Mediterranean UV is extreme and reflects off the water', severity: 'warning' },
        { tip: 'Inform the dive guide immediately if you feel any ear pain, dizziness, or difficulty breathing', severity: 'warning' },
        { tip: 'Stay on deck during anchoring and sail maneuvers — never stand near the bow lines', severity: 'warning' },
        { tip: 'Take anti-seasickness medication 30 minutes before boarding if you are susceptible', severity: 'info' }
      ],
      emergencyContacts: {
        police: '122',
        ambulance: '123',
        coastGuard: '16666',
        localHospital: 'Alexandria Medical Center: +20 3 425 9922'
      },
      difficultyLevel: 'moderate',
      physicalRequirements: 'Basic swimming ability required. Snorkeling is easy for all fitness levels with guide support. Light walking (~1 km) at the Citadel.',
      weatherWarnings: [
        'The excursion runs in open Mediterranean waters — check sea conditions the morning of your trip. High-swell days (above 1.5m) may delay or reschedule the snorkeling portion.',
        'Strong midday sun on the open sea — wear a hat and reapply sunscreen throughout the day.',
        'Wind on the open water can be significantly stronger than on shore — bring a light layer for the sunset cruise.'
      ]
    });

    await packingGuide.save();
    yachtExp.packingGuide = packingGuide._id;
    await yachtExp.save();
    console.log("Packing Guide linked to Yacht Cruise!");

    console.log("\n✅ Mediterranean Yacht Cruise & Sunken Ruins Discovery seeded successfully!");

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedDayuseYachtAlex();
