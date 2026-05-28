import mongoose from 'mongoose';
import { Destination } from './src/db/models/destination.model.js';
import { Experience } from './src/db/models/experience.model.js';

const DB_URL = 'mongodb://127.0.0.1:27017/clearpath';

const destinations = [
  { name: 'Cairo',     location: 'Cairo, Egypt',      description: 'The heart of Egypt – ancient wonders, bustling bazaars, and iconic pyramids.' },
  { name: 'Hurghada',  location: 'Hurghada, Egypt',   description: 'Egypt\'s premier Red Sea resort city – crystal waters, vibrant coral reefs, and luxury resorts.' },
  { name: 'Luxor',     location: 'Luxor, Upper Egypt', description: 'The world\'s greatest open-air museum – Valley of the Kings, Karnak Temple, and more.' },
  { name: 'Dahab',     location: 'Dahab, Sinai',       description: 'Bohemian Red Sea gem – Blue Hole diving, Bedouin culture, and desert adventures.' },
  { name: 'Alexandria',location: 'Alexandria, Egypt',  description: 'Egypt\'s Mediterranean jewel – ancient catacombs, seafood, and Greco-Roman heritage.' },
];

const tripsData = [
  // ── Cairo ──────────────────────────────────────────────────
  {
    name: 'Cairo Pyramids & Sphinx Full-Day Trip',
    type: 'Trip',
    description: 'Explore the last wonder of the ancient world – Giza Pyramids, the Great Sphinx, and a traditional camel ride across the plateau. Your personal Egyptologist guide reveals 4,500 years of history.',
    duration_days: 2,
    base_price: 2200,
    capacity: 15,
    destName: 'Cairo',
    image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=800',
      'https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=800',
      'https://images.unsplash.com/photo-1590500462523-b4438c0a3bf8?q=80&w=800',
    ],
    availableDates: [
      { date: new Date('2026-06-10'), availableSeats: 12 },
      { date: new Date('2026-06-20'), availableSeats: 10 },
    ],
  },
  {
    name: 'Islamic Cairo & Khan El-Khalili Heritage Walk',
    type: 'Trip',
    description: 'Dive into medieval Cairo – Al-Azhar mosque, Saladin Citadel, and the legendary Khan El-Khalili bazaar. Our certified guide uncovers centuries of Islamic architecture and culture.',
    duration_days: 3,
    base_price: 3100,
    capacity: 12,
    destName: 'Cairo',
    image: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?q=80&w=800',
      'https://images.unsplash.com/photo-1590500462523-b4438c0a3bf8?q=80&w=800',
    ],
    availableDates: [
      { date: new Date('2026-06-12'), availableSeats: 8 },
    ],
  },
  {
    name: 'Egyptian Museum & Old Cairo Private Tour',
    type: 'Trip',
    description: 'An exclusive 2-day private tour covering the Egyptian Museum\'s King Tutankhamun treasures, Coptic Cairo churches, and Ben Ezra Synagogue.',
    duration_days: 2,
    base_price: 2800,
    capacity: 6,
    destName: 'Cairo',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800',
      'https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=800',
    ],
    availableDates: [
      { date: new Date('2026-06-15'), availableSeats: 5 },
      { date: new Date('2026-07-01'), availableSeats: 6 },
    ],
  },

  // ── Hurghada ────────────────────────────────────────────────
  {
    name: 'Hurghada Red Sea Snorkeling & Island Cruise',
    type: 'Trip',
    description: 'Board a premium glass-bottom boat to Giftun Island. Snorkel vibrant coral reefs teeming with tropical fish, enjoy a BBQ beach lunch, and take a sunset sail back.',
    duration_days: 2,
    base_price: 1900,
    capacity: 20,
    destName: 'Hurghada',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=800',
      'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=800',
    ],
    availableDates: [
      { date: new Date('2026-06-08'), availableSeats: 18 },
      { date: new Date('2026-06-22'), availableSeats: 20 },
    ],
  },
  {
    name: 'Hurghada Deep Diving PADI Certification Trip',
    type: 'Trip',
    description: 'Get PADI-certified in 3 days at one of the Red Sea\'s most spectacular dive sites. Professional instructors, premium equipment, and daily boat dives included.',
    duration_days: 3,
    base_price: 5500,
    capacity: 8,
    destName: 'Hurghada',
    image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=800',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=800',
    ],
    availableDates: [
      { date: new Date('2026-06-14'), availableSeats: 6 },
    ],
  },
  {
    name: 'Hurghada Desert Safari & Quad Bike Adventure',
    type: 'Trip',
    description: 'Race across the Eastern Desert on quad bikes, ride camels at sunset, dine under the stars in a Bedouin camp, and enjoy traditional entertainment.',
    duration_days: 2,
    base_price: 2400,
    capacity: 16,
    destName: 'Hurghada',
    image: 'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?q=80&w=800',
      'https://images.unsplash.com/photo-1508515053963-70c8b9f2c197?q=80&w=800',
    ],
    availableDates: [
      { date: new Date('2026-06-18'), availableSeats: 14 },
      { date: new Date('2026-07-05'), availableSeats: 16 },
    ],
  },

  // ── Luxor ──────────────────────────────────────────────────
  {
    name: 'Luxor Valley of the Kings & Karnak Temple Tour',
    type: 'Trip',
    description: 'Walk in the footsteps of pharaohs. Visit Tutankhamun\'s tomb in the Valley of the Kings, the awe-inspiring Karnak Temple complex, and Luxor Temple at night.',
    duration_days: 3,
    base_price: 4200,
    capacity: 10,
    destName: 'Luxor',
    image: 'https://images.unsplash.com/photo-1568414618-0db3cf7a4e21?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1568414618-0db3cf7a4e21?q=80&w=800',
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=800',
      'https://images.unsplash.com/photo-1591140206323-a5e4174a19da?q=80&w=800',
    ],
    availableDates: [
      { date: new Date('2026-06-17'), availableSeats: 8 },
      { date: new Date('2026-07-02'), availableSeats: 10 },
    ],
  },
  {
    name: 'Luxor Hot Air Balloon & Nile Felucca Cruise',
    type: 'Trip',
    description: 'Float above ancient Luxor at sunrise in a hot air balloon, then sail the Nile on a traditional felucca to the West Bank temples for an unforgettable 2-day experience.',
    duration_days: 2,
    base_price: 6800,
    capacity: 6,
    destName: 'Luxor',
    image: 'https://images.unsplash.com/photo-1551634979-2b11f8c946fe?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1551634979-2b11f8c946fe?q=80&w=800',
      'https://images.unsplash.com/photo-1568414618-0db3cf7a4e21?q=80&w=800',
    ],
    availableDates: [
      { date: new Date('2026-06-25'), availableSeats: 4 },
    ],
  },
  {
    name: 'Upper Egypt Discovery: Luxor to Aswan Nile Cruise',
    type: 'Trip',
    description: '5-day luxury Nile cruise from Luxor to Aswan. Visit Edfu Temple, Kom Ombo, the High Dam, Philae Island, and Abu Simbel with an expert Egyptologist.',
    duration_days: 5,
    base_price: 12500,
    capacity: 20,
    destName: 'Luxor',
    image: 'https://images.unsplash.com/photo-1591140206323-a5e4174a19da?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1591140206323-a5e4174a19da?q=80&w=800',
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=800',
    ],
    availableDates: [
      { date: new Date('2026-06-19'), availableSeats: 16 },
      { date: new Date('2026-07-10'), availableSeats: 20 },
    ],
  },

  // ── Alexandria ──────────────────────────────────────────────
  {
    name: 'Alexandria Catacombs & Bibliotheca Day Trip',
    type: 'Trip',
    description: 'Explore the Catacombs of Kom el Shoqafa, walk Pompey\'s Pillar, visit the iconic Bibliotheca Alexandrina, and enjoy fresh Mediterranean seafood at Stanley Beach.',
    duration_days: 2,
    base_price: 1800,
    capacity: 14,
    destName: 'Alexandria',
    image: 'https://images.unsplash.com/photo-1543966888-7c1dc482a810?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1543966888-7c1dc482a810?q=80&w=800',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=800',
    ],
    availableDates: [
      { date: new Date('2026-06-11'), availableSeats: 12 },
    ],
  },
];

