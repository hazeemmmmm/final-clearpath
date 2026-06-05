import mongoose from 'mongoose';
import { devConfig } from '../src/config/env/dev.config.js';
import { Destination } from '../src/db/models/destination.model.js';
import { Experience } from '../src/db/models/experience.model.js';
import { Provider } from '../src/db/models/provider.model.js';
import { Activity } from '../src/db/models/Activity.model.js';
import { PackingGuide } from '../src/db/models/packingguide.model.js';

async function seedDayuseSokhna() {
  try {
    await mongoose.connect(devConfig.DB_URL);
    console.log("Connected to MongoDB successfully!");

    let sokhnaDest = await Destination.findOne({ name: 'Ain Sokhna' });
    if (!sokhnaDest) {
      sokhnaDest = await Destination.create({
        name: 'Ain Sokhna',
        country: 'Egypt',
        city: 'Ain Sokhna',
        location: 'Suez Governorate, Red Sea Coast',
        image: '/ilmonte_galala_pool_mountain.jpeg',
        description: "Egypt's closest Red Sea resort getaway, just 120 km from Cairo. Famous for crystal-clear waters, mountain-backed resorts perched on Galala cliffs, and the iconic Galala Cable Car — the ultimate weekend escape for Cairenes."
      });
      console.log("Created Destination: Ain Sokhna");
    }

    // ─── Providers ───────────────────────────────────────────────
    let wadiElDomProvider = await Provider.findOne({ name: 'Wadi El Dom Marina' });
    if (!wadiElDomProvider) {
      wadiElDomProvider = await Provider.create({
        name: 'Wadi El Dom Marina',
        type: 'TourOperator',
        trustScore: 92
      });
      console.log("Created Provider: Wadi El Dom Marina");
    }

    let clearPathProvider = await Provider.findOne({ name: 'ClearPath Logistics' });
    if (!clearPathProvider) {
      clearPathProvider = await Provider.create({
        name: 'ClearPath Logistics',
        type: 'Transport',
        trustScore: 91
      });
      console.log("Created Provider: ClearPath Logistics");
    }

    let sokhnaDivingProvider = await Provider.findOne({ name: 'Sokhna Diving Center' });
    if (!sokhnaDivingProvider) {
      sokhnaDivingProvider = await Provider.create({
        name: 'Sokhna Diving Center',
        type: 'Equipment',
        trustScore: 90
      });
      console.log("Created Provider: Sokhna Diving Center");
    }

    let redSeaCateringProvider = await Provider.findOne({ name: 'Red Sea Yacht Catering' });
    if (!redSeaCateringProvider) {
      redSeaCateringProvider = await Provider.create({
        name: 'Red Sea Yacht Catering',
        type: 'TourOperator',
        trustScore: 88
      });
      console.log("Created Provider: Red Sea Yacht Catering");
    }

    const upsertActivity = async (data) => {
      let act = await Activity.findOne({ name: data.name });
      if (act) await Activity.deleteOne({ _id: act._id });
      act = await Activity.create({ ...data, destination: sokhnaDest._id });
      console.log(`Created Activity: ${act.name} (${act.price} EGP)`);
      return act;
    };

    // Activity 1: Marina Meetup & Yacht Boarding (Included)
    const marinaBoardingAct = await upsertActivity({
      name: 'Wadi El Dom Marina Meetup & Luxury Yacht Boarding',
      type: 'transport',
      provider: clearPathProvider._id,
      price: 0,
      description: "Gather at the gates of Wadi El Dom Marina in Porto Sokhna for a safety briefing and welcome photos, followed by VIP boarding onto a chartered luxury multi-deck yacht for your full-day Red Sea adventure.",
      image: '/galala_marina_pier.jpeg'
    });

    // Activity 2: Snorkeling Over Sokhna Coral Reefs (4,200 EGP)
    const snorkelingAct = await upsertActivity({
      name: 'Snorkeling Over Sokhna Red Sea Coral Reefs',
      type: 'tour',
      provider: sokhnaDivingProvider._id,
      price: 4200,
      description: "The yacht anchors directly over a vibrant underwater coral reef site in the Red Sea. Guests snorkel with expert instructors to explore colourful fish, coral gardens, and rich marine life. Includes full snorkeling gear, wetsuit, and dedicated safety boat.",
      image: '/sokhna_coral_reef_snorkeling.jpeg'
    });

    // Activity 3: Fresh Seafood Lunch At Sea & Galala Sunset Cruise (Included)
    const sunsetCruiseAct = await upsertActivity({
      name: 'Fresh Seafood Lunch At Sea & Galala Mountain Sunset Cruise',
      type: 'food',
      provider: redSeaCateringProvider._id,
      price: 0,
      description: "Enjoy a freshly grilled seafood lunch prepared by the onboard chef while cruising along the dramatic Galala mountain coastline. The day closes with a golden sunset over the Red Sea as the yacht returns to Porto Sokhna marina.",
      image: '/sokhna_yacht_sunset_dinner.jpeg'
    });

    // ═══════════════════════════════════════════════════════════════
    // PACKAGE — Galala Coastal Breeze & Yacht Dayuse
    // ═══════════════════════════════════════════════════════════════
    const expName = 'Galala Coastal Breeze & Yacht Dayuse';
    let dayuseExp = await Experience.findOne({ name: expName });
    if (dayuseExp) {
      await Experience.deleteOne({ _id: dayuseExp._id });
      await PackingGuide.deleteOne({ experience: dayuseExp._id });
      console.log("Deleted existing Galala Dayuse experience.");
    }

    dayuseExp = new Experience({
      name: expName,
      type: 'Package',
      description: "A full-day luxury Red Sea escape launching from the exclusive Wadi El Dom Marina in Porto Sokhna. Board a private multi-deck yacht, snorkel over vibrant Red Sea coral reefs with expert guides, then feast on freshly grilled seafood as you cruise along the dramatic Galala mountain coastline at sunset.",
      duration_days: 1,
      price: 4200,
      capacity: 14,
      destination: sokhnaDest._id,
      availableDates: [
        { date: new Date('2026-06-20'), availableSeats: 14 },
        { date: new Date('2026-07-04'), availableSeats: 14 },
        { date: new Date('2026-07-18'), availableSeats: 14 },
        { date: new Date('2026-08-01'), availableSeats: 14 }
      ],
      priceBreakdown: [
        { label: 'Snorkeling Over Sokhna Coral Reefs (incl. gear, wetsuit & safety boat)', amount: 4200 }
      ],
      image: '/galala_marina_pier.jpeg',
      images: [
        '/galala_marina_pier.jpeg',
        '/galala_yacht_cruise.jpeg',
        '/sokhna_coral_reef_snorkeling.jpeg',
        '/sokhna_yacht_sunset_dinner.jpeg'
      ],
      included: [
        'Luxury multi-deck private yacht charter for the full day',
        'Safety briefing & VIP yacht boarding at Wadi El Dom Marina',
        'Expert-guided snorkeling over Sokhna Red Sea coral reefs',
        'Full snorkeling gear, wetsuit, and dedicated safety boat',
        'Freshly grilled seafood lunch prepared by onboard chef',
        'Galala mountain coastline sunset cruise'
      ],
      excluded: [
        'Transportation to/from Wadi El Dom Marina, Porto Sokhna',
        'Extra beverages beyond package allowance',
        'SCUBA diving (snorkeling only — upgrade available on request)',
        'Tipping for crew and snorkel guides',
        'Travel insurance'
      ],
      itinerary: [
        {
          day_number: 1,
          title: 'Red Sea Snorkeling, Seafood & Galala Sunset',
          image: '/galala_marina_pier.jpeg',
          description: "Arrive at Wadi El Dom Marina by 9:00 AM for your safety briefing and VIP yacht boarding. By 11:00 AM the yacht anchors over the coral reefs for 3 hours of guided snorkeling. At 2:30 PM, the onboard chef grills a fresh seafood lunch as the yacht cruises along the Galala mountain coastline, returning to the marina by 6:00 PM with the sunset behind you.",
          activities: [
            { activity: marinaBoardingAct._id, provider: clearPathProvider._id, price: 0, image: '/galala_marina_pier.jpeg' },
            { activity: snorkelingAct._id, provider: sokhnaDivingProvider._id, price: 4200, image: '/sokhna_coral_reef_snorkeling.jpeg' },
            { activity: sunsetCruiseAct._id, provider: redSeaCateringProvider._id, price: 0, image: '/sokhna_yacht_sunset_dinner.jpeg' }
          ]
        }
      ]
    });

    await dayuseExp.save();
    console.log("Successfully created: Galala Coastal Breeze & Yacht Dayuse!");

    const packingGuide = new PackingGuide({
      name: 'Red Sea Yacht & Snorkeling Dayuse Packing Guide',
      activityType: 'diving',
      experience: dayuseExp._id,
      destination: sokhnaDest._id,
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
        { item: 'Swimwear (1–2 sets)', notes: 'Wear one set, pack a spare for the cruise home' },
        { item: 'Lightweight cover-up or linen shirt', notes: 'Sun protection on deck during the yacht excursion' },
        { item: 'Sandals or flip-flops', notes: 'Easy on/off for yacht deck and swimming' },
        { item: 'Hat with chin strap', notes: 'Wind on the open sea can blow hats off — chin strap recommended' }
      ],
      safetyTips: [
        { tip: 'Never snorkel alone — stay within 3 meters of your assigned dive buddy at all times', severity: 'danger' },
        { tip: 'Do NOT touch or stand on coral reefs — they are protected Red Sea marine ecosystems', severity: 'danger' },
        { tip: 'Apply waterproof sunscreen every 2 hours — Red Sea UV is extreme and reflects off the water', severity: 'warning' },
        { tip: 'Inform the guide immediately if you feel ear pain, dizziness, or difficulty breathing', severity: 'warning' },
        { tip: 'Stay seated during anchoring and sailing maneuvers — never stand near bow lines', severity: 'warning' },
        { tip: 'Take anti-seasickness medication 30 minutes before boarding if you are susceptible', severity: 'info' }
      ],
      emergencyContacts: {
        police: '122',
        ambulance: '123',
        coastGuard: '16666',
        localHospital: 'Sokhna Medical Center: +20 62 359 0000'
      },
      difficultyLevel: 'easy',
      physicalRequirements: 'Basic swimming ability required. Snorkeling is beginner-friendly with full guide support. No strenuous walking involved.',
      weatherWarnings: [
        'Red Sea conditions can change quickly — check sea state the morning of your trip. High-swell days may delay snorkeling.',
        'Strong midday sun on open water — hat and regular sunscreen reapplication are essential.',
        'Wind on the open water is consistently stronger than on shore — bring a light layer for the sunset cruise.'
      ]
    });

    await packingGuide.save();
    dayuseExp.packingGuide = packingGuide._id;
    await dayuseExp.save();
    console.log("Packing Guide linked to Galala Dayuse!");

    console.log("\n✅ Galala Coastal Breeze & Yacht Dayuse seeded successfully!");

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedDayuseSokhna();
