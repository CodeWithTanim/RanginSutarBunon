import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  DEFAULT_SETTINGS,
} from '../lib/initialData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Rangin Sutar Bunon...');

  // 1. Seed Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash },
    create: {
      username: 'admin',
      name: 'Store Manager',
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created: username: "admin", password: "admin123"');

  // 2. Seed Categories
  for (const cat of INITIAL_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, slug: cat.slug },
      create: { id: cat.id, name: cat.name, slug: cat.slug },
    });
  }
  console.log('✅ Categories seeded.');

  // 3. Seed Products
  for (const prod of INITIAL_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: prod.price,
        discountPrice: prod.discountPrice,
        stock: prod.stock,
        categoryId: prod.categoryId,
        imageUrl: prod.imageUrl,
        images: JSON.stringify(prod.images),
        isFeatured: prod.isFeatured,
        isActive: prod.isActive,
      },
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: prod.price,
        discountPrice: prod.discountPrice,
        stock: prod.stock,
        categoryId: prod.categoryId,
        imageUrl: prod.imageUrl,
        images: JSON.stringify(prod.images),
        isFeatured: prod.isFeatured,
        isActive: prod.isActive,
      },
    });
  }
  console.log('✅ Products seeded.');

  // 4. Seed Orders & Items
  for (const order of INITIAL_ORDERS) {
    await prisma.order.upsert({
      where: { id: order.id },
      update: {
        customerName: order.customerName,
        mobile: order.mobile,
        address: order.address,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
        note: order.note || '',
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
      },
      create: {
        id: order.id,
        customerName: order.customerName,
        mobile: order.mobile,
        address: order.address,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
        note: order.note || '',
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        items: {
          create: order.items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity,
            price: i.price,
            total: i.total,
          })),
        },
      },
    });
  }
  console.log('✅ Orders seeded.');

  // 5. Seed Customers
  const customerPasswordHash = await bcrypt.hash('user1234', 10);
  for (const cust of INITIAL_CUSTOMERS) {
    await prisma.customer.upsert({
      where: { id: cust.id },
      update: {
        name: cust.name,
        mobile: cust.mobile,
        address: cust.address,
        city: cust.city,
        state: cust.state,
        pincode: cust.pincode,
        totalOrders: cust.totalOrders,
        totalSpent: cust.totalSpent,
        passwordHash: customerPasswordHash,
      },
      create: {
        id: cust.id,
        name: cust.name,
        mobile: cust.mobile,
        address: cust.address,
        city: cust.city,
        state: cust.state,
        pincode: cust.pincode,
        totalOrders: cust.totalOrders,
        totalSpent: cust.totalSpent,
        passwordHash: customerPasswordHash,
      },
    });
  }
  console.log('✅ Customers seeded with default password "user1234".');

  // 6. Seed Default Settings
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }
  console.log('✅ Site settings seeded.');

  console.log('✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
