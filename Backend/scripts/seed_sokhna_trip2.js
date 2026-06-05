import mongoose from 'mongoose';
import { devConfig } from '../src/config/env/dev.config.js';
import { Destination } from '../src/db/models/destination.model.js';
import { Experience } from '../src/db/models/experience.model.js';
import { Provider } from '../src/db/models/provider.model.js';
import { Activity } from '../src/db/models/Activity.model.js';
import { PackingGuide } from '../src/db/models/packingguide.model.js';

async function seedSokhnaTrip2() {
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
        image: '/porto_sokhna_beach.jpeg',
        description: "Egypt's closest Red Sea resort getaway, just 120 km from Cairo. Famous for crystal-clear waters, mountain-backed resorts, and the iconic Galala Cable Car — the ultimate weekend escape."
      });
      console.log("Created Destination: Ain Sokhna");
    }

    // ─── Providers ───────────────────────────────────────────────
    let clearPathLogisticsProvider = await Provider.findOne({ name: 'ClearPath Logistics' });
    if (!clearPathLogisticsProvider) {
      clearPathLogisticsProvider = await Provider.create({ name: 'ClearPath Logistics', type: 'Transport', trustScore: 91 });
      console.log("Created Provider: ClearPath Logistics");
    }

    let movenpickProvider = await Provider.findOne({ name: 'Mövenpick Resort El Sokhna' });
    if (!movenpickProvider) {
      movenpickProvider = await Provider.create({ name: 'Mövenpick Resort El Sokhna', type: 'TourOperator', trustScore: 95 });
      console.log("Created Provider: Mövenpick Resort El Sokhna");
    }

    let golfClubProvider = await Provider.findOne({ name: 'El Sokhna Golf Club Restaurant' });
    if (!golfClubProvider) {
      golfClubProvider = await Provider.create({ name: 'El Sokhna Golf Club Restaurant', type: 'TourOperator', trustScore: 90 });
      console.log("Created Provider: El Sokhna Golf Club Restaurant");
    }

    let watersportsProvider = await Provider.findOne({ name: 'Sokhna Watersports Hub' });
    if (!watersportsProvider) {
      watersportsProvider = await Provider.create({ name: 'Sokhna Watersports Hub', type: 'TourOperator', trustScore: 88 });
      console.log("Created Provider: Sokhna Watersports Hub");
    }

    let portoBoardwalkProvider = await Provider.findOne({ name: 'Porto Boardwalk Entertainment' });
    if (!portoBoardwalkProvider) {
      portoBoardwalkProvider = await Provider.create({ name: 'Porto Boardwalk Entertainment', type: 'TourOperator', trustScore: 87 });
      console.log("Created Provider: Porto Boardwalk Entertainment");
    }

    let padiDiversProvider = await Provider.findOne({ name: 'Red Sea PADI Divers Sokhna' });
    if (!padiDiversProvider) {
      padiDiversProvider = await Provider.create({ name: 'Red Sea PADI Divers Sokhna', type: 'Equipment', trustScore: 94 });
      console.log("Created Provider: Red Sea PADI Divers Sokhna");
    }

    let movenpickSpaProvider = await Provider.findOne({ name: 'The Spa at Mövenpick' });
    if (!movenpickSpaProvider) {
      movenpickSpaProvider = await Provider.create({ name: 'The Spa at Mövenpick', type: 'TourOperator', trustScore: 93 });
      console.log("Created Provider: The Spa at Mövenpick");
    }

    const upsertActivity = async (data) => {
      let act = await Activity.findOne({ name: data.name });
      if (act) await Activity.deleteOne({ _id: act._id });
      act = await Activity.create({ ...data, destination: sokhnaDest._id });
      console.log(`Created Activity: ${act.name} (${act.price} EGP)`);
      return act;
    };

    // ─── Day 1 ────────────────────────────────────────────────────
    const CoasterTransferAct = await upsertActivity({
      name: 'Luxury Mercedes Coaster Group Transfer Cairo to Porto Sokhna',
      type: 'transport',
      provider: clearPathLogisticsProvider._id,
      price: 0,
      description: 'Comfortable, fully air-conditioned group transfer from Cairo to the Porto Sokhna area in a premium Mercedes Coaster, with complimentary bottled water and Wi-Fi for the 90-minute journey.',
      image: '/porto_sokhna_beach.jpeg'
    });

    const ChaletCheckInAct = await upsertActivity({
      name: 'Mövenpick Sokhna Sea-Front Chalet Check-In & Welcome',
      type: 'tour',
      provider: movenpickProvider._id,
      price: 0,
      description: 'Seamless express check-in to your private beachfront chalet with direct sea access at the Mövenpick Resort El Sokhna. Greeted with a traditional Egyptian mint tea ceremony on your private terrace overlooking the Red Sea.',
      image: '/movenpick_sea_view_room.jpeg'
    });

    const GolfDinnerAct = await upsertActivity({
      name: 'Sunset Golf Course Tour via Private Golf Carts & Premium Dinner',
      type: 'food',
      provider: golfClubProvider._id,
      price: 2800,
      description: "Explore the resort's beautifully manicured 18-hole golf course on private golf carts as the golden sunset illuminates the fairways. The evening ends with a lavish international buffet dinner at the Golf Club Restaurant — seafood, grills, and a full dessert station.",
      image: '/sokhna_golf_carts.jpeg'
    });

    // ─── Day 2 ────────────────────────────────────────────────────
    const SpeedboatAct = await upsertActivity({
      name: 'Private Speedboat Hidden Beach Cove Excursion',
      type: 'tour',
      provider: watersportsProvider._id,
      price: 0,
      description: "Skip the crowded hotel beaches and board a private high-speed boat from the resort's marina to a secluded natural sandy cove accessible only by sea. Enjoy 3–4 hours of private swimming, snorkeling, and sunbathing in pristine crystal-clear Red Sea waters.",
      image: '/porto_sokhna_beach.jpeg'
    });

    const BoardwalkCrawlAct = await upsertActivity({
      name: 'Porto Sokhna Marina Boardwalk & Yacht Harbour Café Crawl',
      type: 'tour',
      provider: portoBoardwalkProvider._id,
      price: 1500,
      description: "A guided evening stroll through the vibrant Porto Sokhna Marina — Egypt's premier Red Sea marina lined with luxury yachts, waterfront boutiques, and café terraces. Includes premium dessert and specialty coffee stops at the yacht harbour's finest cafés.",
      image: '/porto_sokhna_marina.jpeg'
    });

    // ─── Day 3 ────────────────────────────────────────────────────
    const ScubaDivingAct = await upsertActivity({
      name: 'Introductory Red Sea Scuba Diving – PADI Supervised Coral Walls',
      type: 'tour',
      provider: padiDiversProvider._id,
      price: 4500,
      description: "Experience the magic of the Red Sea's underwater world with a full introductory scuba diving session under the direct supervision of PADI-certified instructors. Explore the dramatic vertical coral walls off the Sokhna coast — alive with vibrant reef fish, sea fans, and moray eels. No prior experience needed. Includes full equipment, buoyancy jacket, wetsuit, and underwater photography.",
      image: '/sokhna_red_sea_diving.jpeg'
    });

    const SpaAct = await upsertActivity({
      name: 'Premium Spa Package – Full Body Massage, Sauna & Jacuzzi',
      type: 'tour',
      provider: movenpickSpaProvider._id,
      price: 0,
      description: "Unwind in total luxury at The Spa at Mövenpick. The afternoon package includes a 60-minute full body Swedish or deep-tissue massage, followed by unlimited access to the sauna, steam room, and outdoor jacuzzi overlooking the Red Sea.",
      image: '/sokhna_sunset_terrace.jpeg'
    });

    // ─── Day 4 ────────────────────────────────────────────────────
    const FloatingBreakfastAct = await upsertActivity({
      name: 'Mövenpick Beachfront Floating Breakfast in Private Villa Pool',
      type: 'food',
      provider: movenpickProvider._id,
      price: 0,
      description: "The ultimate luxury send-off: a gourmet breakfast served on a floating tray directly inside your private villa's pool, featuring fresh pastries, tropical fruits, smoked salmon, eggs Benedict, and freshly squeezed juices — all while soaking in the morning Red Sea view.",
      image: '/movenpick_sea_view_room.jpeg'
    });

    // ─── Experience ───────────────────────────────────────────────
    const expName = 'Sokhna Marina Premium Yachting & Leisure';
    let sokhnaExp = await Experience.findOne({ name: expName });
    if (sokhnaExp) {
      await Experience.deleteOne({ _id: sokhnaExp._id });
      await PackingGuide.deleteOne({ experience: sokhnaExp._id });
      console.log("Deleted existing Sokhna Marina Yachting experience.");
    }

    sokhnaExp = new Experience({
      name: expName,
      type: 'Trip',
      description: "A 4-day premium coastal escape at the Mövenpick Resort El Sokhna. Arrive and explore the resort's golf course by private cart. Spend Day 2 at a secluded private beach cove by speedboat, then stroll the vibrant Porto Marina at dusk. Day 3 brings an adrenaline-fuelled intro scuba dive on Sokhna's coral walls, followed by a luxurious full spa afternoon. Check out after the most indulgent breakfast of the trip — served floating in your private pool.",
      duration_days: 4,
      price: 14200,
      capacity: 10,
      destination: sokhnaDest._id,
      availableDates: [
        { date: new Date('2026-06-28'), availableSeats: 10 },
        { date: new Date('2026-07-11'), availableSeats: 10 },
        { date: new Date('2026-07-25'), availableSeats: 10 },
        { date: new Date('2026-08-08'), availableSeats: 10 }
      ],
      priceBreakdown: [
        { label: 'Mövenpick Resort El Sokhna – 3 Nights (Beachfront Chalet)', amount: 5400 },
        { label: 'Sunset Golf Course Tour & Premium International Dinner', amount: 2800 },
        { label: 'Porto Sokhna Marina Boardwalk & Café Crawl (Day 2)', amount: 1500 },
        { label: 'Introductory Red Sea Scuba Diving – PADI (incl. equipment)', amount: 4500 }
      ],
      image: '/porto_sokhna_marina.jpeg',
      images: [
        '/porto_sokhna_marina.jpeg',
        '/porto_sokhna_beach.jpeg',
        '/movenpick_sea_view_room.jpeg',
        '/sokhna_golf_carts.jpeg',
        '/sokhna_red_sea_diving.jpeg',
        '/sokhna_sunset_terrace.jpeg'
      ],
      included: [
        '3 nights accommodation at Mövenpick Resort El Sokhna (Private Beachfront Chalet)',
        'Luxury group transfer Cairo ↔ Porto Sokhna (premium Mercedes Coaster)',
        'Private speedboat excursion to secluded beach cove (Day 2)',
        'Porto Sokhna Marina Boardwalk & yacht harbour café crawl with dessert',
        'Sunset golf course tour via private golf carts + premium international dinner',
        'Introductory Red Sea Scuba Diving with PADI instructor (full equipment included)',
        'Full-body massage + sauna, steam room & jacuzzi at The Spa at Mövenpick',
        'Floating breakfast in private villa pool (Day 4)',
        'All resort taxes and service charges'
      ],
      excluded: [
        'Personal beach purchases & water sport upgrades',
        'Extra beverages beyond the package allowance',
        'Advanced scuba certification course (available on request)',
        'Golf playing fees (tour only is included)',
        'Tipping for resort staff, instructors, and drivers'
      ],
      hotel: 'Mövenpick Resort El Sokhna (5-Star, Beachfront & Marina)',
      hotelContact: {
        email: 'resort.sokhna@movenpick.com',
        phone: '+20 62 3390800'
      },
      itinerary: [
        {
          day_number: 1,
          title: 'The Coastal Welcome & Golf Cart Sunset Tour',
          image: '/sokhna_golf_carts.jpeg',
          description: "Depart Cairo at 11:00 AM in the luxury Mercedes Coaster, arriving at the Mövenpick by 1:00 PM for beachfront chalet check-in and a mint tea welcome. As evening approaches, board private golf carts to tour the manicured resort golf course, ending with a premium international dinner.",
          activities: [
            { activity: CoasterTransferAct._id, provider: clearPathLogisticsProvider._id, price: 0, image: '/porto_sokhna_beach.jpeg' },
            { activity: ChaletCheckInAct._id, provider: movenpickProvider._id, price: 0, image: '/movenpick_sea_view_room.jpeg' },
            { activity: GolfDinnerAct._id, provider: golfClubProvider._id, price: 2800, image: '/sokhna_golf_carts.jpeg' }
          ]
        },
        {
          day_number: 2,
          title: 'Private Speedboat Cove & Porto Marina Evening',
          image: '/porto_sokhna_marina.jpeg',
          description: "The morning belongs to the sea — a private speedboat whisks you to a secluded Red Sea cove for swimming and snorkeling away from the crowds. Return to the resort by 2:00 PM. At 4:30 PM, begin an evening guided stroll through the buzzing Porto Sokhna Marina for dessert and coffee by the yachts.",
          activities: [
            { activity: SpeedboatAct._id, provider: watersportsProvider._id, price: 0, image: '/porto_sokhna_beach.jpeg' },
            { activity: BoardwalkCrawlAct._id, provider: portoBoardwalkProvider._id, price: 1500, image: '/porto_sokhna_marina.jpeg' }
          ]
        },
        {
          day_number: 3,
          title: 'Deep Red Sea Diving & Luxury Spa Afternoon',
          image: '/sokhna_red_sea_diving.jpeg',
          description: "The most action-packed day: a morning intro scuba dive under PADI supervision on Sokhna's dramatic underwater coral walls. Return for a buffet lunch, then spend the afternoon in total relaxation at The Spa at Mövenpick — full body massage followed by sauna and jacuzzi.",
          activities: [
            { activity: ScubaDivingAct._id, provider: padiDiversProvider._id, price: 4500, image: '/sokhna_red_sea_diving.jpeg' },
            { activity: SpaAct._id, provider: movenpickSpaProvider._id, price: 0, image: '/sokhna_sunset_terrace.jpeg' }
          ]
        },
        {
          day_number: 4,
          title: 'Floating Breakfast & Farewell Departure',
          image: '/movenpick_sea_view_room.jpeg',
          description: "Wake up slowly — a gourmet floating breakfast is served directly in your private villa pool at 9:00 AM. Savour the final Red Sea views before checking out and boarding the return transfer to Cairo.",
          activities: [
            { activity: FloatingBreakfastAct._id, provider: movenpickProvider._id, price: 0, image: '/movenpick_sea_view_room.jpeg' }
          ]
        }
      ]
    });

    await sokhnaExp.save();
    console.log("Successfully created: Sokhna Marina Premium Yachting & Leisure!");

    const packingGuide = new PackingGuide({
      name: 'Sokhna Marina Premium Yachting & Leisure – Packing & Safety Guide',
      activityType: 'beach',
      experience: sokhnaExp._id,
      destination: sokhnaDest._id,
      essentials: [
        { item: 'Swimwear (2–3 sets)', icon: '🩱', required: true },
        { item: 'Sunscreen SPF 50+ (waterproof)', icon: '🌞', required: true },
        { item: 'Sunglasses & hat', icon: '🕶️', required: true },
        { item: 'Water bottle (2L)', icon: '💧', required: true },
        { item: 'Cash (EGP) for extras & tips', icon: '💵', required: true },
        { item: 'Waterproof phone case / GoPro', icon: '📸', required: false },
        { item: 'Anti-seasickness medication', icon: '💊', required: false }
      ],
      clothing: [
        { item: 'Swimwear & rash guard', notes: 'For the speedboat cove and scuba diving sessions' },
        { item: 'Smart-casual evening wear', notes: 'Required for the Golf Club Restaurant dinner — no sportswear' },
        { item: 'Light sports layer', notes: 'For golf cart tour and marina boardwalk in the evening breeze' },
        { item: 'Sandals and comfortable flat shoes', notes: 'Flat shoes for marina boardwalk and resort grounds' },
        { item: 'Spa robe (provided at spa — bring your own slippers if preferred)', notes: 'The spa provides robes; personal slippers are more comfortable' }
      ],
      safetyTips: [
        { tip: 'Never scuba dive alone and always surface slowly — never hold your breath on ascent', severity: 'danger' },
        { tip: 'Inform the PADI instructor of any respiratory, cardiac, or ear conditions before the dive briefing', severity: 'warning' },
        { tip: 'On the speedboat: wear the provided life jacket at all times while the boat is in motion', severity: 'warning' },
        { tip: 'Apply waterproof sunscreen every 2 hours — Red Sea UV is intense and reflects off the water surface', severity: 'warning' },
        { tip: 'Golf cart tour: follow the resort guide and stay on designated paths — hazards on the course', severity: 'info' },
        { tip: 'Keep valuables in your resort safe — do not bring phones or cameras without waterproofing on the speedboat', severity: 'info' }
      ],
      emergencyContacts: {
        police: '122',
        ambulance: '123',
        coastGuard: '16666',
        localHospital: 'Suez Canal University Hospital: +20 64 330 3360'
      },
      difficultyLevel: 'moderate',
      physicalRequirements: 'Basic swimming ability required for the speedboat cove and scuba diving. The scuba session is introductory — no experience needed, but basic water comfort is essential. Golf cart tour and marina walk are fully accessible. The spa is fully passive.',
      weatherWarnings: [
        'El Sokhna summer temperatures reach 40°C+ — keep all outdoor activities before 11 AM or after 5 PM when possible.',
        'Red Sea open water on the speedboat can get choppy in afternoon winds — take anti-seasickness precautions if sensitive.',
        'Marina evenings have a refreshing sea breeze — bring a light layer for the boardwalk stroll.'
      ]
    });

    await packingGuide.save();
    sokhnaExp.packingGuide = packingGuide._id;
    await sokhnaExp.save();
    console.log("Packing Guide linked to Sokhna Marina Yachting & Leisure!");
    console.log("\n✅ Sokhna Marina Premium Yachting & Leisure seeded successfully!");

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedSokhnaTrip2();
