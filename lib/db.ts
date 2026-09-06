import { PrismaClient } from '@prisma/client';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  DEFAULT_SETTINGS,
  ProductItem,
  CategoryItem,
  OrderRecord,
  OrderItemRecord,
  CustomerRecord,
  SiteSettings,
} from './initialData';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

let memoryProducts: ProductItem[] = [...INITIAL_PRODUCTS];
let memoryCategories: CategoryItem[] = [...INITIAL_CATEGORIES];
let memoryOrders: OrderRecord[] = [...INITIAL_ORDERS];
let memoryCustomers: CustomerRecord[] = [...INITIAL_CUSTOMERS];
let memorySettings: SiteSettings = { ...DEFAULT_SETTINGS };

async function isDatabaseAvailable(): Promise<boolean> {
  return Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('your-tenant-ref'));
}

// ---------------- PRODUCTS ----------------

export async function getProducts(options?: {
  categoryId?: string;
  search?: string;
  featuredOnly?: boolean;
}): Promise<ProductItem[]> {
  try {
    if (await isDatabaseAvailable()) {
      const where: any = { isActive: true };
      if (options?.categoryId && options.categoryId !== 'all') {
        where.categoryId = options.categoryId;
      }
      if (options?.featuredOnly) {
        where.isFeatured = true;
      }
      if (options?.search) {
        where.OR = [
          { name: { contains: options.search, mode: 'insensitive' } },
          { description: { contains: options.search, mode: 'insensitive' } },
        ];
      }
      const dbProducts = await prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
      return dbProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice,
        stock: p.stock,
        categoryId: p.categoryId,
        categoryName: p.category?.name || 'General',
        imageUrl: p.imageUrl,
        images: JSON.parse(p.images || '[]'),
        isFeatured: p.isFeatured,
        isActive: p.isActive,
        createdAt: p.createdAt.toISOString(),
      }));
    }
  } catch (err) {
    console.warn('Prisma getProducts fallback to memory:', err);
  }

  let list = memoryProducts.filter((p) => p.isActive);
  if (options?.categoryId && options.categoryId !== 'all') {
    list = list.filter((p) => p.categoryId === options.categoryId);
  }
  if (options?.featuredOnly) {
    list = list.filter((p) => p.isFeatured);
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }
  return list;
}

export async function getAllProductsAdmin(): Promise<ProductItem[]> {
  try {
    if (await isDatabaseAvailable()) {
      const dbProducts = await prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
      return dbProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice,
        stock: p.stock,
        categoryId: p.categoryId,
        categoryName: p.category?.name || 'General',
        imageUrl: p.imageUrl,
        images: JSON.parse(p.images || '[]'),
        isFeatured: p.isFeatured,
        isActive: p.isActive,
        createdAt: p.createdAt.toISOString(),
      }));
    }
  } catch (err) {
    console.warn('Prisma getAllProductsAdmin fallback:', err);
  }
  return memoryProducts;
}

export async function getProductById(id: string): Promise<ProductItem | null> {
  try {
    if (await isDatabaseAvailable()) {
      const p: any = await prisma.product.findUnique({
        where: { id },
        include: { category: true },
      });
      if (!p) return null;
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice,
        stock: p.stock,
        categoryId: p.categoryId,
        categoryName: p.category?.name || 'General',
        imageUrl: p.imageUrl,
        images: JSON.parse(p.images || '[]'),
        isFeatured: p.isFeatured,
        isActive: p.isActive,
        createdAt: p.createdAt.toISOString(),
      };
    }
  } catch (err) {
    console.warn('Prisma getProductById fallback:', err);
  }
  return memoryProducts.find((p) => p.id === id) || null;
}

