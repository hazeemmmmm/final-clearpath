import mongoose from 'mongoose';

async function migrate() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect('mongodb://127.0.0.1:27017/clearpath');
  console.log('Connected.');

  const db = mongoose.connection.db;
  const experiencesCollection = db.collection('experiences');

  // Let's find all documents
  const docs = await experiencesCollection.find({}).toArray();
  console.log(`Found ${docs.length} documents.`);

  let updatedCount = 0;
  for (const doc of docs) {
    const basePrice = doc.base_price || doc.price || 0;
    const finalPrice = doc.price || basePrice;

    // Update the document to ensure both price and base_price have the value, for full compatibility
    await experiencesCollection.updateOne(
      { _id: doc._id },
      { 
        $set: { 
          price: finalPrice,
          base_price: finalPrice 
        } 
      }
    );
    updatedCount++;
  }

  console.log(`Successfully migrated ${updatedCount} experiences.`);
  await mongoose.disconnect();
}

migrate().catch(console.error);
