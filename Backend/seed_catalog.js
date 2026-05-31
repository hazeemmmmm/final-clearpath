import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'src/config/env/dev.env') });

const seedCatalog = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('🚀 Connected to MongoDB successfully.');

    const { Destination } = await import('./src/db/models/destination.model.js');
    const { Provider } = await import('./src/db/models/provider.model.js');
    const { Activity } = await import('./src/db/models/activity.model.js');
    const { Experience } = await import('./src/db/models/experience.model.js');
    const { PackingGuide } = await import('./src/db/models/packingguide.model.js');
    const { User } = await import('./src/db/models/user.model.js');

    // ── 0. CLEAR EXISTING COLLECTIONS ──────────────────────────
    console.log('🧹 Clearing existing catalog collections...');
    await Destination.deleteMany({});
    await Provider.deleteMany({});
    await Activity.deleteMany({});
    await Experience.deleteMany({});
    await PackingGuide.deleteMany({});
    console.log('✅ Collections cleared.');

    // ── 1. CREATE/RESOLVE SUPERVISORS ─────────────────────────
    console.log('👥 Creating supervisors...');
    const supervisorsData = [
      { email: 'ahmed@clearpath.com', firstName: 'Ahmed', lastName: 'Hassan', role: 'supervisor', password: 'Password123' },
      { email: 'mona@clearpath.com', firstName: 'Mona', lastName: 'Ali', role: 'supervisor', password: 'Password123' },
      { email: 'tarek@clearpath.com', firstName: 'Tarek', lastName: 'Mahmoud', role: 'supervisor', password: 'Password123' },
      { email: 'karim@clearpath.com', firstName: 'Karim', lastName: 'Youssef', role: 'supervisor', password: 'Password123' },
      { email: 'sara@clearpath.com', firstName: 'Sara', lastName: 'Hisham', role: 'supervisor', password: 'Password123' }
    ];

    const supervisorMap = {};
    for (const sup of supervisorsData) {
      let user = await User.findOne({ email: sup.email });
      if (!user) {
        user = await User.create(sup);
      } else {
        user.firstName = sup.firstName;
        user.lastName = sup.lastName;
        user.role = 'supervisor';
        await user.save();
      }
      supervisorMap[`${sup.firstName} ${sup.lastName}`] = user._id;
    }
    console.log('✅ Supervisors resolved.');

    // ── 2. CREATE DESTINATIONS ───────────────────────────────
    console.log('📍 Seeding destinations...');
    const destinationsData = [
      { name: 'Fayoum', city: 'Fayoum', country: 'Egypt', description: 'A beautiful oasis with green fields, ancient ruins, waterfalls, and desert lakes.', image: 'https://images.unsplash.com/photo-1623853931671-5582f347395e?auto=format&fit=crop&w=800&q=80' },
      { name: 'Aswan', city: 'Aswan', country: 'Egypt', description: 'Egypt’s sunniest southern city, home to peaceful islands, Nubian heritage, and ancient temples.', image: 'https://images.unsplash.com/photo-1549416878-b9ca95e26903?auto=format&fit=crop&w=800&q=80' },
      { name: 'Cairo', city: 'Cairo', country: 'Egypt', description: 'The grand capital of history, culture, bustling bazaars, Islamic heritage, and ancient pyramids.', image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80' },
      { name: 'Siwa Oasis', city: 'Siwa Oasis', country: 'Egypt', description: 'A dream-like oasis in the deep Western Desert with palm orchards, hot springs, and salt lakes.', image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80' },
      { name: 'Dahab', city: 'Dahab', country: 'Egypt', description: 'A laid-back paradise on the Red Sea coast famous for diving, snorkeling, and Bedouin vibes.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' }
    ];

    const destinationMap = {};
    for (const d of destinationsData) {
      const doc = await Destination.create(d);
      destinationMap[d.name] = doc._id;
    }
    console.log('✅ Destinations created.');

    // ── 3. CREATE PROVIDERS ──────────────────────────────────
    console.log('🤝 Seeding providers...');
    const providersData = [
      { name: 'Fayoum Safari Co.', type: 'TourOperator', contact_email: 'fayoum@safari.com', rating: 4.8 },
      { name: 'Heisa Community', type: 'TourOperator', contact_email: 'heisa@nubia.com', rating: 4.9 },
      { name: 'Heritage Walks Egypt', type: 'Guide', contact_email: 'walks@heritage.com', rating: 4.7 },
      { name: 'Siwa Relax Tours', type: 'TourOperator', contact_email: 'siwa@relax.com', rating: 4.9 },
      { name: 'Dahab Surf Center', type: 'TourOperator', contact_email: 'surf@dahab.com', rating: 4.8 },
      { name: 'EcoEgypt', type: 'Guide', contact_email: 'eco@egypt.com', rating: 4.6 }
    ];

    const providerMap = {};
    for (const p of providersData) {
      const doc = await Provider.create(p);
      providerMap[p.name] = doc._id;
    }
    console.log('✅ Providers created.');

    // ── 4. CREATE ACTIVITIES ─────────────────────────────────
    console.log('🏃 Seeding activities...');
    const activitiesData = [
      { name: 'Sandboarding', type: 'entertainment', destination: destinationMap['Fayoum'], price: 0, provider: providerMap['Fayoum Safari Co.'] },
      { name: 'Nubian Music Session', type: 'entertainment', destination: destinationMap['Aswan'], price: 0, provider: providerMap['Heisa Community'] },
      { name: 'Minaret Climbing & Storytelling', type: 'tour', destination: destinationMap['Cairo'], price: 50, provider: providerMap['Heritage Walks Egypt'] },
      { name: 'Salt Lake Floating', type: 'entertainment', destination: destinationMap['Siwa Oasis'], price: 0, provider: providerMap['Siwa Relax Tours'] },
      { name: 'Boat Transfer & Snorkeling', type: 'tour', destination: destinationMap['Dahab'], price: 0, provider: providerMap['Dahab Surf Center'] },
      { name: 'Guided Eco-Hike', type: 'hiking', destination: destinationMap['Cairo'], price: 0, provider: providerMap['EcoEgypt'] }
    ];

    const activityMap = {};
    for (const act of activitiesData) {
      const doc = await Activity.create(act);
      activityMap[act.name] = doc._id;
    }
    console.log('✅ Activities created.');

    // ── 5. SEED SINGLE-DAY EXPERIENCES ───────────────────────
    console.log('🏝️ Seeding single-day experiences...');
    const dayuseTrips = [
      {
        name: 'Fayoum Magic Lake Day Tour',
        type: 'Trip',
        description: 'A full-day adventure in Wadi El Rayan protectorate, featuring sandboarding, swimming, and an authentic Bedouin lunch by the Magic Lake.',
        duration_days: 1,
        base_price: 600,
        destination: destinationMap['Fayoum'],
        supervisor: supervisorMap['Ahmed Hassan'],
        capacity: 20,
        image: 'https://images.unsplash.com/photo-1623853931671-5582f347395e?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1623853931671-5582f347395e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1547886596-4301beceb430?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1472214222555-d404758b1c42?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80'
        ],
        availableDates: [
          { date: new Date('2026-06-15'), availableSeats: 12 },
          { date: new Date('2026-06-22'), availableSeats: 20 }
        ],
        addons: [{ name: 'Professional Photoshoot', price: 500, description: 'Professional photoshoot during sandboarding and by the waterfalls' }],
        itinerary: [{
          day_number: 1,
          title: 'Wadi El Rayan & Magic Lake',
          image: 'https://images.unsplash.com/photo-1472214222555-d404758b1c42?auto=format&fit=crop&w=800&q=80',
          description: 'Morning visit to the waterfalls, afternoon sandboarding, and sunset watching by the Magic Lake.',
          activities: [{
            activity: activityMap['Sandboarding'],
            provider: providerMap['Fayoum Safari Co.'],
            image: 'https://images.unsplash.com/photo-1547886596-4301beceb430?auto=format&fit=crop&w=800&q=80',
            price: 0
          }]
        }],
        included: ['A/C bus transportation', 'Sandboarding gear', 'Bedouin camp lunch by the lake'],
        excluded: ['Personal beverages', 'Optional photoshoot addon']
      },
      {
        name: 'Authentic Nubian Village Day Tour',
        type: 'Trip',
        description: 'Spend a day living the authentic Nubian life on Heisa Island, learning traditional handicrafts and enjoying Nubian cuisine.',
        duration_days: 1,
        base_price: 800,
        destination: destinationMap['Aswan'],
        supervisor: supervisorMap['Mona Ali'],
        capacity: 15,
        image: 'https://images.unsplash.com/photo-1549416878-b9ca95e26903?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1549416878-b9ca95e26903?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1506450981913-b2bc8b7f7485?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=800&q=80'
        ],
        availableDates: [{ date: new Date('2026-07-01'), availableSeats: 8 }],
        addons: [{ name: 'Nubian Cooking Class', price: 400, description: 'Learn to cook traditional Nubian meals with a local family' }],
        itinerary: [{
          day_number: 1,
          title: 'Heisa Island Cultural Immersion',
          image: 'https://images.unsplash.com/photo-1506450981913-b2bc8b7f7485?auto=format&fit=crop&w=800&q=80',
          description: 'Explore Nubian heritage, traditional boat rides, music sessions, and custom local food.',
          activities: [{
            activity: activityMap['Nubian Music Session'],
            provider: providerMap['Heisa Community'],
            image: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=800&q=80',
            price: 0
          }]
        }],
        included: ['Traditional Nubian lunch', '岛屿 boat transfers', 'Nubian folklore music'],
        excluded: ['Personal purchases', 'Cooking class fee']
      },
      {
        name: 'Secrets of Islamic Cairo Night Walk',
        type: 'Trip',
        description: 'A nighttime walking tour to explore hidden alleys, rooftops of ancient mosques, and stories of the Fatimid and Mamluk eras.',
        duration_days: 1,
        base_price: 350,
        destination: destinationMap['Cairo'],
        supervisor: supervisorMap['Tarek Mahmoud'],
        capacity: 30,
        image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1503177119275-0aa32b31d458?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80'
        ],
        availableDates: [
          { date: new Date('2026-06-10'), availableSeats: 15 },
          { date: new Date('2026-06-17'), availableSeats: 30 }
        ],
        addons: [{ name: 'Traditional Dinner at Zeinab Khatoun', price: 250, description: 'Classic Egyptian dinner inside historic courtyard' }],
        itinerary: [{
          day_number: 1,
          title: 'Al-Muizz Street & Minaret Climb',
          image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80',
          description: 'Hike Al-Muizz Street, climb ancient mosque minarets, and hear stories of historic dynasties.',
          activities: [{
            activity: activityMap['Minaret Climbing & Storytelling'],
            provider: providerMap['Heritage Walks Egypt'],
            image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
            price: 50
          }]
        }],
        included: ['Expert historian guide', 'Mosque entrance fees', 'Arabic hot tea'],
        excluded: ['Courtyard dinner addon', 'Tipping']
      },
      {
        name: 'Siwa Salt Lakes & Sunset Day Tour',
        type: 'Trip',
        description: 'Healing and relaxation in Siwa Oasis with floating in salt lakes and sunset at Fatnas Island.',
        duration_days: 1,
        base_price: 700,
        destination: destinationMap['Siwa Oasis'],
        supervisor: supervisorMap['Karim Youssef'],
        capacity: 12,
        image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
        ],
        availableDates: [{ date: new Date('2026-08-05'), availableSeats: 5 }],
        addons: [{ name: 'Hot Spring Private Access', price: 300, description: 'Private entry to therapeutic Cleopatra hot springs' }],
        itinerary: [{
          day_number: 1,
          title: 'Salt Lake Floating & Sunset',
          image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80',
          description: 'Cleansing floating session in high-saline pools followed by sunset viewing at Fatnas Island.',
          activities: [{
            activity: activityMap['Salt Lake Floating'],
            provider: providerMap['Siwa Relax Tours'],
            image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
            price: 0
          }]
        }],
        included: ['All Siwa local transfers', 'Salt lakes access', 'Fatnas sunset Bedouin tea'],
        excluded: ['Cleopatra private access fee', 'Personal purchases']
      },
      {
        name: 'Dahab Blue Lagoon Day Retreat',
        type: 'Trip',
        description: 'Snorkeling, swimming, and beginner kitesurfing at Blue Lagoon.',
        duration_days: 1,
        base_price: 900,
        destination: destinationMap['Dahab'],
        supervisor: supervisorMap['Sara Hisham'],
        capacity: 10,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=800&q=80'
        ],
        availableDates: [{ date: new Date('2026-07-20'), availableSeats: 4 }],
        addons: [{ name: 'Kitesurfing Trial Lesson', price: 600, description: 'Beginner 1-on-1 kitesurfing dry trial lesson' }],
        itinerary: [{
          day_number: 1,
          title: 'Blue Lagoon Snorkeling & Kitesurfing',
          image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
          description: 'Hike/boat to the magical Blue Lagoon, snorkel crystal waters and watch active surfers.',
          activities: [{
            activity: activityMap['Boat Transfer & Snorkeling'],
            provider: providerMap['Dahab Surf Center'],
            image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
            price: 0
          }]
        }],
        included: ['Round-trip boat/jeep transfers', 'Snorkeling equipment', 'Bedouin lagoon hut seating'],
        excluded: ['Kitesurfing trial addon', 'Tipping']
      },
      {
        name: 'Wadi Degla Cave Hiking',
        type: 'Trip',
        description: 'Explore rock formations, canyons, caves, and fossils inside Wadi Degla protectorate.',
        duration_days: 1,
        base_price: 400,
        destination: destinationMap['Cairo'],
        supervisor: supervisorMap['Ahmed Hassan'],
        capacity: 25,
        image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1503177119275-0aa32b31d458?auto=format&fit=crop&w=800&q=80'
        ],
        availableDates: [{ date: new Date('2026-06-12'), availableSeats: 20 }],
        addons: [{ name: 'BBQ Lunch', price: 200, description: 'Campfire BBQ chicken & kofta lunch inside protectorate' }],
        itinerary: [{
          day_number: 1,
          title: 'Guided Eco-Hike',
          image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
          description: 'Trek inside the protectorate valleys, visit local caves, and check ancient fossil layers.',
          activities: [{
            activity: activityMap['Guided Eco-Hike'],
            provider: providerMap['EcoEgypt'],
            image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
            price: 0
          }]
        }],
        included: ['Protectorate entry fees', 'First-aid licensed guide', 'Mineral water & trail snacks'],
        excluded: ['BBQ lunch addon']
      }
    ];

    const dayuseMap = {};
    for (const exp of dayuseTrips) {
      const doc = await Experience.create(exp);
      dayuseMap[exp.name] = doc;
    }
    console.log('✅ Single-day experiences seeded.');

    // ── 6. SEED MULTI-DAY PACKAGES ───────────────────────────
    console.log('🚢 Seeding multi-day packages...');
    const multiDayPackages = [
      {
        name: 'The 5-Day Cairo & South Cultural Immersion',
        type: 'Package',
        description: 'Explore Fatimid Cairo alleys, visit the majestic Pyramids, board the sleeper train to Nubia, and live Nubian culture on Heisa Island.',
        duration_days: 5,
        base_price: 3200,
        destination: destinationMap['Cairo'],
        supervisor: supervisorMap['Tarek Mahmoud'],
        capacity: 10,
        image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1503177119275-0aa32b31d458?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1549416878-b9ca95e26903?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1506450981913-b2bc8b7f7485?auto=format&fit=crop&w=800&q=80'
        ],
        availableDates: [{ date: new Date('2026-07-05'), availableSeats: 10 }],
        addons: [],
        itinerary: [
          {
            day_number: 1,
            title: 'Day 1 Fatimid Cairo',
            image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80',
            description: 'Night walking tour across historic streets and minaret storytelling.',
            activities: [{
              activity: activityMap['Minaret Climbing & Storytelling'],
              provider: providerMap['Heritage Walks Egypt'],
              image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
              price: 50
            }]
          },
          {
            day_number: 2,
            title: 'Day 2 Ancient Wonders + Sleeper Train',
            image: 'https://images.unsplash.com/photo-1503177119275-0aa32b31d458?auto=format&fit=crop&w=800&q=80',
            description: 'Giza Pyramids tour followed by booking comfortable sleeper train to Aswan.',
            activities: []
          },
          {
            day_number: 3,
            title: 'Day 3 Nubian Heritage',
            image: 'https://images.unsplash.com/photo-1506450981913-b2bc8b7f7485?auto=format&fit=crop&w=800&q=80',
            description: 'Reach Aswan Island, settle in, and explore Nubian local folklore.',
            activities: [{
              activity: activityMap['Nubian Music Session'],
              provider: providerMap['Heisa Community'],
              image: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=800&q=80',
              price: 0
            }]
          },
          {
            day_number: 4,
            title: 'Day 4 Philae + Souq',
            image: 'https://images.unsplash.com/photo-1608976478549-36cc723c6f4b?auto=format&fit=crop&w=800&q=80',
            description: 'Visit Philae Temple and shop at old Aswan Bazaar.',
            activities: []
          },
          {
            day_number: 5,
            title: 'Day 5 Departure',
            image: 'https://images.unsplash.com/photo-1549416878-b9ca95e26903?auto=format&fit=crop&w=800&q=80',
            description: 'Final transfers and flight/train return.',
            activities: []
          }
        ],
        included: ['Sleeper train tickets Cairo-Aswan', 'Aswan Islands private boat transfers', 'Nubian music session', 'Heritage walks tour'],
        excluded: ['Personal purchases', 'Local tipping']
      },
      {
        name: 'The 5-Day Ultimate Desert & Oasis Adventure',
        type: 'Package',
        description: 'Venture into Magic Lake dunes, drive through sand trails to Siwa Oasis, float in healing salt lakes, and camp under Sahara stars.',
        duration_days: 5,
        base_price: 3600,
        destination: destinationMap['Siwa Oasis'],
        supervisor: supervisorMap['Ahmed Hassan'],
        capacity: 8,
        image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1623853931671-5582f347395e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
        ],
        availableDates: [{ date: new Date('2026-08-10'), availableSeats: 8 }],
        addons: [],
        itinerary: [
          {
            day_number: 1,
            title: 'Day 1 Fayoum Safari',
            image: 'https://images.unsplash.com/photo-1623853931671-5582f347395e?auto=format&fit=crop&w=800&q=80',
            description: 'Sandboarding and Bedouin campfire by Magic Lake.',
            activities: [{
              activity: activityMap['Sandboarding'],
              provider: providerMap['Fayoum Safari Co.'],
              image: 'https://images.unsplash.com/photo-1547886596-4301beceb430?auto=format&fit=crop&w=800&q=80',
              price: 0
            }]
          },
          {
            day_number: 2,
            title: 'Day 2 Drive to Siwa',
            image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
            description: 'Scenic desert drive reaching Siwa Oasis.',
            activities: []
          },
          {
            day_number: 3,
            title: 'Day 3 Salt Lakes',
            image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
            description: 'Floating in green-blue salt lakes and watching Fatnas island sunset.',
            activities: [{
              activity: activityMap['Salt Lake Floating'],
              provider: providerMap['Siwa Relax Tours'],
              image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
              price: 0
            }]
          },
          {
            day_number: 4,
            title: 'Day 4 Desert Safari',
            image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80',
            description: 'Deep Great Sand Sea 4x4 safari and hot spring bathing.',
            activities: []
          },
          {
            day_number: 5,
            title: 'Day 5 Cairo Return',
            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
            description: 'Drive back to Cairo and end of services.',
            activities: []
          }
        ],
        included: ['Modern 4x4 vehicles & transfers', 'Siwa salt lake floating fee', 'Fayoum lake camp entry', 'Bedouin dinners'],
        excluded: ['cleopatra hot spring private upgrade', 'Optional tipping']
      },
      {
        name: 'The 4-Day Dahab Coastal Escape',
        type: 'Package',
        description: 'Unplug and relax with crystal water boat transfers, deep coral snorkeling, and kitesurfing vibes at the famous Blue Lagoon.',
        duration_days: 4,
        base_price: 2100,
        destination: destinationMap['Dahab'],
        supervisor: supervisorMap['Sara Hisham'],
        capacity: 12,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=800&q=80'
        ],
        availableDates: [{ date: new Date('2026-07-22'), availableSeats: 12 }],
        addons: [],
        itinerary: [
          {
            day_number: 1,
            title: 'Arrival & Chill',
            image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
            description: 'Check-in at Bedouin coastal camp.',
            activities: []
          },
          {
            day_number: 2,
            title: 'Blue Lagoon Day',
            image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=800&q=80',
            description: 'Boat transfer and snorkeling in lagoon waters.',
            activities: [{
              activity: activityMap['Boat Transfer & Snorkeling'],
              provider: providerMap['Dahab Surf Center'],
              image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
              price: 0
            }]
          },
          {
            day_number: 3,
            title: 'Wadi Qnai & Canyon',
            image: 'https://images.unsplash.com/photo-1538332576187-e241bf636737?auto=format&fit=crop&w=800&q=80',
            description: 'Exploring local mountain canyons.',
            activities: []
          },
          {
            day_number: 4,
            title: 'Departure',
            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
            description: 'Final transfers out of Dahab.',
            activities: []
          }
        ],
        included: ['Lagoon boat fees', 'Snorkeling equipment', 'Bedouin camp lodging'],
        excluded: ['Kitesurfing dry lessons']
      },
      {
        name: 'The 3-Day Cairo Weekend Getaway',
        type: 'Package',
        description: 'Trek inside fossil protectorates at Wadi Degla, explore historical minarets, and live grand Islamic Cairo nighttime walking stories.',
        duration_days: 3,
        base_price: 1100,
        destination: destinationMap['Cairo'],
        supervisor: supervisorMap['Ahmed Hassan'],
        capacity: 15,
        image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1503177119275-0aa32b31d458?auto=format&fit=crop&w=800&q=80'
        ],
        availableDates: [{ date: new Date('2026-06-18'), availableSeats: 15 }],
        addons: [],
        itinerary: [
          {
            day_number: 1,
            title: 'Wadi Degla Cave Hiking',
            image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
            description: 'Guided canyon eco-trek.',
            activities: [{
              activity: activityMap['Guided Eco-Hike'],
              provider: providerMap['EcoEgypt'],
              image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
              price: 0
            }]
          },
          {
            day_number: 2,
            title: 'Islamic Cairo Night Walk',
            image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80',
            description: 'Exploring minarets and ancient fatimid quarters.',
            activities: [{
              activity: activityMap['Minaret Climbing & Storytelling'],
              provider: providerMap['Heritage Walks Egypt'],
              image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
              price: 50
            }]
          },
          {
            day_number: 3,
            title: 'Cairo Museum & Souq',
            image: 'https://images.unsplash.com/photo-1503177119275-0aa32b31d458?auto=format&fit=crop&w=800&q=80',
            description: 'Historic museum stroll and bazaar shopping.',
            activities: []
          }
        ],
        included: ['All Cairo local transits', 'Expert historian guide fee', 'Degla protectorate entrance'],
        excluded: ['Meals and personal purchases']
      },
      {
        name: 'The 3-Day Aswan Heritage Tour',
        type: 'Package',
        description: 'Immerse in peaceful Nile Island vibes, listen to ancient Nubian folklore, and sail on local wooden boats.',
        duration_days: 3,
        base_price: 1800,
        destination: destinationMap['Aswan'],
        supervisor: supervisorMap['Mona Ali'],
        capacity: 12,
        image: 'https://images.unsplash.com/photo-1549416878-b9ca95e26903?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1549416878-b9ca95e26903?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1506450981913-b2bc8b7f7485?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=800&q=80'
        ],
        availableDates: [{ date: new Date('2026-07-02'), availableSeats: 12 }],
        addons: [],
        itinerary: [
          {
            day_number: 1,
            title: 'Arrival & Nubian Settle',
            image: 'https://images.unsplash.com/photo-1506450981913-b2bc8b7f7485?auto=format&fit=crop&w=800&q=80',
            description: 'Traditional welcome drinks on Heisa Island.',
            activities: []
          },
          {
            day_number: 2,
            title: 'Nubian Heritage Immersion',
            image: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=800&q=80',
            description: 'Explore local houses and join active music sessions.',
            activities: [{
              activity: activityMap['Nubian Music Session'],
              provider: providerMap['Heisa Community'],
              image: 'https://images.unsplash.com/photo-1549416878-b9ca95e26903?auto=format&fit=crop&w=800&q=80',
              price: 0
            }]
          },
          {
            day_number: 3,
            title: 'Philae Temple & Return',
            image: 'https://images.unsplash.com/photo-1608976478549-36cc723c6f4b?auto=format&fit=crop&w=800&q=80',
            description: 'Felucca sail to Philae Temple.',
            activities: []
          }
        ],
        included: ['island boat commutes', 'Traditional island dinners', 'Philae entry & Felucca fees'],
        excluded: ['Nubian cooking class addons']
      },
      {
        name: 'The 2-Day Fayoum Safari Weekend',
        type: 'Package',
        description: 'Escape Cairo for a thrilling weekend sandboarding waterfalls, Bedouin camping, and sunset viewing at Magic Lake.',
        duration_days: 2,
        base_price: 950,
        destination: destinationMap['Fayoum'],
        supervisor: supervisorMap['Ahmed Hassan'],
        capacity: 20,
        image: 'https://images.unsplash.com/photo-1623853931671-5582f347395e?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1623853931671-5582f347395e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1547886596-4301beceb430?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1472214222555-d404758b1c42?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80'
        ],
        availableDates: [{ date: new Date('2026-06-25'), availableSeats: 20 }],
        addons: [],
        itinerary: [
          {
            day_number: 1,
            title: 'Fayoum Magic Lake Day Tour',
            image: 'https://images.unsplash.com/photo-1472214222555-d404758b1c42?auto=format&fit=crop&w=800&q=80',
            description: 'Morning waterfalls, sandboarding, Bedouin camp and stars stargazing.',
            activities: [{
              activity: activityMap['Sandboarding'],
              provider: providerMap['Fayoum Safari Co.'],
              image: 'https://images.unsplash.com/photo-1547886596-4301beceb430?auto=format&fit=crop&w=800&q=80',
              price: 0
            }]
          },
          {
            day_number: 2,
            title: 'Karanis Ruins & Return',
            image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
            description: 'Morning historic ruins tour, and lunch by Karoun lake.',
            activities: []
          }
        ],
        included: ['Fayoum campsite entry fees', 'A/C bus transit', 'Bedouin dinners and breakfast'],
        excluded: ['Personal purchases']
      }
    ];

    for (const pkg of multiDayPackages) {
      await Experience.create(pkg);
    }
    console.log('✅ Multi-day packages seeded.');

    // ── 7. SEED PACKING GUIDES FOR DYNAMIC LOOKUP ────────────
    console.log('🎒 Seeding adventure packing guides...');
    const packingGuidesData = [
      {
        name: 'دليل مغامرة وادي الريان والفيوم',
        activityType: 'desert',
        destination: destinationMap['Fayoum'],
        difficultyLevel: 'easy',
        physicalRequirements: 'مجهود بدني خفيف لركوب الرمال والمشي.',
        essentials: [
          { item: 'واقي شمس (Sunblock)', required: true, icon: '☀️' },
          { item: 'نظارة شمسية', required: true, icon: '🕶️' }
        ],
        clothing: [
          { item: 'حذاء رملي مريح', notes: 'يفضل أحذية خفيفة للرمال.' },
          { item: 'ملابس قطنية للنهار', notes: 'تعكس أشعة الشمس.' }
        ],
        safetyTips: [
          { tip: 'اتبع تعليمات قائد الرحلة عند التزلج على الرمال.' }
        ],
        emergencyContacts: { police: '122', ambulance: '123' }
      },
      {
        name: 'Nubian Island Culture Guide',
        activityType: 'cultural',
        destination: destinationMap['Aswan'],
        difficultyLevel: 'easy',
        physicalRequirements: 'General walking in sand fields.',
        essentials: [
          { item: 'Cleansing hand gel', required: false, icon: '🧴' },
          { item: 'Camera', required: true, icon: '📷' }
        ],
        clothing: [
          { item: 'Comfortable light clothes', notes: 'Respectful for village walks.' }
        ],
        safetyTips: [
          { tip: 'Be polite and respect local privacy inside traditional Nubian homes.' }
        ],
        emergencyContacts: { police: '122', ambulance: '123' }
      },
      {
        name: 'Islamic Cairo Walk Guide',
        activityType: 'cultural',
        destination: destinationMap['Cairo'],
        difficultyLevel: 'moderate',
        physicalRequirements: 'Hike up old mosque minarets.',
        essentials: [
          { item: 'Flashlight / Phone light', required: true, icon: '🔦' }
        ],
        clothing: [
          { item: 'Climbing walking shoes', notes: 'Essential for steep old mosque stairs.' }
        ],
        safetyTips: [
          { tip: 'Mind your step while scaling medieval spiral minarets.' }
        ],
        emergencyContacts: { police: '122', ambulance: '123' }
      },
      {
        name: 'Siwa Relax Salt Lakes Guide',
        activityType: 'wellness',
        destination: destinationMap['Siwa Oasis'],
        difficultyLevel: 'easy',
        physicalRequirements: 'Floating in saline warm waters.',
        essentials: [
          { item: 'Cleopatra Cleopatra towels', required: true, icon: '🎒' }
        ],
        clothing: [
          { item: 'Swimwear', notes: 'Highly recommended for direct salt floating.' }
        ],
        safetyTips: [
          { tip: 'Avoid getting salt water in eyes while floating.' }
        ],
        emergencyContacts: { police: '122', ambulance: '123' }
      },
      {
        name: 'Dahab Surf & Lagoon Guide',
        activityType: 'diving',
        destination: destinationMap['Dahab'],
        difficultyLevel: 'moderate',
        physicalRequirements: 'Active swimming and snorkeling.',
        essentials: [
          { item: 'Dry bag for boats', required: true, icon: '🎒' }
        ],
        clothing: [
          { item: 'Water booties / rash guards', notes: 'Protect against corals.' }
        ],
        safetyTips: [
          { tip: 'Do not touch corals or marine life while snorkeling.' }
        ],
        emergencyContacts: { police: '122', ambulance: '123' }
      }
    ];

    for (const guide of packingGuidesData) {
      await PackingGuide.create(guide);
    }
    console.log('✅ Packing guides seeded.');

    // ── 8. LINK THE PACKING GUIDES TO EXPERIENCES ────────────
    console.log('🔗 Resolving dynamic packingGuide links...');
    const experiences = await Experience.find().populate('destination');
    for (const exp of experiences) {
      const destId = exp.destination?._id;
      if (destId) {
        const guide = await PackingGuide.findOne({ destination: destId });
        if (guide) {
          exp.packingGuide = guide._id;
          await exp.save();
        }
      }
    }
    console.log('✅ Experience packingGuides fully linked.');

    console.log('✨ CATALOG DATA REPLACEMENT COMPLETE! PRODUCTION-READY.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedCatalog();