export async function createProduct(data: Omit<ProductItem, 'id' | 'createdAt' | 'categoryName'>): Promise<ProductItem> {
  try {
    if (await isDatabaseAvailable()) {
      const created: any = await prisma.product.create({
        data: {
          name: data.name,
          slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: data.description,
          price: Number(data.price),
          discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
          stock: Number(data.stock),
          categoryId: data.categoryId,
          imageUrl: data.imageUrl,
          images: JSON.stringify(data.images || []),
          isFeatured: Boolean(data.isFeatured),
          isActive: Boolean(data.isActive),
        },
        include: { category: true },
      });
      return {
        id: created.id,
        name: created.name,
        slug: created.slug,
        description: created.description,
        price: created.price,
        discountPrice: created.discountPrice,
        stock: created.stock,
        categoryId: created.categoryId,
        categoryName: created.category?.name || 'General',
        imageUrl: created.imageUrl,
        images: JSON.parse(created.images || '[]'),
        isFeatured: created.isFeatured,
        isActive: created.isActive,
        createdAt: created.createdAt.toISOString(),
      };
    }
  } catch (err) {
    console.warn('Prisma createProduct fallback:', err);
  }

  const categoryObj = memoryCategories.find((c) => c.id === data.categoryId);
  const newProd: ProductItem = {
    ...data,
    id: `prod-${Date.now()}`,
    categoryName: categoryObj?.name || 'General',
    createdAt: new Date().toISOString(),
  };
  memoryProducts.unshift(newProd);
  return newProd;
}

export async function updateProduct(id: string, data: Partial<ProductItem>): Promise<ProductItem | null> {
  try {
    if (await isDatabaseAvailable()) {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.price !== undefined) updateData.price = Number(data.price);
      if (data.discountPrice !== undefined) updateData.discountPrice = data.discountPrice ? Number(data.discountPrice) : null;
      if (data.stock !== undefined) updateData.stock = Number(data.stock);
      if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
      if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
      if (data.isFeatured !== undefined) updateData.isFeatured = Boolean(data.isFeatured);
      if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

      const updated: any = await prisma.product.update({
        where: { id },
        data: updateData,
        include: { category: true },
      });
      return {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        price: updated.price,
        discountPrice: updated.discountPrice,
        stock: updated.stock,
        categoryId: updated.categoryId,
        categoryName: updated.category?.name || 'General',
        imageUrl: updated.imageUrl,
        images: JSON.parse(updated.images || '[]'),
        isFeatured: updated.isFeatured,
        isActive: updated.isActive,
        createdAt: updated.createdAt.toISOString(),
      };
    }
  } catch (err) {
    console.warn('Prisma updateProduct fallback:', err);
  }

  const idx = memoryProducts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const categoryObj = data.categoryId ? memoryCategories.find((c) => c.id === data.categoryId) : undefined;
  memoryProducts[idx] = {
    ...memoryProducts[idx],
    ...data,
    categoryName: categoryObj?.name || memoryProducts[idx].categoryName,
  };
  return memoryProducts[idx];
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    if (await isDatabaseAvailable()) {
      await prisma.product.delete({ where: { id } });
      return true;
    }
  } catch (err) {
    console.warn('Prisma deleteProduct fallback:', err);
  }

  const idx = memoryProducts.findIndex((p) => p.id === id);
  if (idx !== -1) {
    memoryProducts.splice(idx, 1);
    return true;
  }
  return false;
}

// ---------------- CATEGORIES ----------------

export async function getCategories(): Promise<CategoryItem[]> {
  try {
    if (await isDatabaseAvailable()) {
      const cats = await prisma.category.findMany({ orderBy: { name: 'asc' } });
      return cats.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug }));
    }
  } catch (err) {
    console.warn('Prisma getCategories fallback:', err);
  }
  return memoryCategories;
}

// ---------------- ORDERS & CUSTOMERS ----------------

