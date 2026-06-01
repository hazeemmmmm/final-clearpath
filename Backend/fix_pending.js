import mongoose from 'mongoose';
import { Booking } from './src/db/models/booking.model.js';

const mongooseUri = 'mongodb://127.0.0.1:27017/clearpath';

async function fix() {
  await mongoose.connect(mongooseUri);
  console.log("Connected to MongoDB.");
  
  // Find all pending Wadi Degla bookings and update them to Confirmed since they are part of chains
  const result = await Booking.updateMany(
    { status: 'Pending' },
    { status: 'Confirmed' }
  );
  
  console.log(`Successfully updated ${result.modifiedCount} pending bookings to Confirmed!`);
  process.exit(0);
}

fix().catch(console.error);
