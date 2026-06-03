import mongoose from 'mongoose';
import { devConfig } from './src/config/env/dev.config.js';
import { Destination } from './src/db/models/destination.model.js';
import { Provider } from './src/db/models/provider.model.js';
import { Activity } from './src/db/models/activity.model.js';
import { Experience } from './src/db/models/experience.model.js';
import { User } from './src/db/models/user.model.js';

async function run() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(devConfig.DB_URL);
  console.log('✅ Connected!');

  // 1. Find or create Alexandria destination
  let alexDest = await Destination.findOne({ name: 'Alexandria' });
  if (!alexDest) {
    alexDest = await Destination.create({
      name: 'Alexandria',
      city: 'Alexandria',
      country: 'Egypt',
      description: 'Egypt\'s Mediterranean jewel – ancient catacombs, historic citadels, and beautiful seaside walkways.',
      image: 'https://images.unsplash.com/photo-1543966888-7c1dc482a810?auto=format&fit=crop&w=800&q=80'
    });
    console.log(`📍 Created destination: Alexandria (${alexDest._id})`);
  } else {
    console.log(`⏭️ Alexandria destination already exists (${alexDest._id})`);
  }

  // 2. Resolve Cairo and Sokhna destinations
  const cairoDest = await Destination.findOne({ name: 'Cairo' });
  const sokhnaDest = await Destination.findOne({ name: 'Ain Sokhna' });
  if (!cairoDest || !sokhnaDest) {
    throw new Error('Required Cairo or Ain Sokhna destinations are missing from DB!');
  }

  // 3. Find or create Providers
  let alexProvider = await Provider.findOne({ name: 'Alexandria Tours & Sailing' });
  if (!alexProvider) {
    alexProvider = await Provider.create({
      name: 'Alexandria Tours & Sailing',
      type: 'TourOperator',
      contact_email: 'alex@sailing.com',
      rating: 4.8
    });
    console.log(`🤝 Created Provider: ${alexProvider.name}`);
  }

  let sokhnaProvider = await Provider.findOne({ name: 'Sokhna Watersports & Yachting' });
  let cairoProvider = await Provider.findOne({ name: 'Heritage Walks Egypt' });
  let ecoProvider = await Provider.findOne({ name: 'EcoEgypt' });

  // Fallbacks if not found
  if (!sokhnaProvider) {
    sokhnaProvider = await Provider.create({ name: 'Sokhna Watersports & Yachting', type: 'TourOperator', contact_email: 'sokhna@yacht.com', rating: 4.9 });
  }
  if (!cairoProvider) {
    cairoProvider = await Provider.create({ name: 'Heritage Walks Egypt', type: 'Guide', contact_email: 'walks@heritage.com', rating: 4.7 });
  }
  if (!ecoProvider) {
    ecoProvider = await Provider.create({ name: 'EcoEgypt', type: 'Guide', contact_email: 'eco@egypt.com', rating: 4.6 });
  }

  // 4. Find or create Activities
  const makeActivity = async (name, type, destinationId, price, providerId) => {
    let act = await Activity.findOne({ name, destination: destinationId });
    if (!act) {
      act = await Activity.create({ name, type, destination: destinationId, price, provider: providerId });
      console.log(`🏃 Created Activity: ${name}`);
    }
    return act;
  };

  // Sokhna Activities
  const jetSkiAct = await makeActivity('Jet Skiing & Banana Boat Ride', 'entertainment', sokhnaDest._id, 300, sokhnaProvider._id);
  const quadAct = await makeActivity('Mount Galala Quad Biking Safari', 'entertainment', sokhnaDest._id, 400, sokhnaProvider._id);
  const dinnerAct = await makeActivity('Seafood Fine Dining & Boardwalk', 'entertainment', sokhnaDest._id, 450, sokhnaProvider._id);
  const snorkelAct = await makeActivity('Coral Reef Snorkeling & Paddleboarding', 'entertainment', sokhnaDest._id, 200, sokhnaProvider._id);

  // Cairo Activities
  const minaretAct = await makeActivity('Minaret Climbing & Storytelling', 'tour', cairoDest._id, 150, cairoProvider._id);
  const pyramidsAct = await makeActivity('Pyramids Guided Tour', 'tour', cairoDest._id, 300, ecoProvider._id);
  const nmecAct = await makeActivity('National Museum of Egyptian Civilization', 'tour', cairoDest._id, 250, cairoProvider._id);
  const kayakAct = await makeActivity('Nile Kayaking Experience', 'entertainment', cairoDest._id, 200, ecoProvider._id);

  // Alex Activities
  const citadelAct = await makeActivity('Qaitbay Citadel Guided Tour', 'tour', alexDest._id, 150, alexProvider._id);
  const RomanAct = await makeActivity('Roman Amphitheatre & Catacombs Tour', 'tour', alexDest._id, 200, alexProvider._id);
  const sailingAct = await makeActivity('Mediterranean Sailing & Sunset Cruise', 'tour', alexDest._id, 400, alexProvider._id);
  const alexKayakAct = await makeActivity('Seaside Kayaking & Paddleboarding', 'entertainment', alexDest._id, 200, alexProvider._id);

  // 5. Get a Supervisor User to link
  const supervisor = await User.findOne({ role: 'supervisor' });
  const supervisorId = supervisor ? supervisor._id : null;

  // Helper to create experience
  const makeExperience = async (data) => {
    let exp = await Experience.findOne({ name: data.name });
    if (exp) {
      await Experience.deleteOne({ _id: exp._id });
      console.log(`🧹 Replaced existing experience: ${data.name}`);
    }
    exp = await Experience.create({ ...data, supervisor: supervisorId });
    console.log(`✅ Created Experience: ${data.name} (${exp._id})`);
    return exp;
  };

  // --- EXPERIENCE 1: Sokhna Trip 2 ---
  await makeExperience({
    name: 'Ain Sokhna Luxury Yacht & Galala Heights Trip',
    type: 'Trip',
    description: 'An ultimate 3-day Sokhna experience! Cruise the Red Sea on a luxury private yacht, ride the Galala cable cars, and enjoy premium seafood dinner overlooking the boardwalk.',
    duration_days: 3,
    price: 2300, // Sum of activities (300+400+450=1150) + breakdown components (800+350=1150) = 2300
    destination: sokhnaDest._id,
    capacity: 15,
    isFeatured: true,
    availableDates: [
      { date: new Date('2026-06-12'), availableSeats: 15 },
      { date: new Date('2026-06-22'), availableSeats: 15 },
      { date: new Date('2026-07-03'), availableSeats: 15 }
    ],
    priceBreakdown: [
      { label: 'Private Yacht Cruise Access', amount: 800 },
      { label: 'Galala Cable Car & Entry', amount: 350 }
    ],
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ],
    included: [
      '3-Day private yacht access pass',
      'Cable car round-trip tickets',
      'Professional marine and mountain safety guides',
      'Mineral water & fresh juices'
    ],
    excluded: [
      'Personal purchases & souvenirs',
      'Hotel upgrade fees'
    ],
    addons: [
      { name: 'VIP Yacht Lounge Access', price: 500, description: 'Exclusive entry to the air-conditioned indoor yacht salon with snacks.' }
    ],
    itinerary: [
      {
        day_number: 1,
        title: 'Red Sea Marine Yacht Starlight',
        image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=800&q=80',
        description: 'Board the luxury cruise ship for a sunset marine sail, and experience jet skiing.',
        activities: [
          { activity: jetSkiAct._id, provider: sokhnaProvider._id, price: 300 }
        ]
      },
      {
        day_number: 2,
        title: 'Galala Heights Mountain Safari',
        image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
        description: 'Trek up Galala mountain trail via cable car and embark on a quad biking adventure.',
        activities: [
          { activity: quadAct._id, provider: sokhnaProvider._id, price: 400 }
        ]
      },
      {
        day_number: 3,
        title: 'Boardwalk Dinner & Hidden Viewpoint',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        description: 'Check out the Galala Observatory Viewpoint (Hidden Gem!) for sunset photos, followed by a premium seafood dinner.',
        activities: [
          { activity: dinnerAct._id, provider: sokhnaProvider._id, price: 450 }
        ]
      }
    ]
  });

  // --- EXPERIENCE 2: Sokhna Dayuse ---
  await makeExperience({
    name: 'Ain Sokhna Elite Beach & Spa Dayuse',
    type: 'Package',
    description: 'Escape for a refreshing single day in Ain Sokhna! Includes five-star private resort beach club access, pool facilities, buffet lunch, and paddleboarding.',
    duration_days: 1,
    price: 1200, // Activity (200) + breakdown (600+400) = 1200
    destination: sokhnaDest._id,
    capacity: 30,
    availableDates: [
      { date: new Date('2026-06-11'), availableSeats: 30 },
      { date: new Date('2026-06-18'), availableSeats: 30 },
      { date: new Date('2026-06-25'), availableSeats: 30 }
    ],
    priceBreakdown: [
      { label: '5-Star Beach & Pool Pass', amount: 600 },
      { label: 'Buffet Lunch at El-Mora', amount: 400 }
    ],
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
    ],
    included: [
      '5-Star beach resort pool & beach pass',
      'Premium open-buffet lunch at El-Mora',
      'Use of resort changing cabins & showers'
    ],
    excluded: [
      'Spa massage & treatments',
      'Private beach canopy upgrade'
    ],
    addons: [
      { name: 'Cleopatra Spa Session', price: 600, description: '1-Hour full body therapeutic massage at the resort spa.' }
    ],
    itinerary: [
      {
        day_number: 1,
        title: 'Seaside Relaxation & Hidden Cove Swim',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        description: 'Explore the El-Mora Private Cove (Hidden Gem!) for peaceful shallow water snorkeling and relaxation.',
        activities: [
          { activity: snorkelAct._id, provider: sokhnaProvider._id, price: 200 }
        ]
      }
    ]
  });

  // --- EXPERIENCE 3: Cairo Trip ---
  await makeExperience({
    name: 'Cairo 3-Day Pharaohs & Islamic Heritage Trip',
    type: 'Trip',
    description: 'A 3-day deep cultural dive into historic Cairo. Climb medieval minarets, take a guided tour of the Great Pyramids, and visit the royal mummies at NMEC.',
    duration_days: 3,
    price: 2800, // Activities (150+300+250=700) + breakdown (1500+600=2100) = 2800
    destination: cairoDest._id,
    capacity: 10,
    availableDates: [
      { date: new Date('2026-06-12'), availableSeats: 10 },
      { date: new Date('2026-06-19'), availableSeats: 10 },
      { date: new Date('2026-06-26'), availableSeats: 10 }
    ],
    priceBreakdown: [
      { label: 'Boutique Hotel in Zamalek (2 Nights)', amount: 1500 },
      { label: 'Private AC Transport', amount: 600 }
    ],
    image: 'https://images.unsplash.com/photo-1503177119275-0aa32b31d458?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1503177119275-0aa32b31d458?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=800&q=80'
    ],
    included: [
      '2 Nights stay in Zamalek Boutique Hotel',
      'Entry tickets to Giza Pyramids and NMEC',
      'Certified historian guide'
    ],
    excluded: [
      'Entry ticket to climb inside the Great Pyramid chamber',
      'Personal meals & tips'
    ],
    addons: [
      { name: 'Sufi Dance Show Ticket', price: 300, description: 'Reserved front-row seats for the Wekalet El-Ghouri Sufi Dance Show (Hidden Gem!).' }
    ],
    itinerary: [
      {
        day_number: 1,
        title: 'Fatimid Alleys & Minaret Heights',
        image: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=800&q=80',
        description: 'Explore the historical Al-Muizz street and climb to the top of ancient minarets.',
        activities: [
          { activity: minaretAct._id, provider: cairoProvider._id, price: 150 }
        ]
      },
      {
        day_number: 2,
        title: 'The Great Giza Pyramids Guided Walk',
        image: 'https://images.unsplash.com/photo-1503177119275-0aa32b31d458?auto=format&fit=crop&w=800&q=80',
        description: 'Guided tour around the Sphynx and Pyramids plateau with a professional guide.',
        activities: [
          { activity: pyramidsAct._id, provider: ecoProvider._id, price: 300 }
        ]
      },
      {
        day_number: 3,
        title: 'Museum of Civilization Royal Mummies',
        image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=800&q=80',
        description: 'View the stunning royal pharaonic mummies inside the state-of-the-art NMEC hall.',
        activities: [
          { activity: nmecAct._id, provider: cairoProvider._id, price: 250 }
        ]
      }
    ]
  });

  // --- EXPERIENCE 4: Cairo Dayuse ---
  await makeExperience({
    name: 'Cairo Nile Yacht & Fine Dining Dayuse',
    type: 'Package',
    description: 'A luxurious dayuse package in Cairo. Experience Nile kayaking in the morning, followed by a private Nile yacht cruise with fine dining.',
    duration_days: 1,
    price: 1200, // Activity (200) + breakdown (1000) = 1200
    destination: cairoDest._id,
    capacity: 20,
    availableDates: [
      { date: new Date('2026-06-15'), availableSeats: 20 },
      { date: new Date('2026-06-22'), availableSeats: 20 },
      { date: new Date('2026-06-29'), availableSeats: 20 }
    ],
    priceBreakdown: [
      { label: 'Private Nile Yacht Cruise & Lunch', amount: 1000 }
    ],
    image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
    ],
    included: [
      '2-Hour private Nile yacht cruise',
      'Gourmet 3-course lunch on board',
      'Safety gear & kayak instructor'
    ],
    excluded: [
      'Premium alcoholic/non-alcoholic drinks',
      'Hotel day cabins'
    ],
    addons: [
      { name: 'Violinist Live Session', price: 400, description: 'Live private violinist playing on the yacht during lunch.' }
    ],
    itinerary: [
      {
        day_number: 1,
        title: 'Nile Kayaking & Organic Dahab Island Tea',
        image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80',
        description: 'Paddle along the peaceful Nile river, and stop at the hidden Dahab Island organic farm (Hidden Gem!) for traditional mint tea.',
        activities: [
          { activity: kayakAct._id, provider: ecoProvider._id, price: 200 }
        ]
      }
    ]
  });

  // --- EXPERIENCE 5: Alex Trip ---
  await makeExperience({
    name: 'Alexandria 2-Day Greco-Roman & Mediterranean Sea Trip',
    type: 'Trip',
    description: 'Explore the historic Mediterranean city of Alexandria. Visit Qaitbay Citadel, the Roman Catacombs, and set sail on a private sunset yacht cruise.',
    duration_days: 2,
    price: 2500, // Activities (150+200+400=750) + breakdown (1200+550=1750) = 2500
    destination: alexDest._id,
    capacity: 12,
    availableDates: [
      { date: new Date('2026-06-13'), availableSeats: 12 },
      { date: new Date('2026-06-20'), availableSeats: 12 },
      { date: new Date('2026-06-27'), availableSeats: 12 }
    ],
    priceBreakdown: [
      { label: 'Sea-View Hotel Stay (1 Night)', amount: 1200 },
      { label: 'Seafood Feast at Greek Club', amount: 550 }
    ],
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543966888-7c1dc482a810?auto=format&fit=crop&w=800&q=80'
    ],
    included: [
      '1 Night stay in sea-view hotel',
      'Gourmet seafood dining at the Greek Club overlooking the harbor',
      'Entry tickets to Citadel and Roman Catacombs'
    ],
    excluded: [
      'Bibliotheca Alexandrina entry',
      'Tipping & transfers outside Alexandria'
    ],
    addons: [
      { name: 'Royal Palace Gardens Stroll', price: 200, description: 'Guided tour of the private Montazah royal palace gardens & lighthouse.' }
    ],
    itinerary: [
      {
        day_number: 1,
        title: 'Citadels & Roman Catacombs',
        image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80',
        description: 'Tours inside Qaitbay Citadel and the underground Roman Amphitheatre. Take a coffee break at the Royal Jewelry Museum gardens (Hidden Gem!).',
        activities: [
          { activity: citadelAct._id, provider: alexProvider._id, price: 150 },
          { activity: RomanAct._id, provider: alexProvider._id, price: 200 }
        ]
      },
      {
        day_number: 2,
        title: 'Mediterranean Yacht Sailing',
        image: 'https://images.unsplash.com/photo-1543966888-7c1dc482a810?auto=format&fit=crop&w=800&q=80',
        description: 'Set sail on the blue Mediterranean waters for a stunning sunset cruise.',
        activities: [
          { activity: sailingAct._id, provider: alexProvider._id, price: 400 }
        ]
      }
    ]
  });

  // --- EXPERIENCE 6: Alex Dayuse ---
  await makeExperience({
    name: 'Alexandria Stanley Beach Club Dayuse',
    type: 'Package',
    description: 'Spend an unforgettable beach day in Alexandria. Enjoy premium seaside kayaking, private cabana seating at Stanley Beach Club, and a fresh seafood lunch.',
    duration_days: 1,
    price: 950, // Activity (200) + breakdown (750) = 950
    destination: alexDest._id,
    capacity: 25,
    availableDates: [
      { date: new Date('2026-06-14'), availableSeats: 25 },
      { date: new Date('2026-06-21'), availableSeats: 25 },
      { date: new Date('2026-06-28'), availableSeats: 25 }
    ],
    priceBreakdown: [],
    image: 'https://images.unsplash.com/photo-1543966888-7c1dc482a810?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1543966888-7c1dc482a810?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80'
    ],
    included: [
      'Private beach club cabin/cabana pass',
      'Freshly prepared local seafood lunch',
      'Safety equipment & kayaking gear'
    ],
    excluded: [
      'Additional water sports',
      'Towel rentals'
    ],
    addons: [
      { name: 'Sunset Photography Pass', price: 200, description: 'Professional photographer session on the Stanley Bridge during sunset.' }
    ],
    itinerary: [
      {
        day_number: 1,
        title: 'Seaside Kayak & Lighthouse Walk',
        image: 'https://images.unsplash.com/photo-1543966888-7c1dc482a810?auto=format&fit=crop&w=800&q=80',
        description: 'Paddleboarding along the Stanley bridge bay, and sunset walk on the old Montazah lighthouse walkway (Hidden Gem!).',
        activities: [
          { activity: alexKayakAct._id, provider: alexProvider._id, price: 200 }
        ]
      }
    ]
  });

  console.log('\n🔌 Disconnecting from MongoDB...');
  await mongoose.disconnect();
  console.log('✅ Done!');
}

run().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
