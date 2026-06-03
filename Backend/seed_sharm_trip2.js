import mongoose from 'mongoose';
import { devConfig } from './src/config/env/dev.config.js';
import { Destination } from './src/db/models/destination.model.js';
import { Experience } from './src/db/models/experience.model.js';
import { Provider } from './src/db/models/provider.model.js';
import { Activity } from './src/db/models/Activity.model.js';
import { PackingGuide } from './src/db/models/packingguide.model.js';

async function seedSharmTrip2() {
  try {
    await mongoose.connect(devConfig.DB_URL);
    console.log("Connected to MongoDB successfully!");

    let sharmDest = await Destination.findOne({ name: 'Sharm El Sheikh' });
    if (!sharmDest) sharmDest = await Destination.findOne({ name: { $regex: /sharm/i } });
    if (!sharmDest) {
      sharmDest = await Destination.create({
        name: 'Sharm El Sheikh',
        country: 'Egypt',
        city: 'Sharm El Sheikh',
        location: 'South Sinai Governorate, Red Sea',
        image: '/tiran_island_snorkeling.jpeg',
        description: "Egypt's jewel on the Red Sea â€” world-renowned for its coral reefs, vibrant Naama Bay nightlife, Ras Mohamed National Park, and the dramatic Sinai desert landscape."
      });
      console.log("Created Destination: Sharm El Sheikh");
    }

    // â”€â”€â”€ Providers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let rixosProvider = await Provider.findOne({ name: 'Rixos Premium Seagate' });
    if (!rixosProvider) {
      rixosProvider = await Provider.create({
        name: 'Rixos Premium Seagate',
        type: 'TourOperator',
        trustScore: 97
      });
      console.log("Created Provider: Rixos Premium Seagate");
    }

    let clearPathVIPProvider = await Provider.findOne({ name: 'ClearPath VIP Fleet' });
    if (!clearPathVIPProvider) {
      clearPathVIPProvider = await Provider.create({
        name: 'ClearPath VIP Fleet',
        type: 'Transport',
        trustScore: 95
      });
      console.log("Created Provider: ClearPath VIP Fleet");
    }

    let redSeaYachtingProvider = await Provider.findOne({ name: 'Red Sea Yachting Club' });
    if (!redSeaYachtingProvider) {
      redSeaYachtingProvider = await Provider.create({
        name: 'Red Sea Yachting Club',
        type: 'TourOperator',
        trustScore: 93
      });
      console.log("Created Provider: Red Sea Yachting Club");
    }

    let lolivoProvider = await Provider.findOne({ name: "L'Olivo Ristorante" });
    if (!lolivoProvider) {
      lolivoProvider = await Provider.create({
        name: "L'Olivo Ristorante",
        type: 'TourOperator',
        trustScore: 95
      });
      console.log("Created Provider: L'Olivo Ristorante");
    }

    let sinaiDesertProvider = await Provider.findOne({ name: 'Sinai Desert Adventures' });
    if (!sinaiDesertProvider) {
      sinaiDesertProvider = await Provider.create({
        name: 'Sinai Desert Adventures',
        type: 'Guide',
        trustScore: 91
      });
      console.log("Created Provider: Sinai Desert Adventures");
    }

    let anjanaProvider = await Provider.findOne({ name: 'Anjana Luxury Spa' });
    if (!anjanaProvider) {
      anjanaProvider = await Provider.create({
        name: 'Anjana Luxury Spa',
        type: 'TourOperator',
        trustScore: 96
      });
      console.log("Created Provider: Anjana Luxury Spa");
    }

    let farshaProvider = await Provider.findOne({ name: 'Farsha Lounge Handling' });
    if (!farshaProvider) {
      farshaProvider = await Provider.create({
        name: 'Farsha Lounge Handling',
        type: 'TourOperator',
        trustScore: 89
      });
      console.log("Created Provider: Farsha Lounge Handling");
    }

    const upsertActivity = async (data) => {
      let act = await Activity.findOne({ name: data.name });
      if (act) await Activity.deleteOne({ _id: act._id });
      act = await Activity.create({ ...data, destination: sharmDest._id });
      console.log(`Created Activity: ${act.name} (${act.price} EGP)`);
      return act;
    };

    // â”€â”€ DAY 1 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const airportArrivalAct = await upsertActivity({
      name: 'Sharm El Sheikh Airport VIP Arrival Transfer',
      type: 'airport_pickup',
      provider: clearPathVIPProvider._id,
      price: 0,
      description: "Direct pick-up from Sharm El-Sheikh International Airport via a private chauffeured luxury SUV, transferring you smoothly to Rixos Premium Seagate on Nabq Bay.",
      image: '/rixos_seagate_pool_night.png'
    });

    const rasMohamedYachtAct = await upsertActivity({
      name: 'Private Yacht Charter & Ras Mohamed National Park Snorkeling',
      type: 'tour',
      provider: redSeaYachtingProvider._id,
      price: 5500,
      description: "Board a private multi-deck yacht from the resort's marine jetty heading to Ras Mohamed National Park â€” one of the world's top snorkeling and diving destinations. Guided open-water snorkeling over vibrant coral reefs teeming with tropical fish, followed by a gourmet seafood buffet lunch cooked live on board by a private chef.",
      image: '/sharm_ras_mohamed_yacht.png'
    });

    const vipCheckinAct = await upsertActivity({
      name: 'VIP Check-In & Rixos Nabq Bay Infinity Pool',
      type: 'hotel',
      provider: rixosProvider._id,
      price: 0,
      description: "VIP express check-in to your Premium Sea-View Room at Rixos Premium Seagate. Spend the late afternoon unwinding at the resort's private beach-side infinity pool overlooking the crystal waters of Nabq Bay.",
      image: '/rixos_seagate_pool_night.png'
    });

    const fineDiningAct = await upsertActivity({
      name: "Fine Dining at L'Olivo Italian Restaurant & Soho Square Stroll",
      type: 'food',
      provider: lolivoProvider._id,
      price: 2200,
      description: "A premium 4-course Italian dinner reservation at the celebrated L'Olivo restaurant inside Rixos Premium Seagate, followed by a late-night private shuttle to watch the spectacular dancing fountains at Soho Square.",
      image: '/rixos_fine_dining_lounge.png'
    });

    // â”€â”€ DAY 2 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const breakfastAct = await upsertActivity({
      name: 'Rixos Premium International Breakfast Buffet',
      type: 'food',
      provider: rixosProvider._id,
      price: 0,
      description: "Indulge in an expansive open breakfast layout at the Rixos Main Terrace â€” international pastry sections, custom juice bars, and live egg stations with panoramic views directly overlooking Nabq Bay.",
      image: '/rixos_fine_dining_lounge.png'
    });

    const sinaiQuadAct = await upsertActivity({
      name: 'Sinai Desert Quad Biking & Bedouin Eco-Adventure',
      type: 'hiking',
      provider: sinaiDesertProvider._id,
      price: 2800,
      description: "Race through the grand mountain canyons of the Sinai desert on high-end 400cc quad bikes. Stop inside a traditional Bedouin tent hidden between the mountains for authentic herbal tea and locally baked flatbread under the open Sinai sky.",
      image: '/sinai_quad_biking.png'
    });

    const hammamAct = await upsertActivity({
      name: 'Anjana Luxury Spa, Hammam Bath & Hot Stone Therapy',
      type: 'entertainment',
      provider: anjanaProvider._id,
      price: 3200,
      description: "Return to the hotel's premium Anjana Spa for a full 90-minute therapeutic body massage, traditional Turkish Hammam bath ritual, and volcanic hot stone therapy â€” the perfect recovery after the Sinai desert adventure.",
      image: '/anjana_hammam_spa.png'
    });

    const farshaAct = await upsertActivity({
      name: 'Farsha Mountain Lounge Cliffside Sunset Experience',
      type: 'tour',
      provider: farshaProvider._id,
      price: 0,
      description: "Visit the legendary Farsha Mountain Lounge in Hadaba â€” perched on the cliffside with sweeping views over the Gulf. Sit on hand-crafted traditional floor cushions, savour fresh seasonal fruits and herbal tea, and watch the final sunset paint the Red Sea in gold.",
      image: '/farsha_lounge_sunset.png'
    });

    const departureAct = await upsertActivity({
      name: 'Sharm El Sheikh Chauffeured Airport Departure Transfer',
      type: 'transport',
      provider: clearPathVIPProvider._id,
      price: 0,
      description: "Room check-out and boarding your private chauffeured Mercedes fleet for a smooth transfer back to Sharm El-Sheikh International Airport, concluding your zero hidden fees ClearPath experience.",
      image: '/rixos_seagate_pool_night.png'
    });

    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // TRIP â€” Sharm El-Sheikh Luxury Sea & Safari
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    const expName = 'Sharm El-Sheikh Luxury Sea & Safari';
    let sharmExp = await Experience.findOne({ name: expName });
    if (sharmExp) {
      await Experience.deleteOne({ _id: sharmExp._id });
      await PackingGuide.deleteOne({ experience: sharmExp._id });
      console.log("Deleted existing Sharm Luxury Sea & Safari experience.");
    }

    sharmExp = new Experience({
      name: expName,
      type: 'Trip',
      description: "An ultra-premium 2-day Red Sea and Sinai adventure staying at the iconic Rixos Premium Seagate. Snorkel the world-class Ras Mohamed coral reefs from a private yacht, dine at L'Olivo Italian restaurant, race Sinai desert canyons on quad bikes, recover with a Hammam ritual at Anjana Spa, and end with a cliffside sunset at the legendary Farsha Mountain Lounge.",
      duration_days: 2,
      price: 13700,
      capacity: 14,
      destination: sharmDest._id,
      availableDates: [
        { date: new Date('2026-06-27'), availableSeats: 14 },
        { date: new Date('2026-07-11'), availableSeats: 14 },
        { date: new Date('2026-07-25'), availableSeats: 14 },
        { date: new Date('2026-08-08'), availableSeats: 14 }
      ],
      priceBreakdown: [
        { label: 'Private Yacht Charter & Ras Mohamed Snorkeling (incl. seafood buffet lunch on board)', amount: 5500 },
        { label: "Fine Dining at L'Olivo Italian Restaurant & Soho Square Private Shuttle", amount: 2200 },
        { label: 'Sinai Desert Quad Biking & Bedouin Eco-Adventure', amount: 2800 },
        { label: 'Anjana Luxury Spa, Hammam & Hot Stone Therapy (90 min)', amount: 3200 }
      ],
      image: '/rixos_seagate_pool_night.png',
      images: [
        '/rixos_seagate_pool_night.png',
        '/sharm_red_sea_coral_reef.png',
        '/sharm_ras_mohamed_yacht.png',
        '/rixos_fine_dining_lounge.png',
        '/sinai_quad_biking.png',
        '/anjana_hammam_spa.png',
        '/farsha_lounge_sunset.png',
        '/farsha_lounge_night.png'
      ],
      included: [
        '1 night accommodation at Rixos Premium Seagate, Nabq Bay (Ultra-All-Inclusive)',
        'Private VIP fleet transfers: Airport â†” Rixos both ways',
        'Private multi-deck yacht charter to Ras Mohamed National Park',
        'Expert-guided snorkeling over Ras Mohamed coral reefs with all equipment',
        'Gourmet seafood buffet lunch cooked live on board the private yacht',
        "Premium 4-course dinner at L'Olivo Italian Restaurant",
        'Private shuttle to Soho Square dancing fountain show',
        'Premium international breakfast buffet at Rixos Main Terrace',
        'Sinai Desert Quad Biking with Bedouin tent tea & flatbread',
        '90-minute Anjana Spa Hammam, massage & hot stone therapy',
        'Farsha Mountain Lounge cliffside sunset experience with refreshments'
      ],
      excluded: [
        'Flights to/from Sharm El-Sheikh',
        'SCUBA diving certification (guided snorkeling included â€” certified dive upgrade available)',
        'Extra beverages beyond resort all-inclusive allowance',
        'Personal shopping at Soho Square',
        'Tipping for crew, guides, and spa staff',
        'Travel insurance'
      ],
      itinerary: [
        {
          day_number: 1,
          title: 'Arrival, Ras Mohamed Yacht & Fine Dining at L\'Olivo',
          image: '/rixos_seagate_pool_night.png',
          description: "Arrive at Sharm El-Sheikh Airport at 8:30 AM and your private ClearPath luxury SUV transfers you to Rixos Premium Seagate. Board a private multi-deck yacht at 10:30 AM from the resort's marine jetty for a 5-hour guided snorkeling voyage to Ras Mohamed National Park â€” including a live-cooked seafood buffet lunch on board. VIP check-in at 4:30 PM, relax at the Nabq Bay infinity pool, then a premium 4-course dinner at L'Olivo followed by a late-night Soho Square fountain stroll.",
          activities: [
            { activity: airportArrivalAct._id, provider: clearPathVIPProvider._id, price: 0, image: '/rixos_seagate_pool_night.png' },
            { activity: rasMohamedYachtAct._id, provider: redSeaYachtingProvider._id, price: 5500, image: '/sharm_ras_mohamed_yacht.png' },
            { activity: vipCheckinAct._id, provider: rixosProvider._id, price: 0, image: '/rixos_seagate_pool_night.png' },
            { activity: fineDiningAct._id, provider: lolivoProvider._id, price: 2200, image: '/rixos_fine_dining_lounge.png' }
          ]
        },
        {
          day_number: 2,
          title: 'Sinai Desert Safari, Hammam & Farsha Cliffside Sunset',
          image: '/sinai_quad_biking.png',
          description: "Start with an expansive international breakfast at the Rixos Main Terrace overlooking Nabq Bay. At 10:00 AM, race through Sinai mountain canyons on 400cc quad bikes, stopping at a hidden Bedouin tent for herbal tea. Return for a 90-minute recovery session at Anjana Luxury Spa â€” Hammam bath, body massage, and volcanic hot stone therapy. Close the trip at Farsha Mountain Lounge for a cliffside sunset, then your Mercedes fleet whisks you back to the airport.",
          activities: [
            { activity: breakfastAct._id, provider: rixosProvider._id, price: 0, image: '/rixos_fine_dining_lounge.png' },
            { activity: sinaiQuadAct._id, provider: sinaiDesertProvider._id, price: 2800, image: '/sinai_quad_biking.png' },
            { activity: hammamAct._id, provider: anjanaProvider._id, price: 3200, image: '/anjana_hammam_spa.png' },
            { activity: farshaAct._id, provider: farshaProvider._id, price: 0, image: '/farsha_lounge_sunset.png' },
            { activity: departureAct._id, provider: clearPathVIPProvider._id, price: 0, image: '/rixos_seagate_pool_night.png' }
          ]
        }
      ]
    });

    await sharmExp.save();
    console.log("Successfully created: Sharm El-Sheikh Luxury Sea & Safari!");

    const packingGuide = new PackingGuide({
      name: 'Sharm El-Sheikh Luxury Sea & Desert Packing Guide',
      activityType: 'adventure',
      experience: sharmExp._id,
      destination: sharmDest._id,
      essentials: [
        { item: 'Swimwear', icon: 'ðŸ©±', required: true },
        { item: 'Sunscreen SPF 50+ (waterproof)', icon: 'ðŸŒž', required: true },
        { item: 'Sunglasses (UV400)', icon: 'ðŸ•¶ï¸', required: true },
        { item: 'Water bottle (1.5L+)', icon: 'ðŸ’§', required: true },
        { item: 'Towel', icon: 'ðŸ–ï¸', required: true },
        { item: 'Cash (EGP) for tips & extras', icon: 'ðŸ’µ', required: true },
        { item: 'Passport or National ID', icon: 'ðŸªª', required: true },
        { item: 'Anti-seasickness medication (if prone)', icon: 'ðŸ’Š', required: false },
        { item: 'Underwater camera or GoPro', icon: 'ðŸ“¸', required: false }
      ],
      clothing: [
        { item: 'Swimwear (2 sets)', notes: 'Wear one set, pack a spare for the yacht and resort pool' },
        { item: 'Lightweight cover-up or linen shirt', notes: 'Sun protection on the yacht deck' },
        { item: 'Smart casual evening outfit', notes: "Required for L'Olivo fine dining â€” no beachwear allowed" },
        { item: 'Closed-toe shoes or trainers', notes: 'Mandatory for Sinai desert quad biking' },
        { item: 'Sandals or flip-flops', notes: 'For pool, beach, and resort grounds' },
        { item: 'Dust-proof sports sunglasses', notes: 'Desert sand and wind during quad biking â€” wrap-around style preferred' }
      ],
      safetyTips: [
        { tip: 'Quad biking helmet is mandatory â€” never remove it mid-ride regardless of heat', severity: 'danger' },
        { tip: 'Never snorkel alone â€” stay with your buddy and within sight of the safety boat at all times', severity: 'danger' },
        { tip: 'Do NOT touch or stand on coral reefs â€” Ras Mohamed is a protected national park', severity: 'danger' },
        { tip: 'Drink at least 2L of water before the desert quad session â€” Sinai heat causes rapid dehydration', severity: 'warning' },
        { tip: 'Apply waterproof sunscreen every 2 hours on the yacht â€” Red Sea UV intensity is extreme', severity: 'warning' },
        { tip: 'Inform your guide of any pre-existing back injuries before quad biking', severity: 'info' }
      ],
      emergencyContacts: {
        police: '122',
        ambulance: '123',
        coastGuard: '16666',
        localHospital: 'Sharm International Hospital: +20 69 3660893'
      },
      difficultyLevel: 'moderate',
      physicalRequirements: 'Basic swimming ability required for snorkeling. Quad biking is physically active â€” comfortable riding posture needed for 3.5 hours in desert heat. Spa is fully passive with no fitness requirement.',
      weatherWarnings: [
        'Sinai desert temperatures reach 42Â°C in summer â€” the quad session runs in the morning to avoid peak heat.',
        'Red Sea open water conditions can change â€” check sea state the morning of Day 1. High-swell days may delay snorkeling.',
        'Desert wind carries fine sand â€” protect camera lenses, phone screens, and eyes during quad biking.'
      ]
    });

    await packingGuide.save();
    sharmExp.packingGuide = packingGuide._id;
    await sharmExp.save();
    console.log("Packing Guide linked to Sharm Luxury Sea & Safari!");

    console.log("\nâœ… Sharm El-Sheikh Luxury Sea & Safari seeded successfully!");

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedSharmTrip2();

