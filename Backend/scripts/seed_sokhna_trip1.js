import mongoose from 'mongoose';
import { devConfig } from '../src/config/env/dev.config.js';
import { Destination } from '../src/db/models/destination.model.js';
import { Experience } from '../src/db/models/experience.model.js';
import { Provider } from '../src/db/models/provider.model.js';
import { Activity } from '../src/db/models/Activity.model.js';
import { PackingGuide } from '../src/db/models/packingguide.model.js';

async function seedSokhnaTrip1() {
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
    let clearPathVipProvider = await Provider.findOne({ name: 'ClearPath VIP Fleet' });
    if (!clearPathVipProvider) {
      clearPathVipProvider = await Provider.create({ name: 'ClearPath VIP Fleet', type: 'Transport', trustScore: 94 });
      console.log("Created Provider: ClearPath VIP Fleet");
    }

    let ilMonteProvider = await Provider.findOne({ name: 'Il Monte Galala Resort' });
    if (!ilMonteProvider) {
      ilMonteProvider = await Provider.create({ name: 'Il Monte Galala Resort', type: 'TourOperator', trustScore: 96 });
      console.log("Created Provider: Il Monte Galala Resort");
    }

    let galalaRistoranteProvider = await Provider.findOne({ name: 'Galala Heights Ristorante' });
    if (!galalaRistoranteProvider) {
      galalaRistoranteProvider = await Provider.create({ name: 'Galala Heights Ristorante', type: 'TourOperator', trustScore: 92 });
      console.log("Created Provider: Galala Heights Ristorante");
    }

    let ilMonteBeachProvider = await Provider.findOne({ name: 'Il Monte Galala Beach Club' });
    if (!ilMonteBeachProvider) {
      ilMonteBeachProvider = await Provider.create({ name: 'Il Monte Galala Beach Club', type: 'TourOperator', trustScore: 93 });
      console.log("Created Provider: Il Monte Galala Beach Club");
    }

    let cableCarProvider = await Provider.findOne({ name: 'Galala Cable Car Operations' });
    if (!cableCarProvider) {
      cableCarProvider = await Provider.create({ name: 'Galala Cable Car Operations', type: 'TourOperator', trustScore: 90 });
      console.log("Created Provider: Galala Cable Car Operations");
    }

    let wellnessProvider = await Provider.findOne({ name: 'Sokhna Wellness Academy' });
    if (!wellnessProvider) {
      wellnessProvider = await Provider.create({ name: 'Sokhna Wellness Academy', type: 'Guide', trustScore: 88 });
      console.log("Created Provider: Sokhna Wellness Academy");
    }

    let seafoodProvider = await Provider.findOne({ name: 'Sokhna Sea Catch Restaurant' });
    if (!seafoodProvider) {
      seafoodProvider = await Provider.create({ name: 'Sokhna Sea Catch Restaurant', type: 'TourOperator', trustScore: 89 });
      console.log("Created Provider: Sokhna Sea Catch Restaurant");
    }

    const upsertActivity = async (data) => {
      let act = await Activity.findOne({ name: data.name });
      if (act) await Activity.deleteOne({ _id: act._id });
      act = await Activity.create({ ...data, destination: sokhnaDest._id });
      console.log(`Created Activity: ${act.name} (${act.price} EGP)`);
      return act;
    };

    // ─── Day 1 ────────────────────────────────────────────────────
    const LimoTransferAct = await upsertActivity({
      name: 'Premium Limousine Transfer Cairo to El Sokhna',
      type: 'transport',
      provider: clearPathVipProvider._id,
      price: 0,
      description: 'Private chauffeured transfer in a luxury high-end SUV from Cairo directly to Il Monte Galala Resort in El Sokhna, with high-speed Wi-Fi, cold towels, and premium refreshments throughout the 90-minute journey.',
      image: '/sokhna_resort_pool.jpeg'
    });

    const CheckInAct = await upsertActivity({
      name: 'Il Monte Galala VIP Check-In & Deluxe Mountain-View Room',
      type: 'tour',
      provider: ilMonteProvider._id,
      price: 0,
      description: 'Personalized express check-in to your Deluxe Sea & Mountain View room perched on the Galala cliffs, featuring panoramic Red Sea vistas, a custom welcome fruit basket, and fresh pressed juices served on your private terrace.',
      image: '/ilmonte_galala_pool_mountain.jpeg'
    });

    const SunsetDinnerAct = await upsertActivity({
      name: 'Galala Heights Cliff-Side Sunset Dinner',
      type: 'food',
      provider: galalaRistoranteProvider._id,
      price: 3400,
      description: "A fine dining experience at the resort's signature cliff-top Galala Heights Ristorante, perched directly above the Sokhna coastline. A multi-course Italian-inspired menu served as the sun descends into the Red Sea, creating a breathtaking panoramic backdrop. Includes welcome aperitif.",
      image: '/galala_beach_restaurant.jpeg'
    });

    // ─── Day 2 ────────────────────────────────────────────────────
    const LagoonKayakingAct = await upsertActivity({
      name: 'Il Monte Galala Private Crystal Lagoon Kayaking & Cabana',
      type: 'tour',
      provider: ilMonteBeachProvider._id,
      price: 0,
      description: "Spend the morning at the resort's massive mountain-top saltwater crystal lagoon. Access a private beach cabana, swim in the turquoise salt water, and explore the lagoon by kayak with equipment provided by the Beach Club.",
      image: '/ilmonte_galala_beach.jpeg'
    });

    const CableCarAct = await upsertActivity({
      name: 'Galala Teleferik Cable Car Ride & Mountain Plateau Walk',
      type: 'tour',
      provider: cableCarProvider._id,
      price: 2200,
      description: "Ride the famous Galala Cable Car (Teleferik) — one of Egypt's most iconic mountain experiences — from the base up to the Galala plateau at 1,000 metres. At the top: panoramic 360° views of the Red Sea, the Suez Canal, and the Sinai Peninsula, a history-of-the-area guided walk, and unlimited photography time.",
      image: '/galala_cable_car.jpeg'
    });

    // ─── Day 3 ────────────────────────────────────────────────────
    const SunriseYogaAct = await upsertActivity({
      name: 'Guided Sunrise Beach Yoga & Meditation Session',
      type: 'tour',
      provider: wellnessProvider._id,
      price: 0,
      description: "A tranquil early morning yoga and guided meditation session on the soft sandy private beach. Led by a certified instructor, the 2-hour session combines breathwork, sun salutations, and mindfulness as the Red Sea sunrise unfolds before you.",
      image: '/sokhna_sunrise_yoga.jpeg'
    });

    const SeafoodFeastAct = await upsertActivity({
      name: 'Red Sea Farewell Seafood Feast on the Beach',
      type: 'food',
      provider: seafoodProvider._id,
      price: 3100,
      description: "A grand farewell seafood banquet served directly on the private beach at the water's edge. Features a lavish spread of fresh Red Sea catch: grilled whole fish, spiced shrimp, lobster, calamari rings, and traditional mezze, all accompanied by freshly baked bread and beverages.",
      image: '/galala_beach_restaurant.jpeg'
    });

    // ─── Experience ───────────────────────────────────────────────
    const expName = 'Sokhna Luxury Mountain & Sea Escape';
    let sokhnaExp = await Experience.findOne({ name: expName });
    if (sokhnaExp) {
      await Experience.deleteOne({ _id: sokhnaExp._id });
      await PackingGuide.deleteOne({ experience: sokhnaExp._id });
      console.log("Deleted existing Sokhna Mountain & Sea experience.");
    }

    sokhnaExp = new Experience({
      name: expName,
      type: 'Trip',
      description: "A 3-day luxury retreat at the breathtaking Il Monte Galala Resort, perched on the cliffs of Galala Mountain overlooking the Red Sea. Arrive in a private limousine and dine cliff-side at sunset. Wake to a crystal mountain lagoon and ride Egypt's iconic Galala Cable Car to panoramic heights. End your final morning with sunrise beach yoga before a grand farewell seafood feast on the water's edge.",
      duration_days: 3,
      price: 13200,
      capacity: 12,
      destination: sokhnaDest._id,
      availableDates: [
        { date: new Date('2026-06-28'), availableSeats: 12 },
        { date: new Date('2026-07-10'), availableSeats: 12 },
        { date: new Date('2026-07-24'), availableSeats: 12 },
        { date: new Date('2026-08-07'), availableSeats: 12 }
      ],
      priceBreakdown: [
        { label: 'Il Monte Galala Resort – 2 Nights (Deluxe Sea & Mountain View)', amount: 4500 },
        { label: 'Cliff-Side Sunset Dinner at Galala Heights Ristorante', amount: 3400 },
        { label: 'Galala Teleferik Cable Car Ride & Mountain Plateau Walk', amount: 2200 },
        { label: 'Red Sea Farewell Seafood Feast on the Beach', amount: 3100 }
      ],
      image: '/ilmonte_galala_pool_mountain.jpeg',
      images: [
        '/ilmonte_galala_pool_mountain.jpeg',
        '/ilmonte_galala_beach.jpeg',
        '/sokhna_resort_pool.jpeg',
        '/galala_beach_restaurant.jpeg',
        '/galala_cable_car.jpeg',
        '/sokhna_sunrise_yoga.jpeg'
      ],
      included: [
        '2 nights accommodation at Il Monte Galala Resort (Deluxe Sea & Mountain View room)',
        'Private luxury SUV limousine transfer Cairo ↔ El Sokhna',
        'Welcome fruit basket and fresh juices on arrival',
        'Crystal lagoon private cabana access & kayaking (Day 2 morning)',
        'Galala Teleferik Cable Car round-trip ticket & guided mountain plateau walk',
        'Guided sunrise beach yoga & meditation session',
        'Cliff-side sunset dinner at Galala Heights Ristorante (Day 1)',
        'Grand farewell Red Sea seafood feast on the beach (Day 3)',
        'All resort taxes and service charges'
      ],
      excluded: [
        'Personal purchases & souvenirs',
        'Extra beverages and room service beyond package allowance',
        'Spa treatments (available at extra cost)',
        'Water sports beyond the included kayaking (jet ski, parasailing, etc.)',
        'Tipping for resort staff and transfer drivers'
      ],
      hotel: 'Il Monte Galala Resort & Hotel (5-Star, Galala Mountain Cliffside)',
      hotelContact: {
        email: 'reservations@ilmontegalala.com',
        phone: '+20 2 24111000'
      },
      itinerary: [
        {
          day_number: 1,
          title: 'Mountain Luxury Arrival & Cliff-Side Sunset Dinner',
          image: '/ilmonte_galala_pool_mountain.jpeg',
          description: "Depart Cairo at 1:00 PM in your private luxury SUV. Arrive at Il Monte Galala by 3:00 PM for VIP check-in to your Deluxe Sea & Mountain View room. Freshen up and settle in before the evening's highlight: a multi-course cliff-top dinner at Galala Heights Ristorante as the sun melts into the Red Sea.",
          activities: [
            { activity: LimoTransferAct._id, provider: clearPathVipProvider._id, price: 0, image: '/sokhna_resort_pool.jpeg' },
            { activity: CheckInAct._id, provider: ilMonteProvider._id, price: 0, image: '/ilmonte_galala_pool_mountain.jpeg' },
            { activity: SunsetDinnerAct._id, provider: galalaRistoranteProvider._id, price: 3400, image: '/galala_beach_restaurant.jpeg' }
          ]
        },
        {
          day_number: 2,
          title: 'Crystal Lagoon & Galala Cable Car Adventure',
          image: '/galala_cable_car.jpeg',
          description: "A morning of total relaxation at the resort's crystal saltwater lagoon — swim, kayak, and unwind in your private cabana. In the afternoon, ride the Galala Teleferik Cable Car up to 1,000 metres for a guided mountain plateau walk with sweeping 360° views of the Red Sea and Sinai.",
          activities: [
            { activity: LagoonKayakingAct._id, provider: ilMonteBeachProvider._id, price: 0, image: '/ilmonte_galala_beach.jpeg' },
            { activity: CableCarAct._id, provider: cableCarProvider._id, price: 2200, image: '/galala_cable_car.jpeg' }
          ]
        },
        {
          day_number: 3,
          title: 'Sunrise Yoga & Farewell Red Sea Seafood Feast',
          image: '/sokhna_sunrise_yoga.jpeg',
          description: "Rise at 7:00 AM for a guided sunrise yoga and meditation session on the private beach as the Red Sea glows with morning light. After a leisure morning, the trip closes with a grand farewell seafood banquet on the sand — a fitting farewell to Galala.",
          activities: [
            { activity: SunriseYogaAct._id, provider: wellnessProvider._id, price: 0, image: '/sokhna_sunrise_yoga.jpeg' },
            { activity: SeafoodFeastAct._id, provider: seafoodProvider._id, price: 3100, image: '/galala_beach_restaurant.jpeg' }
          ]
        }
      ]
    });

    await sokhnaExp.save();
    console.log("Successfully created: Sokhna Luxury Mountain & Sea Escape!");

    const packingGuide = new PackingGuide({
      name: 'Sokhna Mountain & Sea Escape – Packing & Wellness Guide',
      activityType: 'wellness',
      experience: sokhnaExp._id,
      destination: sokhnaDest._id,
      essentials: [
        { item: 'Swimwear (2 sets)', icon: '🩱', required: true },
        { item: 'Sunscreen SPF 50+ (waterproof)', icon: '🌞', required: true },
        { item: 'Sunglasses & wide-brim hat', icon: '🕶️', required: true },
        { item: 'Water bottle (1.5L)', icon: '💧', required: true },
        { item: 'Cash (EGP) for extras & tips', icon: '💵', required: true },
        { item: 'Yoga mat (optional — provided at session)', icon: '🧘', required: false },
        { item: 'Light jacket or cardigan', icon: '🧥', required: false }
      ],
      clothing: [
        { item: 'Swimwear & beach cover-up', notes: 'For the crystal lagoon and beach days' },
        { item: 'Smart-casual evening wear', notes: 'Galala Heights Ristorante enforces a smart-casual dress code at dinner' },
        { item: 'Comfortable closed-toe shoes', notes: 'Required for the mountain plateau walk at the top of the cable car' },
        { item: 'Light sportswear / yoga pants', notes: 'For the sunrise yoga session on the beach' },
        { item: 'Light layer for the evening', notes: "Galala Mountain is noticeably cooler than the beach in the evening" }
      ],
      safetyTips: [
        { tip: 'Apply sunscreen before and during lagoon time — the mountain altitude intensifies UV radiation', severity: 'warning' },
        { tip: 'The cable car reaches 1,000 metres — guests with acute fear of heights or vertigo should consider skipping this activity', severity: 'info' },
        { tip: 'Stay on designated mountain walking paths — the Galala plateau edges are steep cliff drops', severity: 'danger' },
        { tip: 'Drink water consistently — the dry mountain air at Galala accelerates dehydration', severity: 'warning' },
        { tip: 'Yoga on the beach: warm up gently — morning beach sand can be uneven', severity: 'info' }
      ],
      emergencyContacts: {
        police: '122',
        ambulance: '123',
        coastGuard: '16666',
        localHospital: 'Suez Canal University Hospital: +20 64 330 3360'
      },
      difficultyLevel: 'easy',
      physicalRequirements: 'Gentle — all activities are low-intensity. The cable car and mountain plateau walk involve light walking on a paved path. Yoga session is beginner-friendly. No swimming ability required for the lagoon beyond basic comfort.',
      weatherWarnings: [
        'El Sokhna summer heat can exceed 38°C on the beach — schedule beach activities early morning or late afternoon.',
        'The Galala Mountain plateau at 1,000 metres is significantly cooler than the beach, especially after sunset — bring a light jacket.',
        'Wind at the cable car top station can be strong — secure loose items before stepping onto the viewing platform.'
      ]
    });

    await packingGuide.save();
    sokhnaExp.packingGuide = packingGuide._id;
    await sokhnaExp.save();
    console.log("Packing Guide linked to Sokhna Mountain & Sea Escape!");
    console.log("\n✅ Sokhna Luxury Mountain & Sea Escape seeded successfully!");

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedSokhnaTrip1();
