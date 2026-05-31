const mongoose = require('mongoose');

const DB_URL = "mongodb+srv://alaamahmoudhussein186_db_user:CmkZRyTgPESdmgCq@cluster0.c2lajdn.mongodb.net/ClearPath?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
  await mongoose.connect(DB_URL);
  
  // List collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  
  // Get packages
  const experiences = await mongoose.connection.db.collection('experiences').find({}).toArray();
  console.log('Packages count:', experiences.length);
  experiences.forEach(e => {
    console.log(`- ${e.name} (${e.type}) [ID: ${e._id}]`);
  });
  
  mongoose.connection.close();
}
check();
