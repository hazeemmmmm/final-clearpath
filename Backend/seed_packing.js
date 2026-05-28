import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'src/config/env/dev.env') });

await mongoose.connect(process.env.DB_URL);
const { PackingGuide } = await import('./src/db/models/packingguide.model.js');

const guides = [
  {
    name: 'Scuba Diving & Snorkeling Guide',
    activityType: 'diving',
    essentials: [
      { item: 'Reef-safe sunscreen (SPF 50+)', icon: '🌞', required: true },
      { item: 'Underwater camera or GoPro', icon: '📷', required: false },
      { item: 'Water bottle (2L minimum)', icon: '💧', required: true },
      { item: 'Seasickness medication', icon: '💊', required: false },
      { item: 'Towel & dry bag', icon: '🎒', required: true },
      { item: 'Cash for tips (USD preferred)', icon: '💵', required: true },
    ],
    clothing: [
      { item: 'Rash guard / UV shirt', notes: 'Protects against jellyfish and UV' },
      { item: 'Water shoes', notes: 'Protect feet on rocky beaches' },
      { item: 'Swimwear (2 sets)', notes: 'Always have a dry spare' },
      { item: 'Light cover-up or sarong', notes: 'For moving between dive sites' },
    ],
    safetyTips: [
      { tip: 'Never dive alone — always use the buddy system', severity: 'danger' },
      { tip: 'Check your equipment before every dive', severity: 'warning' },
      { tip: 'Do not touch coral — it is a living organism and can cause cuts', severity: 'warning' },
      { tip: 'Stay hydrated — dehydration increases decompression sickness risk', severity: 'info' },
      { tip: 'Descend slowly and equalize pressure every 1–2 meters', severity: 'info' },
      { tip: 'Do not fly within 24 hours after diving', severity: 'danger' },
    ],
    emergencyContacts: {
      police: '122', ambulance: '123', coastGuard: '16666',
      localHospital: 'Hurghada International Hospital: +20 65 354 9450',
    },
    difficultyLevel: 'moderate',
    physicalRequirements: 'Basic swimming ability required. Medical clearance needed for scuba.',
    weatherWarnings: [
      'Avoid diving in winds above 25 knots — sea conditions become unsafe',
      'Jellyfish swarms occur between April and June',
    ],
  },

  {
    name: 'Mountain & Desert Hiking Guide',
    activityType: 'hiking',
    essentials: [
      { item: 'Water (minimum 3–4L per day)', icon: '💧', required: true },
      { item: 'High-energy snacks (nuts, dates, protein bars)', icon: '🥜', required: true },
      { item: 'Headlamp with spare batteries', icon: '🔦', required: true },
      { item: 'First aid kit', icon: '🩹', required: true },
      { item: 'Sunscreen SPF 50+ and lip balm', icon: '🌞', required: true },
      { item: 'Trekking poles (optional)', icon: '🥾', required: false },
      { item: 'Power bank', icon: '🔋', required: false },
      { item: 'Personal medication', icon: '💊', required: true },
    ],
    clothing: [
      { item: 'Closed-toe hiking boots', notes: 'Ankle support essential on rocky terrain' },
      { item: 'Moisture-wicking socks (2–3 pairs)', notes: 'Wool or synthetic, never cotton' },
      { item: 'Long-sleeve sun shirt', notes: 'Protects from UV on exposed trails' },
      { item: 'Light fleece or jacket', notes: 'Sinai nights are very cold even in summer' },
      { item: 'Wide-brim hat', notes: 'Essential for sun protection' },
      { item: 'Buff / scarf', notes: 'Protects from sand and wind' },
    ],
    safetyTips: [
      { tip: 'Always hike with a certified local Bedouin guide', severity: 'danger' },
      { tip: 'Inform someone of your planned route and expected return time', severity: 'warning' },
      { tip: 'Turn back if you feel exhausted — summit fever kills', severity: 'danger' },
      { tip: 'Start early to avoid midday heat (peak hike: 4am–8am)', severity: 'warning' },
      { tip: 'Watch for loose rocks on descents — most falls happen going down', severity: 'warning' },
      { tip: 'Respect local Bedouin sites and do not litter', severity: 'info' },
    ],
    emergencyContacts: {
      police: '122', ambulance: '123', coastGuard: '16666',
      localHospital: 'Saint Catherine Hospital: +20 69 347 0368',
    },
    difficultyLevel: 'challenging',
    physicalRequirements: 'Good physical fitness required. Not suitable for people with knee or heart conditions.',
    weatherWarnings: [
      'Flash floods can occur in wadis during winter rain — avoid low areas',
      'Temperature can drop below 0°C at night on Sinai summits',
      'Sandstorms are common in spring (March–May)',
    ],
  },

  {
    name: 'Desert Safari & Camel Riding Guide',
    activityType: 'desert',
    essentials: [
      { item: 'Water (minimum 3L per day)', icon: '💧', required: true },
      { item: 'Sunscreen SPF 50+', icon: '🌞', required: true },
      { item: 'Sunglasses (polarized preferred)', icon: '🕶️', required: true },
      { item: 'Cash for Bedouin tea tips', icon: '💵', required: false },
      { item: 'Insect repellent', icon: '🦟', required: true },
      { item: 'Camera with extra battery', icon: '📷', required: false },
    ],
    clothing: [
      { item: 'Loose long-sleeve shirt', notes: 'Protects from sun and sand abrasion' },
      { item: 'Long lightweight trousers', notes: 'Never shorts — sand rash is painful' },
      { item: 'Closed-toe shoes or boots', notes: 'Sandals allow sand in — avoid them' },
      { item: 'Wide-brim hat or keffiyeh', notes: 'Essential for desert sun protection' },
      { item: 'Warm layer / jacket', notes: 'Desert nights drop below 10°C in winter' },
    ],
    safetyTips: [
      { tip: 'Never wander away from the group or guide in open desert', severity: 'danger' },
      { tip: 'Camel riding — hold the saddle horn during sit-down and stand-up — it is the moment falls happen', severity: 'warning' },
      { tip: 'Avoid touching desert wildlife — scorpions hide under rocks', severity: 'danger' },
      { tip: 'Drink water even if you do not feel thirsty — desert air masks dehydration', severity: 'warning' },
      { tip: 'Sand storms: cover nose/mouth with cloth and stay low', severity: 'info' },
    ],
    emergencyContacts: {
      police: '122', ambulance: '123', coastGuard: '16666',
      localHospital: 'Nearest major hospital varies by location — confirm with guide',
    },
    difficultyLevel: 'easy',
    physicalRequirements: 'Suitable for all fitness levels. Camel riding requires ability to mount/dismount (height ~2m).',
    weatherWarnings: [
      'Summer temperatures can exceed 45°C — schedule activities before 10am and after 4pm',
      'Spring sandstorms (khamsin) can reduce visibility to near zero',
    ],
  },

  {
    name: 'Beach & Water Sports Day Guide',
    activityType: 'beach',
    essentials: [
      { item: 'Reef-safe sunscreen (SPF 50+)', icon: '🌞', required: true },
      { item: 'Water bottle (stay hydrated)', icon: '💧', required: true },
      { item: 'Waterproof phone case', icon: '📱', required: false },
      { item: 'Cash for beach extras', icon: '💵', required: false },
      { item: 'Towel & dry bag', icon: '🎒', required: true },
    ],
    clothing: [
      { item: 'Swimwear (bring a spare set)', notes: 'Wet swimwear is uncomfortable after hours' },
      { item: 'Rash guard / UV shirt', notes: 'Long hours on water intensify UV exposure' },
      { item: 'Water shoes', notes: 'Sea urchins and sharp rocks are common near reefs' },
      { item: 'Light cover-up', notes: 'For lunch breaks and moving between areas' },
      { item: 'Sunglasses', notes: 'Polarized to reduce sea glare' },
    ],
    safetyTips: [
      { tip: 'Always swim in designated areas and obey flags (Red = No swimming)', severity: 'danger' },
      { tip: 'Apply and reapply sunscreen every 2 hours — especially after swimming', severity: 'warning' },
      { tip: 'Do not swim alone, especially in open water or during water sports', severity: 'warning' },
      { tip: 'Inform the water sports operator of any medical conditions before activities', severity: 'info' },
      { tip: 'Sea urchin sting: soak in hot water, do not break the spines', severity: 'info' },
    ],
    emergencyContacts: {
      police: '122', ambulance: '123', coastGuard: '16666',
      localHospital: 'Ask your resort — most have on-site medical staff',
    },
    difficultyLevel: 'easy',
    physicalRequirements: 'Suitable for all ages. Water sports require basic swimming ability.',
    weatherWarnings: [
      'Jellyfish warnings are posted at beaches — check daily resort notifications',
      'Strong winds in the afternoon can make water sports dangerous',
    ],
  },

  {
    name: 'Cultural & Historical Sites Guide',
    activityType: 'cultural',
    essentials: [
      { item: 'Water bottle (1–2L)', icon: '💧', required: true },
      { item: 'Sunscreen SPF 50+', icon: '🌞', required: true },
      { item: 'Comfortable walking shoes', icon: '👟', required: true },
      { item: 'Camera', icon: '📷', required: false },
      { item: 'Small cash for tips and souvenirs', icon: '💵', required: true },
      { item: 'Printed/digital booking confirmation', icon: '🎫', required: true },
    ],
    clothing: [
      { item: 'Modest clothing (cover shoulders and knees)', notes: 'Required for mosques, churches, and many sites' },
      { item: 'Comfortable flat shoes', notes: 'Sites involve extensive walking on uneven surfaces' },
      { item: 'Light scarf or shawl', notes: 'Women may need to cover hair in religious sites' },
      { item: 'Hat and sunglasses', notes: 'Much of the walking is exposed to sun' },
    ],
    safetyTips: [
      { tip: 'Only accept services from licensed, ID-carrying guides and vendors', severity: 'warning' },
      { tip: 'Secure valuables — crowded tourist sites attract pickpockets', severity: 'warning' },
      { tip: 'Photography rules vary — always ask before photographing locals or restricted areas', severity: 'info' },
      { tip: 'Do not accept unsolicited "free" gifts — a payment will be demanded', severity: 'warning' },
      { tip: 'Haggling is expected at bazaars — start at 40% of the asking price', severity: 'info' },
    ],
    emergencyContacts: {
      police: '122', ambulance: '123', coastGuard: '16666',
      localHospital: 'Cairo: Dar Al Fouad Hospital +20 2 3827 1000',
    },
    difficultyLevel: 'easy',
    physicalRequirements: 'Walking distances of 3–8km typical. Good footwear essential.',
    weatherWarnings: [
      'Cairo summer temperatures exceed 40°C — book early morning tours',
      'Avoid visiting open-air sites midday (12pm–3pm) in summer',
    ],
  },

  {
    name: 'Wellness & Spa Retreat Guide',
    activityType: 'wellness',
    essentials: [
      { item: 'Comfortable loungewear', icon: '🧘', required: true },
      { item: 'Water bottle', icon: '💧', required: true },
      { item: 'Personal toiletries', icon: '🧴', required: false },
      { item: 'Open mind for new practices', icon: '✨', required: true },
    ],
    clothing: [
      { item: 'Loose, breathable yoga/exercise wear', notes: 'Avoid tight synthetic fabrics' },
      { item: 'Light jacket for early morning sessions', notes: 'Sunrise yoga can be chilly' },
      { item: 'Flip-flops or sandals', notes: 'For moving between areas' },
    ],
    safetyTips: [
      { tip: 'Inform instructors of any injuries or health conditions before sessions', severity: 'warning' },
      { tip: 'Do not practice intensive yoga within 2 hours of a large meal', severity: 'info' },
      { tip: 'Stay hydrated throughout wellness activities', severity: 'info' },
      { tip: 'Respect the quiet nature of wellness spaces — silence is part of the experience', severity: 'info' },
    ],
    emergencyContacts: {
      police: '122', ambulance: '123', coastGuard: '16666',
      localHospital: 'Your resort will have medical staff available on-site',
    },
    difficultyLevel: 'easy',
    physicalRequirements: 'Suitable for all levels. Modifications available for all yoga poses.',
    weatherWarnings: [],
  },

  {
    name: 'General Travel Guide (Egypt)',
    activityType: 'general',
    essentials: [
      { item: 'Valid passport + visa documents', icon: '🛂', required: true },
      { item: 'Travel insurance documents', icon: '📋', required: true },
      { item: 'Sunscreen SPF 50+', icon: '🌞', required: true },
      { item: 'Water bottle', icon: '💧', required: true },
      { item: 'Egyptian pounds (EGP) cash', icon: '💵', required: true },
      { item: 'Universal power adapter', icon: '🔌', required: true },
      { item: 'Personal medication with prescription copy', icon: '💊', required: true },
    ],
    clothing: [
      { item: 'Modest clothing overall', notes: 'Egypt is a conservative country — cover shoulders and knees' },
      { item: 'Comfortable walking shoes', notes: 'Essential for most activities' },
      { item: 'Light jacket or cardigan', notes: 'For air-conditioned restaurants and transport' },
    ],
    safetyTips: [
      { tip: 'Drink bottled water only — tap water is not safe for tourists', severity: 'danger' },
      { tip: 'Use licensed taxis or ride-hailing apps (Uber/Careem) only', severity: 'warning' },
      { tip: 'Keep a copy of your passport in a separate location from the original', severity: 'info' },
      { tip: 'Register with your embassy upon arrival for long stays', severity: 'info' },
      { tip: 'Currency exchange: use official banks or hotel exchange — not street dealers', severity: 'warning' },
    ],
    emergencyContacts: {
      police: '122', ambulance: '123', coastGuard: '16666',
      localHospital: 'Cairo: As-Salam International Hospital +20 2 2524 0250',
    },
    difficultyLevel: 'easy',
    physicalRequirements: 'No specific requirements.',
    weatherWarnings: [
      'Egypt summers (June–August) are extremely hot — plan outdoor activities for morning/evening',
      'Ramadan: many restaurants are closed during daylight hours',
    ],
  },
];

console.log('🌱 Seeding packing guides...');
let created = 0;
for (const g of guides) {
  const existing = await PackingGuide.findOne({ name: g.name });
  if (existing) {
    console.log(`   ⏭️  Exists: ${g.name}`);
    continue;
  }
  await PackingGuide.create(g);
  console.log(`   ✅ Created: ${g.name}`);
  created++;
}

console.log(`\n🎉 Done! Created ${created} packing guides.`);
await mongoose.disconnect();
