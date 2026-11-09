import * as dotenv from 'dotenv';
dotenv.config();

import { Client as PgClient } from 'pg';
import { MongoClient } from 'mongodb';

// Supabase PostgreSQL URL
const supabaseUrl =
  process.env.SUPABASE_DATABASE_URL ||
  process.env.DIRECT_URL ||
  "postgresql://postgres.lolljwugmxrkdulnfodq:h%40bib%40r%40ngin2018@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

// MongoDB URL & DB Name
const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB || 'rangin-sutar-bunon';

if (!mongoUri) {
  console.error('❌ MONGODB_URI is missing in .env');
  process.exit(1);
}

async function restore() {
  console.log('🔄 Connecting to Supabase PostgreSQL & MongoDB Atlas...');

  const pg = new PgClient({
    connectionString: supabaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  const mongo = new MongoClient(mongoUri!);

  try {
    await pg.connect();
    console.log('✅ Connected to Supabase PostgreSQL!');

    await mongo.connect();
    const db = mongo.db(mongoDbName);
    console.log(`✅ Connected to MongoDB Atlas (${mongoDbName})!`);

    // 1. Restore Categories
    const catsRes = await pg.query('SELECT * FROM "Category" ORDER BY name ASC');
    console.log(`📦 Found ${catsRes.rows.length} categories in Supabase.`);

    const categoryMap = new Map<string, string>();
    for (const c of catsRes.rows) {
      categoryMap.set(c.id, c.name);
      await db.collection('categories').updateOne(
        { id: c.id },
        {
          $set: {
            id: c.id,
            name: c.name,
            slug: c.slug,
          },
        },
        { upsert: true }
      );
    }
    console.log(`✅ Restored ${catsRes.rows.length} categories to MongoDB.`);

    // 2. Restore Products
    const prodsRes = await pg.query('SELECT * FROM "Product" ORDER BY "createdAt" DESC');
    console.log(`📦 Found ${prodsRes.rows.length} products in Supabase.`);

    for (const p of prodsRes.rows) {
      let catIds: string[] = [p.categoryId];
      try {
        if (p.images && typeof p.images === 'string' && p.images.startsWith('CAT:')) {
          catIds = JSON.parse(p.images.substring(4));
        }
      } catch {
        catIds = [p.categoryId];
      }

      if (!catIds.includes(p.categoryId)) {
        catIds.unshift(p.categoryId);
      }

      const categoryNames = catIds.map((cid) => categoryMap.get(cid) || 'General');
      const primaryCategoryName = categoryNames[0] || categoryMap.get(p.categoryId) || 'General';

      await db.collection('products').updateOne(
        { id: p.id },
        {
          $set: {
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description || '',
            price: Number(p.price),
            discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
            stock: Number(p.stock || 0),
            categoryId: p.categoryId,
            categoryName: primaryCategoryName,
            categoryIds: catIds,
            categoryNames: categoryNames,
            imageUrl: p.imageUrl,
            images: [],
            isFeatured: Boolean(p.isFeatured),
            isActive: Boolean(p.isActive),
            createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
          },
        },
        { upsert: true }
      );
    }
    console.log(`✅ Restored ${prodsRes.rows.length} products to MongoDB.`);

    // 3. Restore Settings
    const settingsRes = await pg.query('SELECT * FROM "Setting"');
    console.log(`📦 Found ${settingsRes.rows.length} settings in Supabase.`);
    for (const s of settingsRes.rows) {
      await db.collection('settings').updateOne(
        { key: s.key },
        {
          $set: {
            key: s.key,
            value: s.value,
            updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : new Date().toISOString(),
          },
        },
        { upsert: true }
      );
    }
    console.log(`✅ Restored ${settingsRes.rows.length} settings to MongoDB.`);

    // 4. Restore Users
    const usersRes = await pg.query('SELECT * FROM "User"');
    for (const u of usersRes.rows) {
      await db.collection('users').updateOne(
        { username: u.username },
        {
          $set: {
            id: u.id,
            username: u.username,
            name: u.name || 'Store Manager',
            passwordHash: u.passwordHash,
            role: u.role || 'ADMIN',
            updatedAt: u.updatedAt ? new Date(u.updatedAt).toISOString() : new Date().toISOString(),
          },
          $setOnInsert: {
            createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
          },
        },
        { upsert: true }
      );
    }
    console.log(`✅ Restored ${usersRes.rows.length} users to MongoDB.`);

    // 5. Restore Orders (if any exist)
    const ordersRes = await pg.query('SELECT * FROM "Order"');
    if (ordersRes.rows.length > 0) {
      const itemsRes = await pg.query('SELECT * FROM "OrderItem"');
      const itemsMap = new Map<string, any[]>();
      for (const item of itemsRes.rows) {
        if (!itemsMap.has(item.orderId)) itemsMap.set(item.orderId, []);
        itemsMap.get(item.orderId)!.push({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          quantity: Number(item.quantity),
          price: Number(item.price),
          total: Number(item.total),
        });
      }

      for (const o of ordersRes.rows) {
        await db.collection('orders').updateOne(
          { id: o.id },
          {
            $set: {
              id: o.id,
              customerName: o.customerName,
              mobile: o.mobile,
              address: o.address,
              city: o.city,
              state: o.state,
              pincode: o.pincode,
              note: o.note || null,
              subtotal: Number(o.subtotal),
              deliveryCharge: Number(o.deliveryCharge),
              totalAmount: Number(o.totalAmount),
              status: o.status,
              paymentMethod: o.paymentMethod || 'Cash on Delivery',
              createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
              updatedAt: o.updatedAt ? new Date(o.updatedAt).toISOString() : new Date().toISOString(),
              items: itemsMap.get(o.id) || [],
            },
          },
          { upsert: true }
        );
      }
      console.log(`✅ Restored ${ordersRes.rows.length} orders to MongoDB.`);
    }

    // 6. Restore Customers (if any exist)
    const custRes = await pg.query('SELECT * FROM "Customer"');
    if (custRes.rows.length > 0) {
      for (const c of custRes.rows) {
        let extraMobiles = [];
        let extraAddresses = [];
        try { extraMobiles = JSON.parse(c.extraMobiles); } catch {}
        try { extraAddresses = JSON.parse(c.extraAddresses); } catch {}

        await db.collection('customers').updateOne(
          { mobile: c.mobile },
          {
            $set: {
              id: c.id,
              name: c.name,
              mobile: c.mobile,
              passwordHash: c.passwordHash || null,
              address: c.address,
              city: c.city,
              state: c.state,
              pincode: c.pincode,
              extraMobiles,
              extraAddresses,
              totalOrders: Number(c.totalOrders || 0),
              totalSpent: Number(c.totalSpent || 0),
              updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
            },
            $setOnInsert: {
              createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
            },
          },
          { upsert: true }
        );
      }
      console.log(`✅ Restored ${custRes.rows.length} customers to MongoDB.`);
    }

    console.log('🎉 Database restoration from Supabase to MongoDB completed successfully!');
  } catch (err: any) {
    console.error('❌ Restore error:', err);
  } finally {
    await pg.end();
    await mongo.close();
  }
}

restore();

