import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'src/config/env/dev.env') });

await mongoose.connect(process.env.DB_URL);
const { Destination } = await import('./src/db/models/destination.model.js');

const junkIds = ['6a15bc97c6d0f5e3b6518b60', '6a15bcd4c6d0f5e3b6518ba4', '6a15dd5e021faaea9e532efe'];
const result = await Destination.deleteMany({ _id: { $in: junkIds } });
console.log('Deleted:', result.deletedCount, 'junk destinations');

const remaining = await Destination.find({}).sort({ name: 1 });
console.log('Clean destinations:');
remaining.forEach(d => console.log(`  - ${d.name} (${d._id})`));

await mongoose.disconnect();
console.log('Done!');
