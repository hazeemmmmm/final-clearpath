import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'src/config/env/dev.env') });

const seedHeroPackage = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('DB Connected');

    const { Destination } = await import('./src/db/models/destination.model.js');
    const { Provider } = await import('./src/db/models/provider.model.js');
    const { Activity } = await import('./src/db/models/activity.model.js');
    const { Experience } = await import('./src/db/models/experience.model.js');
    const { PackingGuide } = await import('./src/db/models/packingguide.model.js');

    // 1. Destination
    let dest = await Destination.findOne({ name: 'Siwa Oasis' });
    if (!dest) {
      dest = await Destination.create({
        name: 'Siwa Oasis',
        country: 'Egypt',
        description: 'An enchanting oasis known for its salt lakes, hot springs, and rich Amazigh culture.',
        image: 'https://images.unsplash.com/photo-1600573472550-80905ca12435?auto=format&fit=crop&w=800&q=80'
      });
    }

    // 2. Provider
    let provider = await Provider.findOne({ name: 'Siwa Eco-Tours' });
    if (!provider) {
      provider = await Provider.create({
        name: 'Siwa Eco-Tours',
        type: 'TourOperator',
        contact_email: 'eco@siwa.com',
        rating: 4.95,
      });
    }

    // 3. Activities (Hourly Breakdown)
    const act1 = await Activity.create({ name: '08:00 AM - VIP Transport from Cairo', type: 'tour', destination: dest._id, price: 0, duration: 8, provider: provider._id, description: 'Luxury A/C bus equipped with Wi-Fi.' });
    const act2 = await Activity.create({ name: '04:00 PM - Arrival & Shali Fortress Tour', type: 'hiking', destination: dest._id, price: 20, duration: 2, provider: provider._id, description: 'Explore the ancient mud-brick ruins at sunset.' });
    const act3 = await Activity.create({ name: '08:00 AM - Salt Lakes Swimming', type: 'entertainment', destination: dest._id, price: 15, duration: 3, provider: provider._id, description: 'Float effortlessly in the crystal-clear salt pools.' });
    const act4 = await Activity.create({ name: '01:00 PM - Cleopatra Spring & Lunch', type: 'entertainment', destination: dest._id, price: 30, duration: 2, provider: provider._id, description: 'Relax in the historic spring and enjoy traditional Siwan lunch.' });
    const act5 = await Activity.create({ name: '04:00 PM - Great Sand Sea 4x4 Safari', type: 'tour', destination: dest._id, price: 60, duration: 4, provider: provider._id, description: 'Dune bashing and sunset tea at the hot springs.' });
    const act6 = await Activity.create({ name: '09:00 AM - Oracle Temple of Amun', type: 'tour', destination: dest._id, price: 10, duration: 2, provider: provider._id, description: 'Follow the footsteps of Alexander the Great.' });
    const act7 = await Activity.create({ name: '12:00 PM - Return to Cairo', type: 'tour', destination: dest._id, price: 0, duration: 8, provider: provider._id, description: 'Return journey with a stop at Marsa Matrouh.' });

    // 4. Create Hero Experience
    const newTrip = await Experience.create({
      name: 'The Ultimate Siwa Expedition (Luxury Eco-Tour)',
      type: 'Trip',
      duration_days: 3,
      base_price: 350, // Zero hidden fees - all inclusive base
      destination: dest._id,
      capacity: 8,
      description: 'Discover the hidden gem of Siwa Oasis in ultimate comfort. A perfectly curated 3-day itinerary blending adventure, history, and relaxation.',
      image: 'https://images.unsplash.com/photo-1600573472550-80905ca12435?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1600573472550-80905ca12435?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1549416878-b9ca95e26903?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582806307672-04e223d6a2f7?auto=format&fit=crop&w=800&q=80'
      ],
      addons: [
        { name: 'Seamless Home Pickup (Cairo/Giza)', price: 40, description: 'Private car from your doorstep to the meeting point.' },
        { name: 'Professional Drone Photography', price: 100, description: 'A dedicated photographer with a DJI drone.' }
      ],
      itinerary: [
        {
          day_number: 1,
          title: 'Day 1: The Journey to Antiquity',
          image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80',
          description: 'Travel through the desert and witness the majestic ruins of Shali Fortress at dusk.',
          activities: [
            { activity: act1._id, provider: provider._id, price: act1.price },
            { activity: act2._id, provider: provider._id, price: act2.price }
          ]
        },
        {
          day_number: 2,
          title: 'Day 2: Salt, Springs, and Sand',
          image: 'https://images.unsplash.com/photo-1582806307672-04e223d6a2f7?auto=format&fit=crop&w=800&q=80',
          description: 'A full day of contrasting natural wonders. From floating in salt lakes to dune bashing in the Sahara.',
          activities: [
            { activity: act3._id, provider: provider._id, price: act3.price },
            { activity: act4._id, provider: provider._id, price: act4.price },
            { activity: act5._id, provider: provider._id, price: act5.price }
          ]
        },
        {
          day_number: 3,
          title: 'Day 3: Footsteps of Alexander',
          image: 'https://images.unsplash.com/photo-1600573472550-80905ca12435?auto=format&fit=crop&w=800&q=80',
          description: 'Explore the mystical Oracle Temple before a scenic drive back.',
          activities: [
            { activity: act6._id, provider: provider._id, price: act6.price },
            { activity: act7._id, provider: provider._id, price: act7.price }
          ]
        }
      ]
    });

    // 5. Packing Guide & Safety
    await PackingGuide.create({
      name: 'Siwa Eco-Tour Packing Guide',
      activityType: 'desert',
      experience: newTrip._id,
      destination: dest._id,
      difficultyLevel: 'easy',
      physicalRequirements: 'Suitable for all ages. Requires minimal walking.',
      essentials: [
        { item: 'Swimwear', required: true, icon: '🩱' },
        { item: 'High SPF Sunscreen', required: true, icon: '☀️' },
        { item: 'Mosquito Repellent', required: true, icon: '🦟' }
      ],
      clothing: [
        { item: 'Light Cotton Clothing', notes: 'Best for the daytime heat.' },
        { item: 'Water Shoes', notes: 'Crucial for the salt lakes (sharp crystals).' }
      ],
      safetyTips: [
        { tip: 'Do NOT rub your eyes after swimming in the salt lakes!', severity: 'danger' },
        { tip: 'Stay hydrated; the dry heat can be deceptive.', severity: 'warning' },
        { tip: 'Always wear your seatbelt during the 4x4 dune bashing.', severity: 'info' }
      ]
    });

    console.log('✅ Successfully seeded the Hero Package!');
    process.exit(0);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedHeroPackage();
