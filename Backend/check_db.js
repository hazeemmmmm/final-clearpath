import mongoose from 'mongoose';
import { Booking } from './src/db/models/booking.model.js';

const mongooseUri = 'mongodb://127.0.0.1:27017/clearpath';

async function check() {
  await mongoose.connect(mongooseUri);
  console.log("Connected to MongoDB.");
  
  const bookings = await Booking.find({});
  console.log(`Total bookings in DB: ${bookings.length}`);
  
  bookings.forEach(b => {
    console.log(`\n- Booking ID: ${b._id}`);
    console.log(`  Experience ID: ${b.experience}`);
    console.log(`  CustomTrip ID: ${b.customTrip}`);
    console.log(`  Status: ${b.status}, Total Amount: ${b.total_amount}`);
    console.log(`  Parent Booking: ${b.parentBooking}`);
    console.log(`  Sequential Bookings:`, b.sequentialBookings);
    console.log(`  Snapshot Title:`, b.snapshot?.title);
  });

  process.exit(0);
}

check().catch(console.error);
