import mongoose from 'mongoose';
import { devConfig } from './src/config/env/dev.config.js';
import { Destination } from './src/db/models/destination.model.js';
import { Experience } from './src/db/models/experience.model.js';
import { Provider } from './src/db/models/provider.model.js';
import { Activity } from './src/db/models/Activity.model.js';
import { PackingGuide } from './src/db/models/packingguide.model.js';

async function seedSharmTrip1() {
  try {
    await mongoose.connect(devConfig.DB_URL);
    console.log("Connected to MongoDB successfully!");

    // ─── Destination: Sharm El Sheikh ────────────────────────────
    let sharmDest = await Destination.findOne({ name: 'Sharm El Sheikh' });
    if (!sharmDest) {
      sharmDest = await Destination.create({
        name: 'Sharm El Sheikh',
        country: 'Egypt',
        city: 'Sharm El Sheikh',
        location: 'South Sinai, Red Sea Coast',
        image: '/tiran_island_snorkeling.jpeg',
        description: "Egypt's premier Red Sea resort city on the southern tip of the Sinai Peninsula. World-famous for its vibrant coral reefs, crystal-clear diving waters, Ras Mohammed National Park, and thrilling Sinai desert safaris."
      });
      console.log("Created Destination: Sharm El Sheikh");
    } else {
      console.log("Destination already exists: Sharm El Sheikh");
    }

    // ─── Providers ───────────────────────────────────────────────
    let rixosProvider = await Provider.findOne({ name: 'Rixos Premium Seagate' });
    if (!rixosProvider) {
      rixosProvider = await Provider.create({
        name: 'Rixos Premium Seagate',
        type: 'TourOperator',
        trustScore: 96
      });
      console.log("Created Provider: Rixos Premium Seagate");
    }

    let camelDiveProvider = await Provider.findOne({ name: 'Camel Dive Club' });
    if (!camelDiveProvider) {
      camelDiveProvider = await Provider.create({
        name: 'Camel Dive Club',
        type: 'Equipment',
        trustScore: 95
      });
      console.log("Created Provider: Camel Dive Club");
    }

    const upsertActivity = async (data) => {
      let act = await Activity.findOne({ name: data.name });
      if (act) await Activity.deleteOne({ _id: act._id });
      act = await Activity.create({ ...data, destination: sharmDest._id });
      console.log(`Created Activity: ${act.name} (${act.price} EGP)`);
      return act;
    };

    // ─── Day 1 Activities ─────────────────────────────────────────
    const BreakfastDay1Act = await upsertActivity({
      name: 'Rixos Premium Seagate Breakfast Buffet (Red Sea View)',
      type: 'food',
      provider: rixosProvider._id,
      price: 0,
      description: 'Start your first day with a full international breakfast buffet at the Rixos restaurant overlooking the Red Sea and the resort\'s lush gardens.',
      image: '/rixos_breakfast_buffet.jpeg'
    });

    const DiveBriefingAct = await upsertActivity({
      name: 'Hotel Transfer to Marina & Scuba Dive Equipment Briefing',
      type: 'transport',
      provider: camelDiveProvider._id,
      price: 0,
      description: 'Air-conditioned hotel pickup from Rixos to Sharm El Sheikh Marina. Receive full dive equipment, wetsuit fitting, and a comprehensive safety briefing from PADI-certified instructors at Camel Dive Club before heading out to Ras Mohammed.',
      image: '/ras_mohammed_split.jpeg'
    });

    const RasMohammedDivingAct = await upsertActivity({
      name: 'Ras Mohammed National Park – Guided Scuba Diving (2 Dives)',
      type: 'tour',
      provider: camelDiveProvider._id,
      price: 3000,
      description: "Two guided scuba dives inside Egypt's first national marine park — Shark Reef and Yolanda Reef. Dive alongside sea turtles, reef sharks, barracudas, and Napoleon wrasse in the crystal-clear Gulf of Aqaba. Includes all equipment, dive boat, and certified guide. (Total Day 1 charge)",
      image: '/ras_mohammed_dive_boat.jpeg'
    });

    // ─── Day 2 Activities ─────────────────────────────────────────
    const BreakfastDay2Act = await upsertActivity({
      name: 'Rixos Premium Seagate Fuel-Up Breakfast Buffet',
      type: 'food',
      provider: rixosProvider._id,
      price: 0,
      description: 'A hearty full international breakfast buffet at Rixos to fuel up for a full day of snorkeling at sea followed by an evening desert safari.',
      image: '/rixos_breakfast_buffet.jpeg'
    });

    const TiranSnorkelingAct = await upsertActivity({
      name: 'Tiran Island Full-Day Snorkeling Boat Trip – 4 World-Famous Reefs',
      type: 'tour',
      provider: rixosProvider._id,
      price: 1750,
      description: "Full-day boat excursion from Sharm Marina to Tiran Island, stopping at four legendary coral reefs in the Strait of Tiran: Jackson Reef, Thomas Reef, Woodhouse Reef, and Gordon Reef. Vibrant tropical fish, giant corals, and stunning visibility in the Red Sea's clearest waters. Includes snorkeling gear and buffet lunch onboard.",
      image: '/tiran_reef_snorkeling.jpeg'
    });

    const DesertSafariAct = await upsertActivity({
      name: 'Sinai Desert Safari – Quad Bike, Camel Ride & Bedouin Camp Dinner',
      type: 'hiking',
      provider: rixosProvider._id,
      price: 950,
      description: "An unforgettable afternoon and evening in the Sinai desert: ride quad bikes through the dramatic Echo Mountain passes (45–60 min), swap to camels for a sunset ride as the desert turns gold, then settle into an authentic Bedouin camp for mint tea, shisha, henna painting, a traditional grilled dinner, and open-sky stargazing.",
      image: '/sinai_quad_camel_safari.jpeg'
    });

    // ─── Day 3 Activities ─────────────────────────────────────────
    const BreakfastDay3Act = await upsertActivity({
      name: 'Rixos Premium Seagate Farewell Breakfast & Resort Leisure',
      type: 'food',
      provider: rixosProvider._id,
      price: 0,
      description: "Enjoy a leisurely final breakfast at the Rixos restaurant. Spend the morning at leisure — swim in one of 8 resort pools, relax on the private Red Sea beach, or visit the Anjana Spa before hotel checkout.",
      image: '/rixos_seagate_restaurant.jpeg'
    });

    // ─── Experience ───────────────────────────────────────────────
    const expName = 'Sharm El Sheikh Red Sea & Desert Explorer';
    let sharmExp = await Experience.findOne({ name: expName });
    if (sharmExp) {
      await Experience.deleteOne({ _id: sharmExp._id });
      await PackingGuide.deleteOne({ experience: sharmExp._id });
      console.log("Deleted existing Sharm El Sheikh experience.");
    }

    sharmExp = new Experience({
      name: expName,
      type: 'Trip',
      description: "An action-packed 3-day Red Sea adventure based at the luxurious Rixos Premium Seagate Ultra All-Inclusive resort. Dive Ras Mohammed's legendary Shark and Yolanda Reefs on Day 1, snorkel four world-famous coral reefs at Tiran Island and ride quad bikes through the Sinai desert by night on Day 2, then check out refreshed after a final morning at the resort's private Red Sea beach.",
      duration_days: 3,
      price: 10200,
      capacity: 18,
      destination: sharmDest._id,
      availableDates: [
        { date: new Date('2026-06-25'), availableSeats: 18 },
        { date: new Date('2026-07-09'), availableSeats: 18 },
        { date: new Date('2026-07-23'), availableSeats: 18 },
        { date: new Date('2026-08-06'), availableSeats: 18 }
      ],
      priceBreakdown: [
        { label: 'Rixos Premium Seagate – 2 Nights Ultra All-Inclusive', amount: 4500 },
        { label: 'Ras Mohammed National Park – Guided Scuba Diving (2 Dives)', amount: 3000 },
        { label: 'Tiran Island Full-Day Snorkeling Boat Trip (4 Reefs + buffet lunch)', amount: 1750 },
        { label: 'Sinai Desert Safari (Quad Bike + Camel Ride + Bedouin Dinner)', amount: 950 }
      ],
      image: '/rixos_seagate_exterior.jpeg',
      images: [
        '/rixos_seagate_exterior.jpeg',
        '/rixos_seagate_restaurant.jpeg',
        '/ras_mohammed_split.jpeg',
        '/ras_mohammed_dive_boat.jpeg',
        '/tiran_island_snorkeling.jpeg',
        '/tiran_reef_snorkeling.jpeg',
        '/sinai_desert_road.jpeg',
        '/sinai_quad_camel_safari.jpeg',
        '/rixos_breakfast_buffet.jpeg'
      ],
      included: [
        '2 nights accommodation at Rixos Premium Seagate (5-star Ultra All-Inclusive)',
        'All meals, beverages & snacks at the resort (9 à-la-carte restaurants & 11 bars)',
        'Ras Mohammed National Park guided scuba diving — 2 dives at Shark Reef & Yolanda Reef',
        'All dive equipment, wetsuit, dive boat & PADI-certified guide',
        'Tiran Island full-day snorkeling trip at 4 coral reefs (Jackson, Thomas, Woodhouse, Gordon)',
        'Snorkeling gear & buffet lunch onboard for Tiran trip',
        'Sinai Desert Safari: quad bikes, camel ride & authentic Bedouin camp dinner',
        'All hotel-to-marina and resort transfers',
        'Government taxes and service charges'
      ],
      excluded: [
        'Flights to/from Sharm El Sheikh',
        'Travel insurance',
        'Personal purchases & souvenirs',
        'SCUBA certification fees (non-certified divers may substitute with snorkeling)',
        'Tipping for guides, drivers, and resort staff'
      ],
      hotel: 'Rixos Premium Seagate (5-Star Ultra All-Inclusive, Sharks Bay)',
      hotelContact: {
        email: 'reservations.seagate@rixos.com',
        phone: '+20 69 360 1000'
      },
      itinerary: [
        {
          day_number: 1,
          title: 'Ras Mohammed National Park – Diving the Legendary Reefs',
          image: '/ras_mohammed_dive_boat.jpeg',
          description: "Arrive and check in to the Rixos resort. After a Red Sea-view breakfast, transfer to Sharm Marina for your dive briefing at Camel Dive Club. The afternoon brings two guided scuba dives at Ras Mohammed — Shark Reef and Yolanda Reef — in the crystal-clear Gulf of Aqaba alongside sea turtles and reef sharks.",
          activities: [
            { activity: BreakfastDay1Act._id, provider: rixosProvider._id, price: 0, image: '/rixos_breakfast_buffet.jpeg' },
            { activity: DiveBriefingAct._id, provider: camelDiveProvider._id, price: 0, image: '/ras_mohammed_split.jpeg' },
            { activity: RasMohammedDivingAct._id, provider: camelDiveProvider._id, price: 3000, image: '/ras_mohammed_dive_boat.jpeg' }
          ]
        },
        {
          day_number: 2,
          title: 'Tiran Island Snorkeling & Sinai Desert Safari',
          image: '/tiran_island_snorkeling.jpeg',
          description: "A day of two contrasting worlds. Morning: board a boat to Tiran Island for a full day snorkeling four world-famous reefs with buffet lunch onboard. Afternoon/evening: swap the sea for the Sinai desert — quad bikes through Echo Mountain, camel ride at sunset, and an authentic Bedouin camp dinner under a sky full of stars.",
          activities: [
            { activity: BreakfastDay2Act._id, provider: rixosProvider._id, price: 0, image: '/rixos_breakfast_buffet.jpeg' },
            { activity: TiranSnorkelingAct._id, provider: rixosProvider._id, price: 1750, image: '/tiran_reef_snorkeling.jpeg' },
            { activity: DesertSafariAct._id, provider: rixosProvider._id, price: 950, image: '/sinai_quad_camel_safari.jpeg' }
          ]
        },
        {
          day_number: 3,
          title: 'Farewell Morning & Resort Leisure',
          image: '/rixos_seagate_restaurant.jpeg',
          description: "A relaxed final morning — enjoy the farewell breakfast at the Rixos and spend the rest of the morning at leisure: dip in one of the resort's 8 pools, walk the private Red Sea beach, or book a last-minute Anjana Spa treatment before hotel checkout.",
          activities: [
            { activity: BreakfastDay3Act._id, provider: rixosProvider._id, price: 0, image: '/rixos_seagate_restaurant.jpeg' }
          ]
        }
      ]
    });

    await sharmExp.save();
    console.log("Successfully created: Sharm El Sheikh Red Sea & Desert Explorer!");

    // ─── Packing Guide ────────────────────────────────────────────
    const packingGuide = new PackingGuide({
      name: 'Sharm El Sheikh Red Sea & Desert Explorer – Packing & Safety Guide',
      activityType: 'adventure',
      experience: sharmExp._id,
      destination: sharmDest._id,
      essentials: [
        { item: 'Valid ID / Passport', icon: '🪪', required: true },
        { item: 'Swimwear (2+ sets)', icon: '🩱', required: true },
        { item: 'Sunscreen SPF 50+ (waterproof)', icon: '🌞', required: true },
        { item: 'Water bottle (2L)', icon: '💧', required: true },
        { item: 'Cash (EGP) for extras & tips', icon: '💵', required: true },
        { item: 'Dive certification card (if certified)', icon: '🤿', required: false },
        { item: 'Underwater camera / GoPro', icon: '📸', required: false },
        { item: 'Anti-seasickness medication', icon: '💊', required: false },
        { item: 'Headlamp or torch (for Bedouin camp)', icon: '🔦', required: false }
      ],
      clothing: [
        { item: 'Swimwear (2 sets)', notes: 'You will be in the water on Days 1 and 2' },
        { item: 'Rash guard / UV shirt', notes: 'Essential for long snorkeling sessions — prevents sunburn' },
        { item: 'Lightweight long pants & closed shoes', notes: 'Required for quad bike riding — shorts not permitted on quads' },
        { item: 'Light jacket or fleece', notes: 'Sinai desert nights can drop to 18–20°C even in summer' },
        { item: 'Sandals or flip-flops', notes: 'For resort and boat deck' },
        { item: 'Smart-casual outfit', notes: 'For Rixos à-la-carte restaurants in the evening' }
      ],
      safetyTips: [
        { tip: 'Never dive or snorkel alone — stay with your certified guide at all times', severity: 'danger' },
        { tip: 'Do NOT touch, feed, or stand on coral reefs — it causes irreversible damage and is illegal in a national park', severity: 'danger' },
        { tip: 'Inform your dive guide of any medical conditions (asthma, heart issues, ear problems) before the dive briefing', severity: 'warning' },
        { tip: 'Wear a life jacket on the Tiran Island boat if you are not a confident swimmer', severity: 'warning' },
        { tip: 'On quad bikes: always wear the provided helmet and goggles — stay on the designated trail', severity: 'warning' },
        { tip: 'Apply waterproof sunscreen every 2 hours — Red Sea sun is extreme and reflects off the water', severity: 'warning' },
        { tip: 'Stay hydrated throughout the desert safari — bring your water bottle', severity: 'info' },
        { tip: 'Follow dive safety protocols: never hold your breath while ascending, and observe the 3-minute safety stop', severity: 'danger' }
      ],
      emergencyContacts: {
        police: '122',
        ambulance: '123',
        coastGuard: '16666',
        localHospital: 'Sharm El Sheikh International Hospital: +20 69 366 0893'
      },
      difficultyLevel: 'moderate',
      physicalRequirements: 'Basic swimming ability required for snorkeling. Scuba diving requires valid PADI/SSI certification (non-certified guests may substitute with guided snorkeling at Ras Mohammed). Quad biking requires basic motor vehicle coordination. The Bedouin camp involves light walking on sandy terrain.',
      weatherWarnings: [
        'Sharm El Sheikh summer temperatures can exceed 40°C — all sea activities begin early morning to avoid peak heat.',
        'Desert temperatures drop significantly after sunset — bring a light jacket for the evening Bedouin camp.',
        'Occasional desert wind (khamsin) can reduce underwater visibility — your guide will advise if conditions are not ideal for diving.',
        'Red Sea currents at Ras Mohammed can be strong — always follow your dive guide\'s briefing on current direction.'
      ]
    });

    await packingGuide.save();
    sharmExp.packingGuide = packingGuide._id;
    await sharmExp.save();
    console.log("Packing Guide linked to Sharm El Sheikh Trip!");

    console.log("\n✅ Sharm El Sheikh Red Sea & Desert Explorer seeded successfully!");

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedSharmTrip1();
