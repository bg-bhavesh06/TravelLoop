/**
 * Migration Script: Local MongoDB → MongoDB Atlas
 * Run: node server/utils/migrateToAtlas.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { MongoClient } = require('mongodb');

const LOCAL_URI = 'mongodb://localhost:27017/traveloop';
const ATLAS_URI = process.env.MONGO_URI;

async function migrate() {
  let localClient, atlasClient;

  try {
    console.log('🔌 Connecting to local MongoDB...');
    localClient = new MongoClient(LOCAL_URI);
    await localClient.connect();
    const localDb = localClient.db('traveloop');

    console.log('🔌 Connecting to MongoDB Atlas...');
    atlasClient = new MongoClient(ATLAS_URI, { tls: true });
    await atlasClient.connect();
    const atlasDb = atlasClient.db('traveloop');

    // Get all collections from local DB
    const collections = await localDb.listCollections().toArray();
    console.log(`\n📦 Found ${collections.length} collections: ${collections.map(c => c.name).join(', ')}\n`);

    for (const col of collections) {
      const collectionName = col.name;
      const localCollection = localDb.collection(collectionName);
      const atlasCollection = atlasDb.collection(collectionName);

      const docs = await localCollection.find({}).toArray();

      if (docs.length === 0) {
        console.log(`⚠️  ${collectionName}: empty, skipping.`);
        continue;
      }

      // Drop existing atlas collection data to avoid duplicates
      await atlasCollection.deleteMany({});

      const result = await atlasCollection.insertMany(docs);
      console.log(`✅ ${collectionName}: migrated ${result.insertedCount} / ${docs.length} documents.`);
    }

    console.log('\n🎉 Migration complete! All data is now in MongoDB Atlas.');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    if (localClient) await localClient.close();
    if (atlasClient) await atlasClient.close();
  }
}

migrate();
