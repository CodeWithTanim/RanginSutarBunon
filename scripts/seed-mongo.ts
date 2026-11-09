import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  DEFAULT_SETTINGS,
} from '../lib/initialData';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'rangin-sutar-bunon';

if (!uri) {
  console.error('❌ MONGODB_URI not set in environment.');
  process.exit(1);
}

const client = new MongoClient(uri);

async function main() {
  console.log('🌱 Starting MongoDB seeding for Rangin Sutar Bunon...');
  await client.connect();
  const db = client.db(dbName);

  // 1. Seed Admin User (only if explicitly set in environment)
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminUsername && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await db.collection('users').updateOne(
      { username: adminUsername },
      {
        $set: {
          username: adminUsername,
          name: 'Store Manager',
          passwordHash,
          role: 'ADMIN',
          updatedAt: new Date().toISOString(),
        },
        $setOnInsert: {
          id: `user-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );
    console.log(`✅ Admin user seeded for username: "${adminUsername}"`);
  } else {
    console.log('ℹ️ Admin user seed skipped (no ADMIN_USERNAME/ADMIN_PASSWORD provided in .env)');
  }

  // 2. Seed Categories
  for (const cat of INITIAL_CATEGORIES) {
    await db.collection('categories').updateOne(
      { slug: cat.slug },
      { $set: { id: cat.id, name: cat.name, slug: cat.slug } },
      { upsert: true }
    );
  }
  console.log(`✅ ${INITIAL_CATEGORIES.length} Categories seeded.`);

  // 3. Seed Products
  for (const prod of INITIAL_PRODUCTS) {
    await db.collection('products').updateOne(
      { slug: prod.slug },
      {
        $set: {
          id: prod.id,
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          price: prod.price,
          discountPrice: prod.discountPrice,
          stock: prod.stock,
          categoryId: prod.categoryId,
          categoryName: prod.categoryName,
          categoryIds: prod.categoryIds,
          categoryNames: prod.categoryNames,
          imageUrl: prod.imageUrl,
          images: prod.images || [],
          isFeatured: prod.isFeatured,
          isActive: prod.isActive,
          createdAt: prod.createdAt,
        },
      },
      { upsert: true }
    );
  }
  console.log(`✅ ${INITIAL_PRODUCTS.length} Products seeded.`);

  // 4. Seed Settings
  const settingsOps = Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({
    updateOne: {
      filter: { key },
      update: {
        $set: {
          key,
          value: String(value),
          updatedAt: new Date().toISOString(),
        },
      },
      upsert: true,
    },
  }));
  await db.collection('settings').bulkWrite(settingsOps);
  console.log('✅ Site settings seeded.');

  // 5. Create Indexes
  await Promise.all([
    db.collection('products').createIndex({ slug: 1 }, { unique: true, sparse: true }),
    db.collection('products').createIndex({ isActive: 1, isFeatured: 1 }),
    db.collection('products').createIndex({ categoryId: 1 }),
    db.collection('products').createIndex({ createdAt: -1 }),
    db.collection('categories').createIndex({ slug: 1 }, { unique: true, sparse: true }),
    db.collection('orders').createIndex({ id: 1 }, { unique: true }),
    db.collection('orders').createIndex({ mobile: 1 }),
    db.collection('orders').createIndex({ createdAt: -1 }),
    db.collection('customers').createIndex({ mobile: 1 }, { unique: true, sparse: true }),
    db.collection('settings').createIndex({ key: 1 }, { unique: true }),
    db.collection('users').createIndex({ username: 1 }, { unique: true, sparse: true }),
  ]);
  console.log('✅ MongoDB indexes configured for blazing fast performance.');

  console.log('✨ All seeding completed successfully!');
}

main()
  .catch((err) => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await client.close();
  });
