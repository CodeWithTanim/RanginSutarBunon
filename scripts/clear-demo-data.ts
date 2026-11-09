import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'rangin-sutar-bunon';

if (!uri) {
  console.error('❌ MONGODB_URI not found.');
  process.exit(1);
}

const client = new MongoClient(uri);

async function clearData() {
  await client.connect();
  const db = client.db(dbName);

  const resProds = await db.collection('products').deleteMany({});
  const resCats = await db.collection('categories').deleteMany({});
  const resOrders = await db.collection('orders').deleteMany({});
  const resCusts = await db.collection('customers').deleteMany({});
  const resMsgs = await db.collection('contact_messages').deleteMany({});

  console.log(`🧹 Cleared products: ${resProds.deletedCount}`);
  console.log(`🧹 Cleared categories: ${resCats.deletedCount}`);
  console.log(`🧹 Cleared orders: ${resOrders.deletedCount}`);
  console.log(`🧹 Cleared customers: ${resCusts.deletedCount}`);
  console.log(`🧹 Cleared contact messages: ${resMsgs.deletedCount}`);

  await client.close();
  console.log('✅ All demo data completely removed from MongoDB database!');
}

clearData().catch(console.error);

