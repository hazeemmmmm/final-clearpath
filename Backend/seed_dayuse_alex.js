import mongoose from 'mongoose';
import { devConfig } from './src/config/env/dev.config.js';
import { Destination } from './src/db/models/destination.model.js';
import { Experience } from './src/db/models/experience.model.js';
import { Provider } from './src/db/models/provider.model.js';
import { Activity } from './src/db/models/Activity.model.js';
import { PackingGuide } from './src/db/models/packingguide.model.js';

async function seedDayuseAlex() {
  try {
    await mongoose.connect(devConfig.DB_URL);
    console.log("Connected to MongoDB successfully!");

    const alexDest = await Destination.findOne({ name: 'Alexandria' });
    if (!alexDest) {
      console.error("Alexandria destination not found. Please seed basic destinations first.");
      process.exit(1);
    }

    // ─── Providers ───────────────────────────────────────────────
    let helnanProvider = await Provider.findOne({ name: 'Helnan Palestine Hotel' });
    if (!helnanProvider) {
      helnanProvider = await Provider.create({
        name: 'Helnan Palestine Hotel',
        type: 'TourOperator',
        trustScore: 96
      });
      console.log("Created Provider: Helnan Palestine Hotel");
    }

    let clearPathProvider = await Provider.findOne({ name: 'ClearPath Local Guides' });
    if (!clearPathProvider) {
      clearPathProvider = await Provider.create({
        name: 'ClearPath Local Guides',
        type: 'Guide',
        trustScore: 90
      });
      console.log("Created Provider: ClearPath Local Guides");
    }

    const upsertActivity = async (data) => {
      let act = await Activity.findOne({ name: data.name });
      if (act) await Activity.deleteOne({ _id: act._id });
      act = await Activity.create({ ...data, destination: alexDest._id });
      console.log(`Created Activity: ${act.name} (${act.price} EGP)`);
      return act;
    };

    // ═══════════════════════════════════════════════════════════════
    // PACKAGE — Montazah Royal Beach & Gardens Escape
    // ═══════════════════════════════════════════════════════════════

    // Activity 1: Royal Gardens Walk & Morning Coffee (Included)
    const GardensWalkAct = await upsertActivity({
      name: 'Montazah Royal Gardens Walk & Morning Coffee',
      type: 'tour',
      provider: clearPathProvider._id,
      price: 0,
      description: "Arrive at the historic Montazah Royal Gardens. Enjoy a guided walking tour through the lush green canopy, pine trees, and historic bridges, followed by a premium morning coffee setup overlooking the tea palace.",
      image: '/montazah_palace_garden.jpg'
    });

    // Activity 2: Exclusive Private Beach & Cabana Access (3500 EGP)
    const BeachCabanaAct = await upsertActivity({
      name: 'Helnan Palestine Private Beach & Cabana Day Use',
      type: 'tour',
      provider: helnanProvider._id,
      price: 3500,
      description: "Check into your premium day-use beach cabana at Helnan Palestine. Enjoy swimming in the Mediterranean, sunbathing on the private sandy beach, and luxury beach stewardship service.",
      image: '/helnan_private_beach.jpg'
    });

    // Activity 3: Sunset Seafood Dining & Promenade Walk (Included)
    const SunsetDiningAct = await upsertActivity({
      name: 'Sunset Seafood Dining & Yacht Marina Promenade',
      type: 'food',
      provider: helnanProvider._id,
      price: 0,
      description: "A lavish 3-course seafood dinner served at the hotel's terrace directly on the water during sunset, followed by a free stroll around the private yacht marina.",
      image: '/helnan_sunset_dining.jpg'
    });

    const expName = 'Montazah Royal Beach & Gardens Escape';
    let montazahExp = await Experience.findOne({ name: expName });
    if (montazahExp) {
      await Experience.deleteOne({ _id: montazahExp._id });
      await PackingGuide.deleteOne({ experience: montazahExp._id });
      console.log("Deleted existing Montazah experience.");
    }

    montazahExp = new Experience({
      name: expName,
      type: 'Package',
      description: "A royal full-day escape to the legendary Montazah Gardens and Helnan Palestine Hotel's private Mediterranean beach. Begin with a guided morning walk through royal pine gardens, spend the afternoon in a luxury beach cabana, and end the day with a 3-course sunset seafood dinner on the water.",
      duration_days: 1,
      price: 3500,
      capacity: 15,
      destination: alexDest._id,
      availableDates: [
        { date: new Date('2026-06-20'), availableSeats: 15 },
        { date: new Date('2026-06-27'), availableSeats: 15 },
        { date: new Date('2026-07-04'), availableSeats: 15 },
        { date: new Date('2026-07-18'), availableSeats: 15 }
      ],
      priceBreakdown: [
        { label: 'Helnan Palestine Private Beach & Cabana Day Use (incl. morning coffee & sunset dinner)', amount: 3500 }
      ],
      image: '/helnan_private_beach.jpg',
      images: [
        '/helnan_private_beach.jpg',
        '/montazah_palace_garden.jpg',
        '/montazah_salamlek_palace.jpg',
        '/alexandria_beach_lighthouse.jpg',
        '/helnan_palestine_hotel.jpg',
        '/montazah_morning_coffee.jpg',
        '/helnan_sunset_dining.jpg'
      ],
      included: [
        'Guided morning walk through Montazah Royal Gardens with premium coffee',
        'Full-day private beach cabana access at Helnan Palestine Hotel',
        'Swimming in the Mediterranean & luxury beach stewardship service',
        '3-course sunset seafood dinner at the hotel sea terrace',
        'Free stroll around the private yacht marina'
      ],
      excluded: [
        'Transportation to/from Helnan Palestine Hotel',
        'Extra beverages beyond the package allowance',
        'Water sports & activities (available on site at extra cost)',
        'Tipping for guides and hotel staff'
      ],
      itinerary: [
        {
          day_number: 1,
          title: 'A Royal Day at Montazah — Gardens, Beach & Sunset Dining',
          image: '/montazah_palace_garden.jpg',
          description: "Start at 9:00 AM with a guided garden walk and morning coffee. Check into your beach cabana at 12:00 PM for an afternoon of Mediterranean swimming and sunbathing. End the day at 5:00 PM with a lavish sunset seafood dinner on the water terrace.",
          activities: [
            { activity: GardensWalkAct._id, provider: clearPathProvider._id, price: 0, image: '/montazah_palace_garden.jpg' },
            { activity: BeachCabanaAct._id, provider: helnanProvider._id, price: 3500, image: '/helnan_private_beach.jpg' },
            { activity: SunsetDiningAct._id, provider: helnanProvider._id, price: 0, image: '/helnan_sunset_dining.jpg' }
          ]
        }
      ]
    });

    await montazahExp.save();
    console.log("Successfully created: Montazah Royal Beach & Gardens Escape!");

    const packingGuide = new PackingGuide({
      name: 'Montazah Royal Beach Escape Packing & Safety Guide',
      activityType: 'beach',
      experience: montazahExp._id,
      destination: alexDest._id,
      essentials: [
        { item: 'Swimwear & beach towel', icon: '🩱', required: true },
        { item: 'Sunscreen SPF 50+', icon: '🌞', required: true },
        { item: 'Sunglasses & hat', icon: '🕶️', required: true },
        { item: 'Water bottle (1.5L)', icon: '💧', required: true },
        { item: 'Cash (EGP) for extras & tips', icon: '💵', required: true },
        { item: 'Waterproof phone case', icon: '📱', required: false }
      ],
      clothing: [
        { item: 'Swimwear', notes: 'Required for beach cabana access' },
        { item: 'Light cover-up or kaftan', notes: 'For garden walk and dining — smart-casual for the restaurant' },
        { item: 'Comfortable sandals or flip-flops', notes: 'Easy for beach and garden walk' },
        { item: 'Evening outfit (smart-casual)', notes: 'Sunset terrace dinner has a smart-casual dress code' }
      ],
      safetyTips: [
        { tip: 'Apply sunscreen every 2 hours — Mediterranean UV is intense from 11 AM to 4 PM', severity: 'warning' },
        { tip: 'Swim only within the hotel\'s designated swimming zone — marked by buoys', severity: 'danger' },
        { tip: 'Keep valuables locked in your cabana locker during beach time', severity: 'warning' },
        { tip: 'Stay hydrated — drink water regularly during the garden walk and beach time', severity: 'info' }
      ],
      emergencyContacts: {
        police: '122',
        ambulance: '123',
        coastGuard: '16666',
        localHospital: 'Alexandria Medical Center: +20 3 425 9922'
      },
      difficultyLevel: 'easy',
      physicalRequirements: 'Light walking (1–2 km) through the gardens. The rest of the day is fully relaxed.',
      weatherWarnings: [
        'Alexandria has a Mediterranean climate — refreshing sea breeze but strong midday UV. Bring sunscreen.',
        'Sea conditions can change — check with hotel staff before swimming.'
      ]
    });

    await packingGuide.save();
    montazahExp.packingGuide = packingGuide._id;
    await montazahExp.save();
    console.log("Packing Guide linked to Montazah Escape!");

    console.log("\n✅ Alexandria Day Use package seeded successfully!");

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedDayuseAlex();
