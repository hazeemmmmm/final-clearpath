import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'src/config/env/dev.env') });

const seedWhiteDesert = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('DB Connected');

    const { Destination } = await import('./src/db/models/destination.model.js');
    const { Provider } = await import('./src/db/models/provider.model.js');
    const { Activity } = await import('./src/db/models/activity.model.js');
    const { Experience } = await import('./src/db/models/experience.model.js');
    const { PackingGuide } = await import('./src/db/models/packingguide.model.js');

    // 1. Get or Create Destination
    let dest = await Destination.findOne({ name: 'Bahariya Oasis' });
    if (!dest) {
      dest = await Destination.create({
        name: 'Bahariya Oasis',
        country: 'Egypt',
        description: 'The gateway to the Black and White Desert, offering incredible camping and stargazing experiences.',
        image: 'https://images.unsplash.com/photo-1549416878-b9ca95e26903?auto=format&fit=crop&w=800&q=80'
      });
    }

    // 2. Get or Create Provider
    let provider = await Provider.findOne({ name: 'Desert Nomads Team' });
    if (!provider) {
      provider = await Provider.create({
        name: 'Desert Nomads Team',
        type: 'TourOperator',
        contact_email: 'nomads@desert.com',
        rating: 4.9,
      });
    }

    // 3. Create Specific Activities for this Trip
    const act1 = await Activity.create({
      name: 'Cairo to Bahariya Transfer',
      type: 'tour',
      destination: dest._id,
      price: 0,
      duration: 4,
      provider: provider._id,
      description: 'Private A/C vehicle transfer from Cairo to Bahariya Oasis.'
    });

    const act2 = await Activity.create({
      name: 'Black Desert & Crystal Mountain Safari',
      type: 'hiking',
      destination: dest._id,
      price: 50,
      duration: 4,
      provider: provider._id,
      description: '4x4 Safari through the Black Desert and visiting the famous Crystal Mountain.'
    });

    const act3 = await Activity.create({
      name: 'White Desert Camping & Bedouin Dinner',
      type: 'hotel',
      destination: dest._id,
      price: 100,
      duration: 12,
      provider: provider._id,
      description: 'Setting up camp among the white rock formations, enjoying a traditional campfire dinner.'
    });

    const act4 = await Activity.create({
      name: 'Morning Sandboarding',
      type: 'entertainment',
      destination: dest._id,
      price: 30,
      duration: 2,
      provider: provider._id,
      description: 'Thrilling sandboarding experience on the golden dunes.'
    });

    const act5 = await Activity.create({
      name: 'Agabat Valley & Hot Springs',
      type: 'tour',
      destination: dest._id,
      price: 40,
      duration: 3,
      provider: provider._id,
      description: 'Exploring the breathtaking Agabat Valley and relaxing in natural hot springs.'
    });

    const act6 = await Activity.create({
      name: 'Astrotourism & Stargazing',
      type: 'entertainment',
      destination: dest._id,
      price: 30,
      duration: 2,
      provider: provider._id,
      description: 'Guided stargazing session with local Bedouin stories.'
    });

    const act7 = await Activity.create({
      name: 'Return Transfer to Cairo',
      type: 'tour',
      destination: dest._id,
      price: 0,
      duration: 4,
      provider: provider._id,
      description: 'Safe return journey to your hotel or airport in Cairo.'
    });

    // 4. Create the Complete Experience Package
    const newTrip = await Experience.create({
      name: 'مغامرة الصحراء البيضاء والواحات البحرية (الجوهرة الخفية)',
      type: 'Trip',
      duration_days: 3,
      base_price: 250,
      destination: dest._id,
      capacity: 12,
      description: 'استكشف سحر الصحراء البيضاء وتشكيلاتها الصخرية الفريدة. تجربة بعيدة عن الزحام التجاري، مصممة خصيصاً لمحبي الطبيعة والتأمل تحت النجوم مع مرشدين محليين معتمدين.',
      image: 'https://images.unsplash.com/photo-1629807460599-281b37dd1e6f?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1629807460599-281b37dd1e6f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1549416878-b9ca95e26903?auto=format&fit=crop&w=800&q=80'
      ],
      addons: [
        {
          name: 'إضافة مصور فوتوغرافي محترف للرحلة',
          price: 50,
          description: 'توثيق أجمل لحظاتك وسط الصحراء البيضاء بأعلى جودة.'
        },
        {
          name: 'ترقية الوجبات لتشمل خيارات نباتية/خالية من الجلوتين',
          price: 0,
          description: 'نلتزم بتقديم خيارات طعام تتناسب مع نظامك الغذائي.'
        }
      ],
      itinerary: [
        {
          day_number: 1,
          title: 'اليوم الأول: الانطلاق نحو الواحات',
          description: 'رحلة من العاصمة إلى هدوء الصحراء، والبدء في استكشاف المعالم الجيولوجية الرائعة.',
          activities: [
            { activity: act1._id, provider: provider._id, price: act1.price },
            { activity: act2._id, provider: provider._id, price: act2.price },
            { activity: act3._id, provider: provider._id, price: act3.price }
          ]
        },
        {
          day_number: 2,
          title: 'اليوم الثاني: الاستكشاف العميق',
          description: 'يوم حافل بالمغامرات من التزلج على الرمال حتى الاسترخاء في العيون الساخنة والتأمل الفلكي.',
          activities: [
            { activity: act4._id, provider: provider._id, price: act4.price },
            { activity: act5._id, provider: provider._id, price: act5.price },
            { activity: act6._id, provider: provider._id, price: act6.price }
          ]
        },
        {
          day_number: 3,
          title: 'اليوم الثالث: العودة',
          description: 'جمع المخيم وتناول فطور خفيف قبل العودة بسلام إلى القاهرة.',
          activities: [
            { activity: act7._id, provider: provider._id, price: act7.price }
          ]
        }
      ]
    });

    // 5. Create Packing Guide for this specific trip
    await PackingGuide.create({
      name: 'دليل سفاري الصحراء البيضاء',
      activityType: 'desert',
      experience: newTrip._id,
      destination: dest._id,
      difficultyLevel: 'moderate',
      physicalRequirements: 'يجب أن يكون المسافر قادراً على المشي الخفيف وتحمل طقس الصحراء.',
      essentials: [
        { item: 'نظارات شمسية قوية', required: true, icon: '🕶️' },
        { item: 'واقي شمس (Sunblock)', required: true, icon: '☀️' },
        { item: 'زجاجة مياه قابلة لإعادة الاستخدام', required: true, icon: '💧' }
      ],
      clothing: [
        { item: 'حذاء مشي مريح (Trekking Shoes)', notes: 'مهم جداً للمشي على الصخور.' },
        { item: 'ملابس ثقيلة لليل', notes: 'الصحراء شديدة البرودة ليلاً.' },
        { item: 'ملابس قطنية خفيفة للنهار', notes: 'لتجنب حرارة الشمس.' }
      ],
      safetyTips: [
        { tip: 'سيارات الدفع الرباعي مجهزة بأجهزة تتبع GPS للسلامة.', severity: 'info' },
        { tip: 'يوجد حقيبة إسعافات أولية متكاملة مع المرشد في كل سيارة.', severity: 'info' },
        { tip: 'يجب عدم الابتعاد عن المخيم ليلاً بدون إبلاغ المرشد.', severity: 'warning' }
      ],
      emergencyContacts: {
        police: '122',
        ambulance: '123',
        localHospital: 'مستشفى الواحات البحرية العام: 0238472010'
      }
    });

    console.log('✅ Successfully seeded the White Desert Package!');
    process.exit(0);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedWhiteDesert();
