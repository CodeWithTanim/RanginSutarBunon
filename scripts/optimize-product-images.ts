import * as dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'rangin-sutar-bunon';

if (!uri) {
  console.error('❌ MONGODB_URI missing.');
  process.exit(1);
}

const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function optimizeImages() {
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db(dbName);

  const prods = await db.collection('products').find({}).toArray();
  console.log(`Analyzing images for ${prods.length} products...`);

  let convertedCount = 0;

  for (const prod of prods) {
    if (prod.imageUrl && prod.imageUrl.startsWith('data:image/')) {
      const match = prod.imageUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (match) {
        let ext = match[1];
        if (ext === 'jpeg') ext = 'jpg';
        if (ext === 'svg+xml') ext = 'svg';

        const base64Data = match[2];
        const fileName = `${prod.id}.${ext}`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

        const newUrl = `/uploads/products/${fileName}`;
        await db.collection('products').updateOne(
          { id: prod.id },
          { $set: { imageUrl: newUrl } }
        );

        console.log(`✅ Converted ${prod.name} (${Math.round(prod.imageUrl.length / 1024)} KB) -> ${newUrl}`);
        convertedCount++;
      }
    }
  }

  console.log(`\n🎉 Converted ${convertedCount} bulky base64 images into high-speed static CDN assets!`);
  await client.close();
}

optimizeImages().catch(console.error);