export async function getOrders(): Promise<OrderRecord[]> {
  try {
    if (await isDatabaseAvailable()) {
      const orders = await prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
      return orders.map((o: any) => ({
        id: o.id,
        customerName: o.customerName,
        mobile: o.mobile,
        address: o.address,
        city: o.city,
        state: o.state,
        pincode: o.pincode,
        note: o.note,
        subtotal: o.subtotal,
        deliveryCharge: o.deliveryCharge,
        totalAmount: o.totalAmount,
        status: o.status,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt.toISOString(),
        items: o.items.map((i: any) => ({
          id: i.id,
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          price: i.price,
          total: i.total,
        })),
      }));
    }
  } catch (err) {
    console.warn('Prisma getOrders fallback:', err);
  }
  return memoryOrders;
}

export async function getOrderByIdAndMobile(id: string, mobile: string): Promise<OrderRecord | null> {
  const cleanId = id.trim().toUpperCase();
  const cleanMobile = mobile.trim();

  try {
    if (await isDatabaseAvailable()) {
      const order: any = await prisma.order.findFirst({
        where: {
          id: cleanId,
          mobile: cleanMobile,
        },
        include: { items: true },
      });
      if (!order) return null;
      return {
        id: order.id,
        customerName: order.customerName,
        mobile: order.mobile,
        address: order.address,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
        note: order.note,
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((i: any) => ({
          id: i.id,
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          price: i.price,
          total: i.total,
        })),
      };
    }
  } catch (err) {
    console.warn('Prisma getOrderByIdAndMobile fallback:', err);
  }

  return (
    memoryOrders.find(
      (o) => o.id.toUpperCase() === cleanId && o.mobile.trim() === cleanMobile
    ) || null
  );
}

export async function createOrder(data: {
  customerName: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  note?: string;
  items: { productId: string; quantity: number }[];
}): Promise<OrderRecord> {
  const settings = await getSettings();
  const deliveryFee = settings.deliveryCharge;

  let subtotal = 0;
  const orderItemsData: OrderItemRecord[] = [];

  for (const item of data.items) {
    const prod = await getProductById(item.productId);
    const price = prod ? (prod.discountPrice ?? prod.price) : 0;
    const itemTotal = price * item.quantity;
    subtotal += itemTotal;

    orderItemsData.push({
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId: item.productId,
      productName: prod ? prod.name : 'Unknown Product',
      quantity: item.quantity,
      price: price,
      total: itemTotal,
    });
  }

  const grandTotal = subtotal + deliveryFee;

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(100 + Math.random() * 900);
  const orderId = `ORD-${dateStr}-${randomNum}`;

  try {
    if (await isDatabaseAvailable()) {
      const created: any = await prisma.order.create({
        data: {
          id: orderId,
          customerName: data.customerName,
          mobile: data.mobile,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          note: data.note || '',
          subtotal: subtotal,
          deliveryCharge: deliveryFee,
          totalAmount: grandTotal,
          status: 'Order Placed',
          paymentMethod: 'Cash on Delivery',
          items: {
            create: orderItemsData.map((i) => ({
              productId: i.productId,
              productName: i.productName,
              quantity: i.quantity,
              price: i.price,
              total: i.total,
            })),
          },
        },
        include: { items: true },
      });

      await prisma.customer.upsert({
        where: { mobile: data.mobile },
        update: {
          name: data.customerName,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          totalOrders: { increment: 1 },
          totalSpent: { increment: grandTotal },
        },
        create: {
          name: data.customerName,
          mobile: data.mobile,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          totalOrders: 1,
          totalSpent: grandTotal,
        },
      });

      return {
        id: created.id,
        customerName: created.customerName,
        mobile: created.mobile,
        address: created.address,
        city: created.city,
        state: created.state,
        pincode: created.pincode,
        note: created.note,
        subtotal: created.subtotal,
        deliveryCharge: created.deliveryCharge,
        totalAmount: created.totalAmount,
        status: created.status,
        paymentMethod: created.paymentMethod,
        createdAt: created.createdAt.toISOString(),
        items: created.items.map((i: any) => ({
          id: i.id,
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          price: i.price,
          total: i.total,
        })),
      };
    }
  } catch (err) {
    console.warn('Prisma createOrder fallback:', err);
  }

  const newOrderRecord: OrderRecord = {
    id: orderId,
    customerName: data.customerName,
    mobile: data.mobile,
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    note: data.note || null,
    subtotal,
    deliveryCharge: deliveryFee,
    totalAmount: grandTotal,
    status: 'Order Placed',
    paymentMethod: 'Cash on Delivery',
    createdAt: new Date().toISOString(),
    items: orderItemsData,
  };
  memoryOrders.unshift(newOrderRecord);

  const existingCust = memoryCustomers.find((c) => c.mobile === data.mobile);
  if (existingCust) {
    existingCust.totalOrders += 1;
    existingCust.totalSpent += grandTotal;
    existingCust.name = data.customerName;
    existingCust.address = data.address;
  } else {
    memoryCustomers.push({
      id: `cust-${Date.now()}`,
      name: data.customerName,
      mobile: data.mobile,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      totalOrders: 1,
      totalSpent: grandTotal,
      createdAt: new Date().toISOString(),
    });
  }

  return newOrderRecord;
}

