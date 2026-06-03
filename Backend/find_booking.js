import mongoose from 'mongoose';
import { Booking } from './src/db/models/booking.model.js';
import { CustomTrip } from './src/db/models/customtrip.model.js';
import { Experience } from './src/db/models/experience.model.js';
import { User } from './src/db/models/user.model.js';
import { Coupon } from './src/db/models/coupon.model.js';
import { Activity } from './src/db/models/activity.model.js';
import { Provider } from './src/db/models/provider.model.js';
import { devConfig } from './src/config/env/dev.config.js';
import { calculateBookingTotal } from './src/utils/pricingHelper.js';

async function find() {
  await mongoose.connect(devConfig.DB_URL);
  console.log("Connected to MongoDB.");

  const bookings = await Booking.find({});
  for (const b of bookings) {
    const shortId = b._id.toString().slice(-6).toUpperCase();
    if (shortId === 'F38AD2' || shortId === 'F38AE3') {
      console.log(`Found matching booking: ${b._id}`);
      console.log(`  Experience: ${b.experience}`);
      console.log(`  CustomTrip: ${b.customTrip}`);
      console.log(`  total_amount: ${b.total_amount}`);
      console.log(`  sequentialBookings:`, b.sequentialBookings);
      console.log(`  parentBooking:`, b.parentBooking);
      
      const pricing = await calculateBookingTotal(b._id);
      console.log(`  pricingHelper Output:`, JSON.stringify(pricing, null, 2));

      if (b.customTrip) {
        const trip = await CustomTrip.findById(b.customTrip)
          .populate('experience')
          .populate('combinedExperiences')
          .populate('itinerary.activities.activity')
          .populate('extra_activities.activity');
        console.log(`  CustomTrip basePrice:`, trip.experience?.price);
        console.log(`  CustomTrip combinedExperiences count:`, trip.combinedExperiences?.length);
        if (trip.combinedExperiences) {
          trip.combinedExperiences.forEach(c => {
            console.log(`    - Combined Exp Price: ${c.price} (${c.name})`);
          });
        }
        console.log(`  CustomTrip Itinerary Days:`);
        trip.itinerary.forEach(d => {
          console.log(`    Day ${d.day_number}: status=${d.status}`);
          d.activities.forEach(a => {
            console.log(`      - Activity: ${a.activity?.name || a.name}, price=${a.price}, status=${a.status}`);
          });
        });
      }
    }
  }

  process.exit(0);
}

find().catch(console.error);
