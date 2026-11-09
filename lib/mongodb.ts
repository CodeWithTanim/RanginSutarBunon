import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || 'rangin-sutar-bunon';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  console.warn('⚠️ MONGODB_URI is not defined in environment variables. Database operations will fail.');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      maxPoolSize: 20,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  if (!client) {
    client = new MongoClient(uri, {
      maxPoolSize: 20,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
  }
  clientPromise = client.connect();
}

export default clientPromise;

export async function getMongoClient(): Promise<MongoClient> {
  return await clientPromise;
}

export async function getDb(): Promise<Db> {
  const c = await getMongoClient();
  return c.db(dbName);
}

let indexesEnsured = false;
export async function ensureIndexes(): Promise<void> {
  if (indexesEnsured) return;
  try {
    const db = await getDb();
    await Promise.all([
      db.collection('products').createIndex({ slug: 1 }, { unique: true, sparse: true }),
      db.collection('products').createIndex({ isActive: 1, isFeatured: 1 }),
      db.collection('products').createIndex({ categoryId: 1 }),
      db.collection('products').createIndex({ createdAt: -1 }),

      db.collection('categories').createIndex({ slug: 1 }, { unique: true, sparse: true }),
      db.collection('categories').createIndex({ name: 1 }),

      db.collection('orders').createIndex({ id: 1 }, { unique: true }),
      db.collection('orders').createIndex({ mobile: 1 }),
      db.collection('orders').createIndex({ createdAt: -1 }),

      db.collection('customers').createIndex({ mobile: 1 }, { unique: true, sparse: true }),

      db.collection('settings').createIndex({ key: 1 }, { unique: true }),

      db.collection('contact_messages').createIndex({ createdAt: -1 }),

      db.collection('users').createIndex({ username: 1 }, { unique: true, sparse: true }),
    ]);
    indexesEnsured = true;
  } catch (err) {
    // Continue even if index creation warning happens
    console.warn('Index check note:', err);
  }
}
