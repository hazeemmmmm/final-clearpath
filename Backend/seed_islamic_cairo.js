import mongoose from 'mongoose';
import { devConfig } from './src/config/env/dev.config.js';
import { Destination } from './src/db/models/destination.model.js';
import { Experience } from './src/db/models/experience.model.js';
import { Provider } from './src/db/models/provider.model.js';
import { Activity } from './src/db/models/Activity.model.js';
import { PackingGuide } from './src/db/models/packingguide.model.js';

async function seedIslamicCairo() {
  try {
    await mongoose.connect(devConfig.DB_URL);
    console.log("Connected to MongoDB successfully!");

    // 1. Get Cairo Destination
    const cairoDest = await Destination.findOne({ name: 'Cairo' });
    if (!cairoDest) {
      console.error("Cairo destination not found. Please seed basic destinations first.");
      process.exit(1);
    }

    // 2. Create Providers
    let steigenbergerProvider = await Provider.findOne({ name: 'Steigenberger Hotel El Tahrir' });
    if (!steigenbergerProvider) {
      steigenbergerProvider = await Provider.create({
        name: 'Steigenberger Hotel El Tahrir',
        type: 'TourOperator',
        trustScore: 92
      });
      console.log("Created Provider: Steigenberger Hotel El Tahrir");
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

    let memphisTours = await Provider.findOne({ name: 'Memphis Tours' });
    if (!memphisTours) {
      memphisTours = await Provider.create({
        name: 'Memphis Tours',
        type: 'TourOperator',
        trustScore: 94
      });
      console.log("Created Provider: Memphis Tours");
    }

    // 3. Helper to upsert activities
    const upsertActivity = async (data) => {
      let act = await Activity.findOne({ name: data.name });
      if (act) {
        await Activity.deleteOne({ _id: act._id });
      }
      act = await Activity.create({ ...data, destination: cairoDest._id });
      console.log(`Created Activity: ${act.name} (${act.price} EGP)`);
      return act;
    };

    // Single breakfast activity reused for both days
    const HotelBreakfastAct = await upsertActivity({
      name: 'Steigenberger El Tahrir Hotel Breakfast Buffet',
      type: 'food',
      provider: steigenbergerProvider._id,
      price: 0,
      description: 'Start your day with a fresh buffet breakfast at the Steigenberger restaurant to fuel up before exploring Cairo.',
      image: '/menahouse_breakfast.png'
    });

    // Day 1 Activities
    const HangingObeliskAct = await upsertActivity({
      name: 'Hanging Obelisk & Grand Hall Exploration',
      type: 'tour',
      provider: egyptToursPortal._id,
      price: 0,
      description: "Witness the world's first Hanging Obelisk and walk through the Grand Hall past the colossal statue of King Ramses II.",
      image: '/gem_ramses.png'
    });

    const GEMGalleriesAct = await upsertActivity({
      name: 'Grand Egyptian Museum Main Galleries Tour',
      type: 'tour',
      provider: egyptToursPortal._id,
      price: 2900,
      description: "Comprehensive guided tour through the world's largest archaeological museum complex alongside expert Egyptologists.",
      image: '/gem_galleries.png'
    });

    const GEMPromenadeAct = await upsertActivity({
      name: 'GEM Promenade Free Walk & Café Stop',
      type: 'tour',
      provider: egyptToursPortal._id,
      price: 0,
      description: 'Free time strolling the modern museum promenade, visiting souvenir shops, or grabbing refreshments at the design cafes.',
      image: '/nmec_museum.jpg'
    });

    // Day 2 Activities
    const HistoricGatesAct = await upsertActivity({
      name: 'Historic Gates & Ornate Stonework Walk',
      type: 'tour',
      provider: memphisTours._id,
      price: 0,
      description: 'Inspect the ancient grand stone gates and fortifications of the Fatimid medieval city of Islamic Cairo.',
      image: '/al_muizz_architecture.jpg'
    });

    const IslamicCairoWalkAct = await upsertActivity({
      name: 'Islamic Cairo Heritage Walk & Minaret Exploration',
      type: 'tour',
      provider: memphisTours._id,
      price: 1100,
      description: 'Walk 4–6 km on cobblestones and uneven historic streets to visit majestic medieval mosques and historic Islamic monuments along Al-Muizz Street.',
      image: '/al_muizz_walk.jpg'
    });

    // 4. Create the Experience
    const expName = 'Islamic & Coptic Cairo Heritage Walk';
    let islamicExp = await Experience.findOne({ name: expName });
    if (islamicExp) {
      console.log("Experience already exists, deleting to recreate...");
      await Experience.deleteOne({ _id: islamicExp._id });
      await PackingGuide.deleteOne({ experience: islamicExp._id });
    }

    islamicExp = new Experience({
      name: expName,
      type: 'Trip',
      description: 'A rich 2-day cultural immersion through Islamic and ancient Cairo — from the Grand Egyptian Museum to the medieval royal highway of Al-Muizz Street, with a comfortable city-center stay at the Steigenberger Hotel El Tahrir.',
      duration_days: 2,
      price: 5500,
      capacity: 18,
      destination: cairoDest._id,
      availableDates: [
        { date: new Date('2026-06-20'), availableSeats: 18 },
        { date: new Date('2026-07-10'), availableSeats: 18 },
        { date: new Date('2026-07-25'), availableSeats: 18 }
      ],
      priceBreakdown: [
        { label: 'Steigenberger Hotel El Tahrir (1 Night)', amount: 1500 },
        { label: 'Grand Egyptian Museum Main Galleries Tour', amount: 2900 },
        { label: 'Islamic Cairo Heritage Walk & Minaret Exploration', amount: 1100 }
      ],
      image: '/al_muizz_architecture.jpg',
      images: [
        '/al_muizz_architecture.jpg',
        '/al_muizz_walk.jpg',
        '/gem_galleries.png',
        '/gem_ramses.png',
        '/nmec_museum.jpg',
        '/menahouse_breakfast.png',
        '/menahouse_dining.jpg'
      ],
      included: [
        'Accommodation for 1 night at Steigenberger Hotel El Tahrir (incl. daily breakfast buffet)',
        'Grand Egyptian Museum guided tour with expert Egyptologist',
        'Islamic Cairo Heritage Walk & Minaret Exploration with licensed guide',
        'Hanging Obelisk & Grand Hall exploration',
        'All transfers in modern, private air-conditioned vehicles',
        'Government taxes and service charges'
      ],
      excluded: [
        'Flight tickets to/from Cairo',
        'Personal purchases & souvenirs',
        'Lunches, dinners, and extra beverages',
        'GEM Promenade café stops (out of pocket)',
        'Tipping for guides and drivers'
      ],
      hotel: 'Steigenberger Hotel El Tahrir (4-Star City Center)',
      hotelContact: {
        email: 'cairo.eltahrir@steigenberger.com',
        phone: '+20 2 2575 0777'
      },
      itinerary: [
        {
          day_number: 1,
          title: 'The Modern & Ancient Treasures',
          image: '/gem_galleries.png',
          description: 'Explore the Grand Egyptian Museum — from the Hanging Obelisk and Ramses II statue to the vast main galleries housing millennia of pharaonic history.',
          activities: [
            { activity: HotelBreakfastAct._id, provider: steigenbergerProvider._id, price: 0, image: '/menahouse_breakfast.png' },
            { activity: HangingObeliskAct._id, provider: egyptToursPortal._id, price: 0, image: '/gem_ramses.png' },
            { activity: GEMGalleriesAct._id, provider: egyptToursPortal._id, price: 2900, image: '/gem_galleries.png' },
            { activity: GEMPromenadeAct._id, provider: egyptToursPortal._id, price: 0, image: '/nmec_museum.jpg' }
          ]
        },
        {
          day_number: 2,
          title: 'The Medieval Royal Highway',
          image: '/al_muizz_walk.jpg',
          description: 'Step into medieval Islamic Cairo — inspect the ancient stone gates, then walk the legendary Al-Muizz Street lined with Fatimid-era mosques, minarets, and centuries of living history.',
          activities: [
            { activity: HotelBreakfastAct._id, provider: steigenbergerProvider._id, price: 0, image: '/menahouse_dining.jpg' },
            { activity: HistoricGatesAct._id, provider: memphisTours._id, price: 0, image: '/al_muizz_architecture.jpg' },
            { activity: IslamicCairoWalkAct._id, provider: memphisTours._id, price: 1100, image: '/al_muizz_walk.jpg' }
          ]
        }
      ]
    });

    await islamicExp.save();
    console.log("Successfully created Experience: Islamic & Coptic Cairo Heritage Walk!");

    // 5. Create Packing Guide
    const packingGuide = new PackingGuide({
      name: 'Islamic & Coptic Cairo Heritage Walk Packing & Safety Guide',
      activityType: 'cultural',
      experience: islamicExp._id,
      destination: cairoDest._id,
      essentials: [
        { item: 'Water bottle (1.5L minimum)', icon: '💧', required: true },
        { item: 'Comfortable walking shoes', icon: '👟', required: true },
        { item: 'Valid ID or Passport for Museum entry', icon: '🪪', required: true },
        { item: 'Egyptian Pounds (Cash) for café stops & souvenirs', icon: '💵', required: true },
        { item: 'Camera/Phone with charged battery', icon: '📷', required: false },
        { item: 'Small backpack', icon: '🎒', required: false }
      ],
      clothing: [
        { item: 'Modest clothing (shoulders and knees covered)', notes: 'Required for entry to all mosques and Islamic monuments' },
        { item: 'Comfortable closed-toe shoes', notes: 'Essential for 4–6 km walking on cobblestones and uneven streets' },
        { item: 'Light scarf or shawl', notes: 'For women to cover hair when entering mosques' },
        { item: 'Light breathable layers', notes: 'Mornings can be cool, afternoons warm in the museum' }
      ],
      safetyTips: [
        { tip: 'Dress modestly — shoulders and knees must be covered at all Islamic heritage sites', severity: 'warning' },
        { tip: 'Stay with your tour group in the narrow lanes of Islamic Cairo', severity: 'warning' },
        { tip: 'No photography inside active prayer areas of mosques', severity: 'info' },
        { tip: 'Keep valuables secure in the crowded bazaar alleys (pickpocket risk)', severity: 'danger' },
        { tip: 'Wear comfortable shoes — cobblestones can be slippery', severity: 'info' }
      ],
      emergencyContacts: {
        police: '122',
        ambulance: '123',
        coastGuard: '16666',
        localHospital: 'Dar Al Fouad Hospital: +20 2 3827 1000'
      },
      difficultyLevel: 'moderate',
      physicalRequirements: 'Requires ability to walk 4–6 kilometers on cobblestones and uneven historic streets.',
      weatherWarnings: [
        'Summer temperatures can exceed 38°C in Islamic Cairo. Stay hydrated and take shade breaks.',
        'The museum is fully air-conditioned — bring a light layer for the indoor portions.'
      ]
    });

    await packingGuide.save();
    console.log("Successfully created linked Packing Guide!");

    islamicExp.packingGuide = packingGuide._id;
    await islamicExp.save();
    console.log("Successfully linked Packing Guide to Experience!");

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedIslamicCairo();
