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

const mongoOptions = {
  maxPoolSize: 20,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  retryWrites: true,
  retryReads: true,
};

async function connectWithRetry(retries = 3, delay = 1000): Promise<MongoClient> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const mc = new MongoClient(uri, mongoOptions);
      const connected = await mc.connect();
      return connected;
    } catch (err: any) {
      if (attempt === retries) throw err;
      console.warn(`[MongoDB] Connection attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error('[MongoDB] Unable to connect after retries');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connectWithRetry();
  }
  clientPromise = global._mongoClientPromise;
} else {
  if (!client) {
    clientPromise = connectWithRetry();
  } else {
    clientPromise = Promise.resolve(client);
  }
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
    console.warn('Index check note:', err);
  }
}
