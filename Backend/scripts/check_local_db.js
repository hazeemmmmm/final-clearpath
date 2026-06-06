import mongoose from 'mongoose';

const DB_URL = "mongodb://127.0.0.1:27017/clearpath";

async function check() {
  try {
    await mongoose.connect(DB_URL);
    console.log('Connected to local DB successfully.');
    
    // List all databases
    const adminDb = mongoose.connection.db.admin();
    const dbsInfo = await adminDb.listDatabases();
    console.log('\n--- All Databases on MongoDB ---');
    console.log(dbsInfo.databases.map(d => `${d.name} (${(d.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`));

    // Print collections in current database (clearpath)
    console.log('\n--- Current Database: clearpath Collections ---');
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const coll of collections) {
      const count = await mongoose.connection.db.collection(coll.name).countDocuments();
      console.log(`Collection "${coll.name}": ${count} documents`);
    }

    // Print users in clearpath
    console.log('\n--- Users in clearpath database ---');
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`Total users found: ${users.length}`);
    users.forEach(u => {
      console.log(`- Name: ${u.name || u.username}, Email: ${u.email}, Role: ${u.role}`);
    });
  } catch (err) {
    console.error('Error connecting/querying database:', err);
  } finally {
    mongoose.connection.close();
  }
}

check();
