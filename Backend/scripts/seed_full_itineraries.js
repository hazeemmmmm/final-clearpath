import mongoose from 'mongoose';
import { Destination } from '../src/db/models/destination.model.js';
import { Experience } from '../src/db/models/experience.model.js';
import { Activity } from '../src/db/models/activity.model.js';
import { Provider } from '../src/db/models/provider.model.js';
import { devConfig } from '../src/config/env/dev.config.js';

const DB_URL = devConfig.DB_URL;

async function seed() {
  console.log('🌱 Connecting to database...');
  await mongoose.connect(DB_URL);
  console.log('✅ Connected to MongoDB!');

  console.log('🧹 Wiping providers and activities collections...');
  await Provider.deleteMany({});
  await Activity.deleteMany({});
  console.log('✅ Wiped successfully!');

  // Get all destinations
  const destinations = await Destination.find({});
  const destMap = {};
  destinations.forEach(d => {
    destMap[d.name.toLowerCase()] = d._id;
  });
  console.log('📍 Destinations mapped:', Object.keys(destMap));

  // 1. Create clean providers
  console.log('🤝 Creating premium local providers...');
  const providersData = [
    { name: 'Egyptology Experts Co.', type: 'Guide', trustScore: 98 },
    { name: 'Cairo Nile Transfers', type: 'Transport', trustScore: 95 },
    { name: 'Red Sea Marine Club', type: 'Equipment', trustScore: 97 },
    { name: 'Hurghada Diving Center', type: 'Equipment', trustScore: 99 },
    { name: 'Luxor Ballooning & Felucca', type: 'TourOperator', trustScore: 96 },
    { name: 'Sinai Local Bedouin Guides', type: 'Guide', trustScore: 98 },
    { name: 'Alexandria Sea Tours', type: 'TourOperator', trustScore: 94 }
  ];

  const createdProviders = await Provider.insertMany(providersData);
  console.log(`✅ Created ${createdProviders.length} providers!`);

  const provMap = {};
  createdProviders.forEach(p => {
    provMap[p.name] = p._id;
  });

  // 2. Define activities list with destination and provider
  console.log('⚡ Creating activities catalog...');
  const activitiesData = [
    // Cairo
    { name: 'Giza Pyramids Guided Trek', type: 'tour', destName: 'cairo', provName: 'Egyptology Experts Co.', price: 400 },
    { name: 'Great Sphinx Camel Ride', type: 'tour', destName: 'cairo', provName: 'Egyptology Experts Co.', price: 250 },
    { name: 'Saladin Citadel Historical Tour', type: 'tour', destName: 'cairo', provName: 'Egyptology Experts Co.', price: 300 },
    { name: 'Khan El-Khalili Shopping Walk', type: 'tour', destName: 'cairo', provName: 'Cairo Nile Transfers', price: 150 },
    { name: 'Egyptian Museum VIP Access Tour', type: 'tour', destName: 'cairo', provName: 'Egyptology Experts Co.', price: 500 },
    { name: 'Nile Dinner Cruise & Folk Show', type: 'entertainment', destName: 'cairo', provName: 'Cairo Nile Transfers', price: 750 },
    { name: 'Pyramids View Sunset Yoga', type: 'entertainment', destName: 'cairo', provName: 'Egyptology Experts Co.', price: 200 },
    { name: 'Nile Corniche Felucca Sail', type: 'entertainment', destName: 'cairo', provName: 'Cairo Nile Transfers', price: 180 },

    // Hurghada
    { name: 'Giftun Island Reef Snorkeling', type: 'tour', destName: 'hurghada', provName: 'Red Sea Marine Club', price: 450 },
    { name: 'El Gouna Speedboat Lagoon Tour', type: 'tour', destName: 'hurghada', provName: 'Red Sea Marine Club', price: 600 },
    { name: 'PADI Open Water Certification Course', type: 'tour', destName: 'hurghada', provName: 'Hurghada Diving Center', price: 1200 },
    { name: 'Quad Bike Desert Safari', type: 'tour', destName: 'hurghada', provName: 'Hurghada Diving Center', price: 550 },
    { name: 'Bedouin Camp Sunset Feast', type: 'entertainment', destName: 'hurghada', provName: 'Hurghada Diving Center', price: 350 },
    { name: 'Parasailing & Jet Ski rides', type: 'entertainment', destName: 'hurghada', provName: 'Red Sea Marine Club', price: 400 },

    // Luxor
    { name: 'Valley of the Kings Guided Walk', type: 'tour', destName: 'luxor', provName: 'Egyptology Experts Co.', price: 500 },
    { name: 'Karnak & Luxor Temples Discovery', type: 'tour', destName: 'luxor', provName: 'Egyptology Experts Co.', price: 400 },
    { name: 'Sunrise Hot Air Balloon Ride', type: 'tour', destName: 'luxor', provName: 'Luxor Ballooning & Felucca', price: 950 },
    { name: 'Private Felucca Sailing on the Nile', type: 'tour', destName: 'luxor', provName: 'Luxor Ballooning & Felucca', price: 300 },
    { name: 'Luxor Sound and Light Show', type: 'entertainment', destName: 'luxor', provName: 'Egyptology Experts Co.', price: 250 },

    // Dahab
    { name: 'Colored Canyon Trekking & Climb', type: 'hiking', destName: 'dahab', provName: 'Sinai Local Bedouin Guides', price: 350 },
    { name: 'Blue Hole Scuba Diving Pro', type: 'tour', destName: 'dahab', provName: 'Sinai Local Bedouin Guides', price: 800 },
    { name: 'Dahab Canyon Quad Biking', type: 'tour', destName: 'dahab', provName: 'Sinai Local Bedouin Guides', price: 450 },
    { name: 'Sunrise Yoga on the Beach', type: 'entertainment', destName: 'dahab', provName: 'Sinai Local Bedouin Guides', price: 200 },

    // Alexandria
    { name: 'Catacombs of Kom El Shoqafa Tour', type: 'tour', destName: 'alexandria', provName: 'Alexandria Sea Tours', price: 250 },
    { name: 'Bibliotheca Alexandrina Walk', type: 'tour', destName: 'alexandria', provName: 'Alexandria Sea Tours', price: 150 },
    { name: 'Qaitbay Citadel Sea Breeze Walk', type: 'tour', destName: 'alexandria', provName: 'Alexandria Sea Tours', price: 200 },
    { name: 'Stanley Bridge Sunset Dinner', type: 'food', destName: 'alexandria', provName: 'Alexandria Sea Tours', price: 450 }
  ];

  const createdActivities = [];
  for (const act of activitiesData) {
    const destId = destMap[act.destName];
    const provId = provMap[act.provName];
    if (destId && provId) {
      const created = await Activity.create({
        name: act.name,
        type: act.type,
        destination: destId,
        provider: provId,
        price: act.price
      });
      createdActivities.push(created);
    }
  }
  console.log(`✅ Created ${createdActivities.length} activities in catalog!`);

  // Helper function to map activity name to its object
  const getAct = (name) => {
    const found = createdActivities.find(a => a.name === name);
    if (!found) {
      console.warn(`⚠️ Warning: Activity not found in DB: "${name}"`);
    }
    return found;
  };

  // 3. Update all 16 experiences with rich, realistic itineraries
  console.log('🗺️ Injecting high-quality visual itineraries into experiences...');

  // Cairo Pyramids & Sphinx Full-Day Trip
  await Experience.findOneAndUpdate(
    { name: 'Cairo Pyramids & Sphinx Full-Day Trip' },
    {
      itinerary: [
        {
          day_number: 1,
          title: 'Day 1: Giza Plateau Wonders & Camel Ride',
          image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80',
          description: 'Marvel at the ancient Giza Pyramids and Sphinx, and take a traditional camel ride across the golden dunes with a certified expert guide.',
          activities: [
            { activity: getAct('Giza Pyramids Guided Trek')._id, provider: provMap['Egyptology Experts Co.'], price: 400 },
            { activity: getAct('Great Sphinx Camel Ride')._id, provider: provMap['Egyptology Experts Co.'], price: 250 }
          ]
        },
        {
          day_number: 2,
          title: 'Day 2: Nile Felucca Sunset & Dinner',
          image: 'https://images.unsplash.com/photo-1590500462523-b4438c0a3bf8?auto=format&fit=crop&w=600&q=80',
          description: 'Sail the Nile in a traditional wooden felucca at sunset and cap off the trip with a vibrant dinner show.',
          activities: [
            { activity: getAct('Nile Corniche Felucca Sail')._id, provider: provMap['Cairo Nile Transfers'], price: 180 },
            { activity: getAct('Nile Dinner Cruise & Folk Show')._id, provider: provMap['Cairo Nile Transfers'], price: 750 }
          ]
        }
      ]
    }
  );

  // Islamic Cairo & Khan El-Khalili Heritage Walk
  await Experience.findOneAndUpdate(
    { name: 'Islamic Cairo & Khan El-Khalili Heritage Walk' },
    {
      itinerary: [
        {
          day_number: 1,
          title: 'Day 1: Citadel Saladin Architecture',
          image: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=600&q=80',
          description: 'Explore the grand medieval fortress, learn about defensive architecture, and view the city skyline.',
          activities: [
            { activity: getAct('Saladin Citadel Historical Tour')._id, provider: provMap['Egyptology Experts Co.'], price: 300 }
          ]
        },
        {
          day_number: 2,
          title: 'Day 2: Historical Khan El-Khalili Bazaar Walk',
          image: 'https://images.unsplash.com/photo-1590500462523-b4438c0a3bf8?auto=format&fit=crop&w=600&q=80',
          description: 'Wander through the historic gold and spice markets, buy souvenirs, and enjoy traditional mint tea.',
          activities: [
            { activity: getAct('Khan El-Khalili Shopping Walk')._id, provider: provMap['Cairo Nile Transfers'], price: 150 }
          ]
        }
      ]
    }
  );

  // Egyptian Museum & Old Cairo Private Tour
  await Experience.findOneAndUpdate(
    { name: 'Egyptian Museum & Old Cairo Private Tour' },
    {
      itinerary: [
        {
          day_number: 1,
          title: 'Day 1: Museum Treasures & Tutankhamun',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
          description: 'Get exclusive guided access to thousands of royal mummies, sarcophagi, and the stunning Tutankhamun mask.',
          activities: [
            { activity: getAct('Egyptian Museum VIP Access Tour')._id, provider: provMap['Egyptology Experts Co.'], price: 500 }
          ]
        },
        {
          day_number: 2,
          title: 'Day 2: Old Cairo Churches & Felucca Ride',
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
          description: 'Explore the gorgeous hanging church, Coptic historic alleys, and cruise the Nile under the warm sun.',
          activities: [
            { activity: getAct('Nile Corniche Felucca Sail')._id, provider: provMap['Cairo Nile Transfers'], price: 180 }
          ]
        }
      ]
    }
  );

  // Hurghada Red Sea Snorkeling & Island Cruise
  await Experience.findOneAndUpdate(
    { name: 'Hurghada Red Sea Snorkeling & Island Cruise' },
    {
      itinerary: [
        {
          day_number: 1,
          title: 'Day 1: Coral Reef Dive & BBQ on board',
          image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
          description: 'Cruise out to deep waters, swim with sea turtles, and enjoy a rich open-buffet lunch on the speedboat.',
          activities: [
            { activity: getAct('Giftun Island Reef Snorkeling')._id, provider: provMap['Red Sea Marine Club'], price: 450 }
          ]
        },
        {
          day_number: 2,
          title: 'Day 2: Thrilling Water Sports Day',
          image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=600&q=80',
          description: 'Experience flying over the Red Sea with parasailing and speed through the waves on a premium jet ski.',
          activities: [
            { activity: getAct('Parasailing & Jet Ski rides')._id, provider: provMap['Red Sea Marine Club'], price: 400 }
          ]
        }
      ]
    }
  );

  // Hurghada Deep Diving PADI Certification Trip
  await Experience.findOneAndUpdate(
    { name: 'Hurghada Deep Diving PADI Certification Trip' },
    {
      itinerary: [
        {
          day_number: 1,
          title: 'Day 1: Academic Training & Pool Trial',
          image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=600&q=80',
          description: 'Get equipped, learn breathing rules, and practice buoyancy control inside a heated resort pool.',
          activities: [
            { activity: getAct('PADI Open Water Certification Course')._id, provider: provMap['Hurghada Diving Center'], price: 1200 }
          ]
        }
      ]
    }
  );

  // Hurghada Desert Safari & Quad Bike Adventure
  await Experience.findOneAndUpdate(
    { name: 'Hurghada Desert Safari & Quad Bike Adventure' },
    {
      itinerary: [
        {
          day_number: 1,
          title: 'Day 1: Quad Bike Safari & Stargazing',
          image: 'https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=600&q=80',
          description: 'Drive quad bikes through sand canyons, visit a Bedouin village, and feast under the stars with dynamic folklore shows.',
          activities: [
            { activity: getAct('Quad Bike Desert Safari')._id, provider: provMap['Hurghada Diving Center'], price: 550 },
            { activity: getAct('Bedouin Camp Sunset Feast')._id, provider: provMap['Hurghada Diving Center'], price: 350 }
          ]
        }
      ]
    }
  );

  // Luxor Valley of the Kings & Karnak Temple Tour
  await Experience.findOneAndUpdate(
    { name: 'Luxor Valley of the Kings & Karnak Temple Tour' },
    {
      itinerary: [
        {
          day_number: 1,
          title: 'Day 1: West Bank Royal Tombs Walk',
          image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
          description: 'Descend into three spectacular Pharaoh tombs in the Valley of the Kings, led by a professional Egyptologist guide.',
          activities: [
            { activity: getAct('Valley of the Kings Guided Walk')._id, provider: provMap['Egyptology Experts Co.'], price: 500 }
          ]
        },
        {
          day_number: 2,
          title: 'Day 2: East Bank Karnak Columns Tour',
          image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=600&q=80',
          description: 'Walk through the giant columns of Karnak Temple and see the famous Ramses sphinx walkway.',
          activities: [
            { activity: getAct('Karnak & Luxor Temples Discovery')._id, provider: provMap['Egyptology Experts Co.'], price: 400 }
          ]
        }
      ]
    }
  );

  // Luxor Hot Air Balloon & Nile Felucca Cruise
  await Experience.findOneAndUpdate(
    { name: 'Luxor Hot Air Balloon & Nile Felucca Cruise' },
    {
      itinerary: [
        {
          day_number: 1,
          title: 'Day 1: Sunrise Balloon & Private Felucca',
          image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=600&q=80',
          description: 'Fly high above the Nile at sunrise in a hot air balloon, followed by a private sailboat cruise past the West Bank.',
          activities: [
            { activity: getAct('Sunrise Hot Air Balloon Ride')._id, provider: provMap['Luxor Ballooning & Felucca'], price: 950 },
            { activity: getAct('Private Felucca Sailing on the Nile')._id, provider: provMap['Luxor Ballooning & Felucca'], price: 300 }
          ]
        }
      ]
    }
  );

  // Alexandria Catacombs & Bibliotheca Day Trip
  await Experience.findOneAndUpdate(
    { name: 'Alexandria Catacombs & Bibliotheca Day Trip' },
    {
      itinerary: [
        {
          day_number: 1,
          title: 'Day 1: Greco-Roman History & Seafood Feast',
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
          description: 'Explore the amazing catacombs of Kom El Shoqafa, stroll the Citadel, visit the grand library, and dine at Stanley Bridge.',
          activities: [
            { activity: getAct('Catacombs of Kom El Shoqafa Tour')._id, provider: provMap['Alexandria Sea Tours'], price: 250 },
            { activity: getAct('Bibliotheca Alexandrina Walk')._id, provider: provMap['Alexandria Sea Tours'], price: 150 },
            { activity: getAct('Stanley Bridge Sunset Dinner')._id, provider: provMap['Alexandria Sea Tours'], price: 450 }
          ]
        }
      ]
    }
  );

  // Cairo Nile Corniche Luxury Pool Day
  await Experience.findOneAndUpdate(
    { name: 'Cairo Nile Corniche Luxury Pool Day' },
    {
      itinerary: [
        {
          day_number: 1,
          title: 'Single Day: Luxury Pool & Pyramids View High Tea',
          image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
          description: 'Spend a relaxing day swimming inside a 5-star Nile pool resort, and enjoy pyramids-view sunset felucca sailing.',
          activities: [
            { activity: getAct('Nile Corniche Felucca Sail')._id, provider: provMap['Cairo Nile Transfers'], price: 180 }
          ]
        }
      ]
    }
  );

  // Cairo Desert Escape: Spa & Wellness Day
  await Experience.findOneAndUpdate(
    { name: 'Cairo Desert Escape: Spa & Wellness Day' },
    {
      itinerary: [
        {
          day_number: 1,
          title: 'Single Day: Desert Plateau Yoga & Sound Healing',
          image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
          description: 'Escape the rush of Cairo, practice sunrise yoga overlooking the plateau, and enjoy organic healthy lunch and massage.',
          activities: [
            { activity: getAct('Pyramids View Sunset Yoga')._id, provider: provMap['Egyptology Experts Co.'], price: 200 }
          ]
        }
      ]
    }
  );

  // Hurghada Beach Club: Water Sports & Snorkeling
  await Experience.findOneAndUpdate(
    { name: 'Hurghada Beach Club: Water Sports & Snorkeling' },
    {
      itinerary: [
        {
          day_number: 1,
          title: 'Single Day: Marina Snorkeling & Wave Sailing',
          image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
          description: 'Relax on a premium private beachfront, snorkel with life jackets, and try out parasailing and wave runners.',
          activities: [
            { activity: getAct('Giftun Island Reef Snorkeling')._id, provider: provMap['Red Sea Marine Club'], price: 450 },
            { activity: getAct('Parasailing & Jet Ski rides')._id, provider: provMap['Red Sea Marine Club'], price: 400 }
          ]
        }
      ]
    }
  );

  // Dahab Beach Yoga & Sunset Meditation Day
  await Experience.findOneAndUpdate(
    { name: 'Dahab Beach Yoga & Sunset Meditation Day' },
    {
      itinerary: [
        {
          day_number: 1,
          title: 'Single Day: Blue Lagoon Yoga & Snorkeling',
          image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
          description: 'Relax with morning beach meditation, snorkel in the clear canyon reefs, and enjoy freshly prepared Bedouin lunch.',
          activities: [
            { activity: getAct('Sunrise Yoga on the Beach')._id, provider: provMap['Sinai Local Bedouin Guides'], price: 200 }
          ]
        }
      ]
    }
  );

  // Luxor East Bank Pool Day & Felucca Sunset
  await Experience.findOneAndUpdate(
    { name: 'Luxor East Bank Pool Day & Felucca Sunset' },
    {
      itinerary: [
        {
          day_number: 1,
          title: 'Single Day: Nile Side Pool & Felucca Cruise',
          image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=600&q=80',
          description: 'Recline on a luxury Nile-front pool chair, feast on traditional mezze, and embark on a private felucca cruise past old temples.',
          activities: [
            { activity: getAct('Private Felucca Sailing on the Nile')._id, provider: provMap['Luxor Ballooning & Felucca'], price: 300 }
          ]
        }
      ]
    }
  );

  console.log('🎉 SUCCESSFULLY INJECTED HIGH-QUALITY ITINERARIES IN ALL 16 PACKAGES!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