const dayuseData = [
  // ── Cairo Dayuse ────────────────────────────────────────────
  {
    name: 'Cairo Nile Corniche Luxury Pool Day',
    type: 'Package',
    description: 'Spend the day at a 5-star Nile-view resort. Enjoy the infinity pool, spa facilities, afternoon tea with pyramid view, and a buffet dinner.',
    duration_days: 1,
    base_price: 1500,
    capacity: 30,
    destName: 'Cairo',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800',
    ],
    availableDates: [
      { date: new Date('2026-06-07'), availableSeats: 25 },
      { date: new Date('2026-06-14'), availableSeats: 30 },
    ],
  },
  {
    name: 'Cairo Desert Escape: Spa & Wellness Day',
    type: 'Package',
    description: 'A rejuvenating desert wellness day including a full-body massage, heated outdoor pool, yoga at sunrise overlooking the Giza plateau, and organic lunch.',
    duration_days: 1,
    base_price: 2200,
    capacity: 15,
    destName: 'Cairo',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800',
    ],
    availableDates: [
      { date: new Date('2026-06-09'), availableSeats: 12 },
    ],
  },

  // ── Hurghada Dayuse ─────────────────────────────────────────
  {
    name: 'Hurghada Beach Club: Water Sports & Snorkeling',
    type: 'Package',
    description: 'A full beach day with unlimited snorkeling, jet ski rides, parasailing, a seafood BBQ lunch by the water, and open-bar soft drinks.',
    duration_days: 1,
    base_price: 1200,
    capacity: 40,
    destName: 'Hurghada',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800',
      'https://images.unsplash.com/photo-1508515053963-70c8b9f2c197?q=80&w=800',
    ],
    availableDates: [
      { date: new Date('2026-06-07'), availableSeats: 35 },
      { date: new Date('2026-06-21'), availableSeats: 40 },
    ],
  },
  {
    name: 'Hurghada Luxury Marina Resort Day Pass',
    type: 'Package',
    description: 'Access to a 5-star marina resort: private beach, infinity pool, spa treatments, water sports, and a 3-course Mediterranean lunch.',
    duration_days: 1,
    base_price: 1800,
    capacity: 25,
    destName: 'Hurghada',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800',
      'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=800',
    ],
    availableDates: [
      { date: new Date('2026-06-13'), availableSeats: 20 },
    ],
  },

  // ── Dahab Dayuse (extra) ─────────────────────────────────────
  {
    name: 'Dahab Beach Yoga & Sunset Meditation Day',
    type: 'Package',
    description: 'Start with beachfront yoga at sunrise, snorkel the canyon, enjoy a traditional Bedouin lunch, and finish with a guided sunset meditation with mountain views.',
    duration_days: 1,
    base_price: 850,
    capacity: 12,
    destName: 'Dahab',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800',
    ],
    availableDates: [
      { date: new Date('2026-06-10'), availableSeats: 10 },
      { date: new Date('2026-06-24'), availableSeats: 12 },
    ],
  },

  // ── Luxor Dayuse ─────────────────────────────────────────────
  {
    name: 'Luxor East Bank Pool Day & Felucca Sunset',
    type: 'Package',
    description: 'Relax at a luxury Nile-front hotel pool, enjoy traditional Egyptian mezze lunch, then board a private felucca for a stunning Nile sunset cruise past the West Bank.',
    duration_days: 1,
    base_price: 1100,
    capacity: 18,
    destName: 'Luxor',
    image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=800',
      'https://images.unsplash.com/photo-1568414618-0db3cf7a4e21?q=80&w=800',
    ],
    availableDates: [
      { date: new Date('2026-06-12'), availableSeats: 15 },
    ],
  },
];

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(DB_URL);
  console.log('✅ Connected!\n');

  // Upsert destinations
  console.log('📍 Creating destinations...');
  const destMap = {};
  for (const d of destinations) {
    let dest = await Destination.findOne({ name: { $regex: new RegExp(`^${d.name}$`, 'i') } });
    if (!dest) {
      dest = await Destination.create(d);
      console.log(`   ✅ Created destination: ${d.name}`);
    } else {
      console.log(`   ⏭️  Destination exists: ${d.name}`);
    }
    destMap[d.name] = dest._id;
  }

  // Create trips
  console.log('\n✈️  Creating trips...');
  for (const t of tripsData) {
    const destId = destMap[t.destName];
    const existing = await Experience.findOne({ name: t.name });
    if (existing) { console.log(`   ⏭️  Exists: ${t.name}`); continue; }
    const { destName, ...rest } = t;
    await Experience.create({ ...rest, destination: destId });
    console.log(`   ✅ Created trip: ${t.name}`);
  }

  // Create dayuse
  console.log('\n🏖️  Creating dayuse packages...');
  for (const d of dayuseData) {
    const destId = destMap[d.destName];
    const existing = await Experience.findOne({ name: d.name });
    if (existing) { console.log(`   ⏭️  Exists: ${d.name}`); continue; }
    const { destName, ...rest } = d;
    await Experience.create({ ...rest, destination: destId });
    console.log(`   ✅ Created dayuse: ${d.name}`);
  }

  console.log('\n🎉 Seeding complete!');
  const totalTrips = await Experience.countDocuments({ type: 'Trip' });
  const totalDayuse = await Experience.countDocuments({ type: 'Package' });
  console.log(`📊 Total Trips: ${totalTrips} | Total Dayuse: ${totalDayuse}`);
  await mongoose.disconnect();
}

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
