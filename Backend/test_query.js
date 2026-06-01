import mongoose from 'mongoose';
const mongooseUri = 'mongodb://127.0.0.1:27017/clearpath';

async function check() {
  await mongoose.connect(mongooseUri);
  const Experience = mongoose.model('Experience', new mongoose.Schema({}, { strict: false }), 'experiences');
  const e = await Experience.findById('6a1d88f9ed7278b571da469e').lean();
  console.log("Full Sokhna Experience:", JSON.stringify(e, null, 2));
  process.exit(0);
}

check().catch(console.error);
