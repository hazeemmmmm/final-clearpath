import mongoose from 'mongoose';
import { devConfig } from '../src/config/env/dev.config.js';
import { Destination } from '../src/db/models/destination.model.js';
import { Experience } from '../src/db/models/experience.model.js';
import { Provider } from '../src/db/models/provider.model.js';
import { Activity } from '../src/db/models/Activity.model.js';
import { PackingGuide } from '../src/db/models/packingguide.model.js';

async function seedDayuseCairo() {
  try {
    await mongoose.connect(devConfig.DB_URL);
    console.log("Connected to MongoDB successfully!");

    const cairoDest = await Destination.findOne({ name: 'Cairo' });
    if (!cairoDest) {
      console.error("Cairo destination not found. Please seed basic destinations first.");
      process.exit(1);
    }

    // ─── Providers ───────────────────────────────────────────────
    let gomhouriaProvider = await Provider.findOne({ name: 'Gomhouria Theatre' });
    if (!gomhouriaProvider) {
      gomhouriaProvider = await Provider.create({
        name: 'Gomhouria Theatre',
        type: 'TourOperator',
        trustScore: 90
      });
      console.log("Created Provider: Gomhouria Theatre");
    }

    let ministryOfCulture = await Provider.findOne({ name: 'Ministry of Culture - Cultural Production Sector' });
    if (!ministryOfCulture) {
      ministryOfCulture = await Provider.create({
        name: 'Ministry of Culture - Cultural Production Sector',
        type: 'TourOperator',
        trustScore: 88
      });
      console.log("Created Provider: Ministry of Culture");
    }

    let cairoTopTours = await Provider.findOne({ name: 'Cairo Top Tours' });
    if (!cairoTopTours) {
      cairoTopTours = await Provider.create({
        name: 'Cairo Top Tours',
        type: 'TourOperator',
        trustScore: 95
      });
      console.log("Created Provider: Cairo Top Tours");
    }

    let elFishawyProvider = await Provider.findOne({ name: 'El Fishawy Cafe' });
    if (!elFishawyProvider) {
      elFishawyProvider = await Provider.create({
        name: 'El Fishawy Cafe',
        type: 'TourOperator',
        trustScore: 85
      });
      console.log("Created Provider: El Fishawy Cafe");
    }

    const upsertActivity = async (data) => {
      let act = await Activity.findOne({ name: data.name });
      if (act) await Activity.deleteOne({ _id: act._id });
      act = await Activity.create({ ...data, destination: cairoDest._id });
      console.log(`Created Activity: ${act.name} (${act.price} EGP)`);
      return act;
    };

    // ═══════════════════════════════════════════════════════════════
    // PACKAGE 1 — Mohamed Mounir Concert
    // ═══════════════════════════════════════════════════════════════

    // Activity 1: Arrival & Reception (Included)
    const GomhouriaArrivalAct = await upsertActivity({
      name: 'Gomhouria Theatre Arrival & Guest Reception',
      type: 'entertainment',
      provider: ministryOfCulture._id,
      price: 0,
      description: "Arrive at the historic Gomhouria Theatre in Downtown Cairo. Complete your check-in, receive your event programme booklet, and settle into your classic theatre seats while enjoying pre-show warm-ups.",
      image: '/gomhouria_theatre_interior.png'
    });

    // Activity 2: Live Concert (1800 EGP)
    const MounirConcertAct = await upsertActivity({
      name: 'Mohamed Mounir Live on Stage - Gomhouria Theatre',
      type: 'entertainment',
      provider: gomhouriaProvider._id,
      price: 1800,
      description: "Witness a soulful Nubian night with 'The King' Mohamed Mounir. Enjoy an exceptional 3-hour live performance blending jazz, folk, and traditional Arabic melodies, featuring legendary hits from 'Bnetweled' to 'Shababeek'.",
      image: '/mounir_performing.png'
    });

    const mounirExpName = 'Mohamed Mounir Concert - Gomhouria Theatre';
    let mounirExp = await Experience.findOne({ name: mounirExpName });
    if (mounirExp) {
      await Experience.deleteOne({ _id: mounirExp._id });
      await PackingGuide.deleteOne({ experience: mounirExp._id });
      console.log("Deleted existing Mounir Concert experience.");
    }

    mounirExp = new Experience({
      name: mounirExpName,
      type: 'Package',
      description: "An unforgettable evening at the historic Gomhouria Theatre in Downtown Cairo. Experience 'The King' Mohamed Mounir live on stage in a 3-hour soulful performance blending Nubian jazz, folk, and classic Arabic hits.",
      duration_days: 1,
      price: 1800,
      capacity: 300,
      destination: cairoDest._id,
      availableDates: [
        { date: new Date('2026-07-05'), availableSeats: 300 },
        { date: new Date('2026-07-19'), availableSeats: 300 },
        { date: new Date('2026-08-02'), availableSeats: 300 }
      ],
      priceBreakdown: [
        { label: 'Mohamed Mounir Live Concert Ticket (incl. programme booklet)', amount: 1800 }
      ],
      image: '/mounir_concert_stage.png',
      images: [
        '/mounir_concert_stage.png',
        '/mounir_performing.png',
        '/gomhouria_theatre_interior.png',
        '/mounir_concert_night.png'
      ],
      included: [
        'Concert ticket for Mohamed Mounir live performance',
        'Event programme booklet',
        'Classic Gomhouria Theatre seating',
        'Check-in & guest reception service'
      ],
      excluded: [
        'Transportation to/from Gomhouria Theatre',
        'Food & beverages',
        'Parking fees'
      ],
      itinerary: [
        {
          day_number: 1,
          title: 'A Night with The King — Mohamed Mounir Live',
          image: '/gomhouria_theatre_interior.png',
          description: 'Arrive at Gomhouria Theatre by 5:30 PM for check-in and seat selection. The live concert begins at 7:00 PM with a 3-hour performance of legendary Nubian and Arabic classics.',
          activities: [
            { activity: GomhouriaArrivalAct._id, provider: ministryOfCulture._id, price: 0, image: '/gomhouria_theatre_interior.png' },
            { activity: MounirConcertAct._id, provider: gomhouriaProvider._id, price: 1800, image: '/mounir_performing.png' }
          ]
        }
      ]
    });

    await mounirExp.save();
    console.log("Successfully created: Mohamed Mounir Concert - Gomhouria Theatre!");

    const mounirPackingGuide = new PackingGuide({
      name: 'Mohamed Mounir Concert Preparation Guide',
      activityType: 'general',
      experience: mounirExp._id,
      destination: cairoDest._id,
      essentials: [
        { item: 'Concert ticket (printed or digital)', icon: '🎟️', required: true },
        { item: 'Valid ID or Passport', icon: '🪪', required: true },
        { item: 'Charged mobile phone', icon: '📱', required: false }
      ],
      clothing: [
        { item: 'Smart-casual attire', notes: 'Dress code is smart-casual for the theatre' },
        { item: 'Light jacket or cardigan', notes: 'Gomhouria Theatre has central A/C — can get cold' },
        { item: 'Comfortable shoes', notes: 'For walking to/from your seat' }
      ],
      safetyTips: [
        { tip: 'Keep your ticket with you at all times — no re-entry without it', severity: 'warning' },
        { tip: 'Strictly no flash photography inside the theatre during the performance', severity: 'info' },
        { tip: 'Follow all security instructions at the theatre entrance', severity: 'info' }
      ],
      emergencyContacts: {
        police: '122',
        ambulance: '123',
        coastGuard: '16666',
        localHospital: 'Kasr Al Ainy Hospital: +20 2 2365 7415'
      },
      difficultyLevel: 'easy',
      physicalRequirements: 'No physical exertion required — fully seated event in a classic theatre.',
      weatherWarnings: [
        'The theatre is indoors and air-conditioned. Bring a light layer for comfort.'
      ]
    });

    await mounirPackingGuide.save();
    mounirExp.packingGuide = mounirPackingGuide._id;
    await mounirExp.save();
    console.log("Packing Guide linked to Mounir Concert!");

    // ═══════════════════════════════════════════════════════════════
    // PACKAGE 2 — Al-Hussein Mosque & Al-Muizz Street Heritage Walk
    // ═══════════════════════════════════════════════════════════════

    // Activity 1: Mosque & Square Visit (Included)
    const MosqueSquareAct = await upsertActivity({
      name: 'Al-Hussein Mosque & Square Visit',
      type: 'tour',
      provider: cairoTopTours._id,
      price: 0,
      description: "Arrive at the beating heart of Islamic Cairo. Explore the revered Al-Hussein Mosque and its vibrant surrounding square, soaking in the deeply historic and spiritual atmosphere of the area.",
      image: '/al_hussein_mosque_interior.png'
    });

    // Activity 2: Al-Muizz Walk (850 EGP)
    const AlMuizzWalkAct = await upsertActivity({
      name: 'Al-Muizz Street Open-Air Museum Walk',
      type: 'tour',
      provider: cairoTopTours._id,
      price: 850,
      description: "Guided walk through Al-Muizz li-Din Allah Street — the world's largest open-air museum of Islamic architecture. Discover 1,000 years of history through ornate gates, majestic palaces, and medieval sultans' monuments from Bab El Futuh to Bab Zuweila.",
      image: '/al_muizz_minarets_night.png'
    });

    // Activity 3: Khan El Khalili Coffee Stop (Included)
    const KhanKhaliliAct = await upsertActivity({
      name: 'Khan El Khalili Bazaar & Traditional Coffee House',
      type: 'food',
      provider: elFishawyProvider._id,
      price: 0,
      description: "Dive into the winding, crowded alleyways of Cairo's most famous historic market. Enjoy free time for souvenir shopping followed by a relaxing stop for traditional refreshments at the legendary El Fishawy Cafe.",
      image: '/khan_khalili_bazaar.png'
    });

    const alHusseinExpName = 'Al-Hussein Mosque & Al-Muizz Street Heritage Walk';
    let alHusseinExp = await Experience.findOne({ name: alHusseinExpName });
    if (alHusseinExp) {
      await Experience.deleteOne({ _id: alHusseinExp._id });
      await PackingGuide.deleteOne({ experience: alHusseinExp._id });
      console.log("Deleted existing Al-Hussein experience.");
    }

    alHusseinExp = new Experience({
      name: alHusseinExpName,
      type: 'Package',
      description: "A 5-hour cultural immersion into the heart of Islamic Cairo — from the revered Al-Hussein Mosque and its vibrant square, through 1,000 years of Fatimid architecture along Al-Muizz Street, ending with a traditional coffee stop at the legendary El Fishawy Cafe in Khan El Khalili.",
      duration_days: 1,
      price: 850,
      capacity: 20,
      destination: cairoDest._id,
      availableDates: [
        { date: new Date('2026-06-15'), availableSeats: 20 },
        { date: new Date('2026-06-22'), availableSeats: 20 },
        { date: new Date('2026-07-06'), availableSeats: 20 },
        { date: new Date('2026-07-20'), availableSeats: 20 }
      ],
      priceBreakdown: [
        { label: 'Al-Hussein & Al-Muizz Guided Heritage Walk (incl. guide & mosque entry)', amount: 850 }
      ],
      image: '/al_muizz_minarets_night.png',
      images: [
        '/al_muizz_minarets_night.png',
        '/al_hussein_mosque_interior.png',
        '/al_muizz_architecture.jpg',
        '/khan_khalili_bazaar.png',
        '/khan_khalili_alley.png',
        '/khan_khalili_shop.png'
      ],
      included: [
        'Licensed professional tour guide',
        'Al-Hussein Mosque & square guided visit',
        'Al-Muizz Street open-air museum walk (Bab El Futuh to Bab Zuweila)',
        'Traditional coffee stop at El Fishawy Cafe in Khan El Khalili'
      ],
      excluded: [
        'Transportation to/from Islamic Cairo',
        'Lunch',
        'Shopping at the bazaars (out of pocket)'
      ],
      itinerary: [
        {
          day_number: 1,
          title: 'Islamic Cairo — Mosques, Minarets & Medieval Streets',
          image: '/al_muizz_minarets_night.png',
          description: "Begin at Al-Hussein Mosque at 9:30 AM, walk Al-Muizz Street from Bab El Futuh to Bab Zuweila, and finish with a traditional coffee stop in the lively Khan El Khalili bazaar.",
          activities: [
            { activity: MosqueSquareAct._id, provider: cairoTopTours._id, price: 0, image: '/al_hussein_mosque_interior.png' },
            { activity: AlMuizzWalkAct._id, provider: cairoTopTours._id, price: 850, image: '/al_muizz_minarets_night.png' },
            { activity: KhanKhaliliAct._id, provider: elFishawyProvider._id, price: 0, image: '/khan_khalili_bazaar.png' }
          ]
        }
      ]
    });

    await alHusseinExp.save();
    console.log("Successfully created: Al-Hussein Mosque & Al-Muizz Street Heritage Walk!");

    const alHusseinPackingGuide = new PackingGuide({
      name: 'Al-Hussein & Al-Muizz Heritage Walk Packing Guide',
      activityType: 'cultural',
      experience: alHusseinExp._id,
      destination: cairoDest._id,
      essentials: [
        { item: 'Water bottle (2L)', icon: '💧', required: true },
        { item: 'Sunscreen SPF 50+', icon: '🌞', required: true },
        { item: 'Hat or headscarf', icon: '🧢', required: true },
        { item: 'Cash (EGP) for bazaar stops', icon: '💵', required: true },
        { item: 'Comfortable backpack', icon: '🎒', required: false }
      ],
      clothing: [
        { item: 'Modest clothing (shoulders & knees covered)', notes: 'Required for mosque entry — strictly enforced' },
        { item: 'Comfortable flat closed-toe shoes that slip off easily', notes: 'You will need to remove shoes before entering mosques' },
        { item: 'Headscarf for women', notes: 'Required for entering Al-Hussein Mosque' }
      ],
      safetyTips: [
        { tip: 'Remove shoes before entering any mosque — have slip-on shoes for easy removal', severity: 'warning' },
        { tip: 'Never leave the group without informing your guide', severity: 'warning' },
        { tip: 'Beware of motorbikes in the narrow lanes of Islamic Cairo', severity: 'danger' },
        { tip: 'Keep valuables close — pickpocket risk in the crowded bazaar', severity: 'danger' },
        { tip: 'Respect religious customs and avoid loud behaviour near the mosque', severity: 'info' }
      ],
      emergencyContacts: {
        police: '122',
        ambulance: '123',
        coastGuard: '16666',
        localHospital: 'Dar Al Fouad Hospital: +20 2 3827 1000'
      },
      difficultyLevel: 'moderate',
      physicalRequirements: 'Walking 4–5 km on cobblestone streets and narrow historic lanes with some uneven terrain.',
      weatherWarnings: [
        'Islamic Cairo streets are mostly open-air. Avoid midday heat in summer — tour starts at 9:30 AM.',
        'Apply sunscreen and wear a hat — limited shade along Al-Muizz Street.'
      ]
    });

    await alHusseinPackingGuide.save();
    alHusseinExp.packingGuide = alHusseinPackingGuide._id;
    await alHusseinExp.save();
    console.log("Packing Guide linked to Al-Hussein Heritage Walk!");

    console.log("\n✅ All Day Use packages seeded successfully!");

  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedDayuseCairo();