export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  try {
    if (await isDatabaseAvailable()) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status },
      });
      return true;
    }
  } catch (err) {
    console.warn('Prisma updateOrderStatus fallback:', err);
  }

  const order = memoryOrders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    return true;
  }
  return false;
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  try {
    if (await isDatabaseAvailable()) {
      await prisma.orderItem.deleteMany({ where: { orderId } });
      await prisma.order.delete({ where: { id: orderId } });
      return true;
    }
  } catch (err) {
    console.warn('Prisma deleteOrder fallback:', err);
  }
  memoryOrders = memoryOrders.filter((o) => o.id !== orderId);
  return true;
}

export async function deleteCustomer(customerId: string): Promise<boolean> {
  try {
    if (await isDatabaseAvailable()) {
      await prisma.customer.delete({ where: { id: customerId } });
      return true;
    }
  } catch (err) {
    console.warn('Prisma deleteCustomer fallback:', err);
  }
  memoryCustomers = memoryCustomers.filter((c) => c.id !== customerId);
  return true;
}

export async function getCustomers(): Promise<CustomerRecord[]> {
  try {
    if (await isDatabaseAvailable()) {
      const custs = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
      return custs.map((c: any) => ({
        id: c.id,
        name: c.name,
        mobile: c.mobile,
        address: c.address,
        city: c.city,
        state: c.state,
        pincode: c.pincode,
        totalOrders: c.totalOrders,
        totalSpent: c.totalSpent,
        createdAt: c.createdAt.toISOString(),
      }));
    }
  } catch (err) {
    console.warn('Prisma getCustomers fallback:', err);
  }
  return memoryCustomers;
}

// ---------------- SETTINGS ----------------

export async function getSettings(): Promise<SiteSettings> {
  try {
    if (await isDatabaseAvailable()) {
      const settingsRecords = await prisma.setting.findMany();
      if (settingsRecords.length > 0) {
        const merged = { ...DEFAULT_SETTINGS };
        for (const s of settingsRecords) {
          if (s.key in merged) {
            (merged as any)[s.key] = s.key === 'deliveryCharge' ? Number(s.value) : s.value;
          }
        }
        return merged;
      }
    }
  } catch (err) {
    console.warn('Prisma getSettings fallback:', err);
  }
  return memorySettings;
}

export async function updateSettings(newSettings: Partial<SiteSettings>): Promise<SiteSettings> {
  try {
    if (await isDatabaseAvailable()) {
      const current = await getSettings();
      const changedEntries = Object.entries(newSettings).filter(
        ([key, value]) => value !== undefined && String(value) !== String((current as any)[key])
      );

      if (changedEntries.length > 0) {
        const ops = changedEntries.map(([key, value]) =>
          prisma.setting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) },
          })
        );
        await prisma.$transaction(ops);
      }
    }
  } catch (err) {
    console.warn('Prisma updateSettings fallback:', err);
  }

  memorySettings = {
    ...memorySettings,
    ...newSettings,
  };
  return memorySettings;
}
