import mongoose from 'mongoose';
import { devConfig } from '../src/config/env/dev.config.js';
import { Destination } from '../src/db/models/destination.model.js';
import { Experience } from '../src/db/models/experience.model.js';
import { Provider } from '../src/db/models/provider.model.js';
import { Activity } from '../src/db/models/Activity.model.js';
import { PackingGuide } from '../src/db/models/packingguide.model.js';

async function seedGiza() {
  try {
    await mongoose.connect(devConfig.DB_URL);
    console.log("Connected to MongoDB successfully!");

    // 1. Get Cairo Destination
    const cairoDest = await Destination.findOne({ name: 'Cairo' });
    if (!cairoDest) {
      console.error("Cairo destination not found in database. Please seed basic destinations first.");
      process.exit(1);
    }

    // 2. Create Providers if they don't exist
    let cairoTopTours = await Provider.findOne({ name: 'Cairo Top Tours' });
    if (!cairoTopTours) {
      cairoTopTours = await Provider.create({
        name: 'Cairo Top Tours',
        type: 'TourOperator',
        trustScore: 95
      });
      console.log("Created Provider: Cairo Top Tours");
    }

    let egyptToursPortal = await Provider.findOne({ name: 'Egypt Tours Portal' });
    if (!egyptToursPortal) {
      egyptToursPortal = await Provider.create({
        name: 'Egypt Tours Portal',
        type: 'TourOperator',
        trustScore: 97
      });
      console.log("Created Provider: Egypt Tours Portal");
    }

    let menaHouseProvider = await Provider.findOne({ name: 'Marriott Mena House' });
    if (!menaHouseProvider) {
      menaHouseProvider = await Provider.create({
        name: 'Marriott Mena House',
        type: 'TourOperator',
        trustScore: 99
      });
      console.log("Created Provider: Marriott Mena House");
    }

    let ecoProvider = await Provider.findOne({ name: 'EcoEgypt' });
    let cairoProvider = await Provider.findOne({ name: 'Heritage Walks Egypt' });

    // Helper to create or update activity
    const upsertActivity = async (data) => {
      let act = await Activity.findOne({ name: data.name });
      if (act) {
        await Activity.deleteOne({ _id: act._id });
      }
      act = await Activity.create({
        ...data,
        destination: cairoDest._id
      });
      console.log(`Created Activity: ${act.name} (${act.price} EGP)`);
      return act;
    };

    // Day 1 Activities
    const BreakfastAct = await upsertActivity({
      name: 'Royal Pyramids-View Breakfast Buffet',
      type: 'food',
      provider: menaHouseProvider._id,
      price: 0,
      description: 'Start your luxury getaway with a premium open-buffet breakfast featuring a rich selection of international and local delicacies, served in a historic garden setting directly overlooking the majestic Giza Pyramids.',
      image: '/menahouse_breakfast.png'
    });

    const GreatPyramidAct = await upsertActivity({
      name: 'Great Pyramid of Giza Tour',
      type: 'tour',
      provider: cairoTopTours._id,
      price: 500,
      description: 'Embark on a private guided tour around the Great Pyramid of Khufu, the sole surviving wonder of the ancient world. Walk the historic desert trails with a licensed guide, uncover architectural mysteries, and capture incredible close-up photos alongside the massive stone blocks.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Kheops-Pyramid.jpg'
    });

    const PyramidsPanoramaAct = await upsertActivity({
      name: 'Pyramids Panorama View & Photo Session',
      type: 'tour',
      provider: cairoTopTours._id,
      price: 450,
      description: 'Drive comfortably to the highest plateau viewpoint to capture the ultimate panoramic landscape of all three Giza pyramids lined up together. Enjoy a dedicated professional photo session with the iconic ancient complex serving as your sweeping backdrop.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/a/af/All_Gizah_Pyramids.jpg'
    });

    const CamelRideAct = await upsertActivity({
      name: 'Optional Giza Pyramids Camel Ride',
      type: 'tour',
      provider: cairoTopTours._id,
      price: 0,
      description: 'Experience an authentic desert adventure with a scenic camel ride across the rolling sands behind the pyramids. This optional activity offers a classic, adventurous way to explore the open landscape and capture timeless postcard-perfect memories.',
      image: '/pyramids_camel.png'
    });

    const SphinxAct = await upsertActivity({
      name: 'Great Sphinx & Valley Temple Tour',
      type: 'tour',
      provider: cairoTopTours._id,
      price: 500,
      description: 'Step inside the ancient Valley Temple of King Khafre to walk through its monumental granite corridors used for mummification rituals. Exit directly into the Sphinx enclosure to stand face-to-face with the legendary colossal guardian and discover its thousands of years of royal history.',
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Great_Sphinx_of_Giza_-_20080716a.jpg'
    });

    // Day 2 Activities
    const GemGalleriesAct = await upsertActivity({
      name: 'GEM Exhibition Galleries Tour',
      type: 'tour',
      provider: egyptToursPortal._id,
      price: 1600,
      description: "Take a comprehensive guided tour through the world's largest archaeological museum complex. Walk alongside expert Egyptologists to discover thousands of years of royal history, marvel at masterfully curated pharaonic collections, and explore the sprawling main exhibit halls.",
      image: '/gem_galleries.png'
    });

    const HangingObeliskAct = await upsertActivity({
      name: 'Hanging Obelisk & Grand Hall Tour',
      type: 'tour',
      provider: egyptToursPortal._id,
      price: 1300,
      description: "Witness the architectural marvel of the world's very first Hanging Obelisk positioned right at the museum's entrance. Continue your journey into the magnificent Grand Hall to stand beneath the colossal, 3,200-year-old statue of King Ramses II and appreciate the breathtaking structural scale of this modern monument.",
      image: '/gem_ramses.png'
    });

    // Day 3 Activities
    const MuizzStreetAct = await upsertActivity({
      name: 'Al-Muizz Street Guided Historic Walk',
      type: 'tour',
      provider: cairoTopTours._id,
      price: 500,
      description: "Take an immersive guided walking tour through Al-Muizz Street, one of the world's oldest open-air museums of Islamic heritage. Explore medieval architecture, grand historical mosque structures, ornate gates, and century-old monuments alongside a professional supervisor who will share stories of Cairo's rich royal history.",
      image: '/al_muizz_walk.jpg'
    });

    const KhanShoppingAct = await upsertActivity({
      name: 'Khan El Khalili Bazaar Shopping & Treasures',
      type: 'tour',
      provider: cairoTopTours._id,
      price: 400,
      description: "Dive into the vibrant, crowded lanes of Cairo's most famous historic marketplace. Enjoy a unique shopping experience as you browse traditional silver crafts, handmade perfumes, colorful textiles, and authentic souvenirs, with an optional relaxing stop at a classic local coffeehouse to soak in the atmosphere.",
      image: '/khan_khalili_shop.png'
    });

    // 4. Update the Old Cairo regional activities in DB so their images match
    if (cairoTopTours) {
      await Activity.updateOne(
        { name: 'Private Giza Pyramids Tour' },
        { $set: { image: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Kheops-Pyramid.jpg', description: 'Giza Pyramids plateau private tour.' } }
      );
      await Activity.updateOne(
        { name: 'Khan El Khalili Walking Tour' },
        { $set: { image: '/khan_khalili_shop.png', description: 'Historic bazaar walking tour.' } }
      );
    }
    if (egyptToursPortal) {
      await Activity.updateOne(
        { name: 'Grand Egyptian Museum Visit' },
        { $set: { image: '/gem_galleries.png', description: 'Grand Egyptian museum main visit.' } }
      );
    }
    if (ecoProvider) {
      await Activity.updateOne(
        { name: 'Pyramids Guided Tour' },
        { $set: { image: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Kheops-Pyramid.jpg' } }
      );
    }
    if (cairoProvider) {
      await Activity.updateOne(
        { name: 'Minaret Climbing & Storytelling' },
        { $set: { image: '/al_muizz_walk.jpg' } }
      );
    }

    console.log("Updated older Cairo regional activities images.");

    // 5. Create the Experience (Giza Pyramids & Sphinx Explorer)
    const expName = 'Giza Pyramids & Sphinx Explorer';
    let gizaExp = await Experience.findOne({ name: expName });
    if (gizaExp) {
      console.log("Experience already exists, deleting it to recreate with latest schema...");
      await Experience.deleteOne({ _id: gizaExp._id });
      await PackingGuide.deleteOne({ experience: gizaExp._id });
    }

    gizaExp = new Experience({
      name: expName,
      type: 'Trip',
      description: 'An elite 4-day exploration of the Pyramids of Giza, Sphinx, Grand Egyptian Museum, and Khan El Khalili market. Complete with a 3-night luxury stay at the iconic Marriott Mena House hotel.',
      duration_days: 4,
      price: 9750,
      capacity: 20,
      destination: cairoDest._id,
      availableDates: [
        { date: new Date('2026-06-15'), availableSeats: 20 },
        { date: new Date('2026-06-25'), availableSeats: 20 },
        { date: new Date('2026-07-05'), availableSeats: 20 }
      ],
      priceBreakdown: [
        { label: 'Marriott Marriott Mena House Lodging (3 Nights)', amount: 4500 },
        { label: 'Great Pyramid of Giza Tour', amount: 500 },
        { label: 'Pyramids Panorama View & Photo Session', amount: 450 },
        { label: 'Great Sphinx & Valley Temple Tour', amount: 500 },
        { label: 'GEM Exhibition Galleries Tour', amount: 1600 },
        { label: 'Hanging Obelisk & Grand Hall Tour', amount: 1300 },
        { label: 'Al-Muizz Street Guided Historic Walk', amount: 500 },
        { label: 'Khan El Khalili Bazaar Shopping', amount: 400 }
      ],
      image: '/menahouse_pool.jpg',
      images: [
        '/menahouse_pool.jpg',
        '/menahouse_breakfast.png',
        '/menahouse_dining.jpg',
        '/pyramids_camel.png',
        'https://upload.wikimedia.org/wikipedia/commons/e/e3/Kheops-Pyramid.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/f/f6/Great_Sphinx_of_Giza_-_20080716a.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/a/af/All_Gizah_Pyramids.jpg',
        '/gem_galleries.png',
        '/gem_ramses.png',
        '/al_muizz_walk.jpg',
        '/khan_khalili_shop.png'
      ],
      included: [
        'Accommodation for 3 nights at Marriott Mena House (incl. daily breakfast buffet)',
        'Entry fees to Giza Plateau, Grand Egyptian Museum, and Khan El-Khalili walking tour',
        'All transfers in modern, private air-conditioned vehicles',
        'Certified English-speaking private Egyptologist guides',
        'Government taxes and service charges'
      ],
      excluded: [
        'Flight tickets to/from Cairo',
        'Personal purchases & souvenirs',
        'Luncheons, dinners, and extra beverages',
        'Tipping for guides and drivers',
        'Optional camel ride at Giza plateau (cash on site)'
      ],
      hotel: 'Marriott Marriott Mena House (5-Star Luxury Pyramids View)',
      hotelContact: {
        email: 'frontoffice.menahouse@marriott.com',
        phone: '+20 2 33773222'
      },
      itinerary: [
        {
          day_number: 1,
          title: 'Giza Pyramids & Sphinx Private Tour',
          image: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Kheops-Pyramid.jpg',
          description: 'Explore the Giza Pyramids, Great Sphinx, and Valley Temple with professional guides.',
          activities: [
            { activity: BreakfastAct._id, provider: menaHouseProvider._id, price: 0, image: '/menahouse_breakfast.png' },
            { activity: GreatPyramidAct._id, provider: cairoTopTours._id, price: 500, image: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Kheops-Pyramid.jpg' },
            { activity: PyramidsPanoramaAct._id, provider: cairoTopTours._id, price: 450, image: 'https://upload.wikimedia.org/wikipedia/commons/a/af/All_Gizah_Pyramids.jpg' },
            { activity: CamelRideAct._id, provider: cairoTopTours._id, price: 0, image: '/pyramids_camel.png' },
            { activity: SphinxAct._id, provider: cairoTopTours._id, price: 500, image: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Great_Sphinx_of_Giza_-_20080716a.jpg' }
          ]
        },
        {
          day_number: 2,
          title: 'Grand Egyptian Museum Visit',
          image: '/gem_galleries.png',
          description: 'A dedicated tour of the world\'s largest archaeological museum complex.',
          activities: [
            { activity: BreakfastAct._id, provider: menaHouseProvider._id, price: 0, image: '/menahouse_dining.jpg' },
            { activity: GemGalleriesAct._id, provider: egyptToursPortal._id, price: 1600, image: '/gem_galleries.png' },
            { activity: HangingObeliskAct._id, provider: egyptToursPortal._id, price: 1300, image: '/gem_ramses.png' }
          ]
        },
        {
          day_number: 3,
          title: 'Khan El Khalili Historical Walk',
          image: '/al_muizz_walk.jpg',
          description: 'Explore historic Cairo and walk through the legendary Khan El-Khalili bazaar.',
          activities: [
            { activity: BreakfastAct._id, provider: menaHouseProvider._id, price: 0, image: '/menahouse_breakfast.png' },
            { activity: MuizzStreetAct._id, provider: cairoTopTours._id, price: 500, image: '/al_muizz_walk.jpg' },
            { activity: KhanShoppingAct._id, provider: cairoTopTours._id, price: 400, image: '/khan_khalili_shop.png' }
          ]
        }
      ]
    });

    await gizaExp.save();
    console.log("Successfully created Experience: Giza Pyramids & Sphinx Explorer!");

    // 5. Create the Packing Guide
    const packingGuide = new PackingGuide({
      name: 'Giza Pyramids & Sphinx Explorer Packing & Safety Guide',
      activityType: 'cultural',
      experience: gizaExp._id,
      destination: cairoDest._id,
      essentials: [
        { item: 'Water bottle (2L minimum)', icon: '💧', required: true },
        { item: 'Sunscreen SPF +50', icon: '🌞', required: true },
        { item: 'Hat or head cover', icon: '🧢', required: true },
        { item: 'First aid kit', icon: '🩹', required: true },
        { item: 'Camera/Phone charger', icon: '🔋', required: false },
        { item: 'Egyptian Pounds (Cash) for camel rides & shopping', icon: '💵', required: true },
        { item: 'Valid ID or Passport for Museum entry', icon: '🪪', required: true }
      ],
      clothing: [
        { item: 'Comfortable closed-toe shoes/boots', notes: 'Essential for walking on sands and gravel' },
        { item: 'Light breathable jacket/cardigan', notes: 'For early mornings/evenings and museum air conditioning' },
        { item: 'Moisture-wicking shirt/blouse', notes: 'Keeps you dry and cool during hot day walks' },
        { item: 'Modest clothing (shoulders and knees covered)', notes: 'Required for entry to archaeological and historic bazaar sites' }
      ],
      safetyTips: [
        { tip: 'Stay hydrated — drink at least 3 liters of water daily', severity: 'warning' },
        { tip: 'Always stay with your tour group and notify your guide before leaving', severity: 'warning' },
        { tip: 'Avoid unofficial street vendors at the pyramids gates and Khan El Khalili', severity: 'info' },
        { tip: 'Follow museum photography guidelines (no flash allowed inside)', severity: 'info' },
        { tip: 'Keep valuables secure in crowded museum and bazaar areas (pickpocket risk)', severity: 'danger' }
      ],
      emergencyContacts: {
        police: '122',
        ambulance: '123',
        coastGuard: '16666',
        localHospital: 'Dar Al Fouad Hospital: +20 2 3827 1000'
      },
      difficultyLevel: 'moderate',
      physicalRequirements: 'Requires ability to walk 3-6 kilometers on sand and uneven historic streets.',
      weatherWarnings: [
        'Summer temperatures often exceed 40 degrees. Tours are scheduled early morning.',
        'High UV index during the day. Protection is strongly recommended.'
      ]
    });

    await packingGuide.save();
    console.log("Successfully created linked Packing Guide!");

    // Update experience to link packing guide
    gizaExp.packingGuide = packingGuide._id;
    await gizaExp.save();
    console.log("Successfully linked Packing Guide to Experience!");

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedGiza();
