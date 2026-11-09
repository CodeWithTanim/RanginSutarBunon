import { getDb, ensureIndexes } from './mongodb';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  DEFAULT_SETTINGS,
  ProductItem,
  CategoryItem,
  OrderRecord,
  OrderItemRecord,
  CustomerRecord,
  SiteSettings,
} from './initialData';

let cachedProducts: ProductItem[] | null = null;
let cachedProductsTime = 0;
let cachedCategories: CategoryItem[] | null = null;
let cachedCategoriesTime = 0;
let cachedSettings: SiteSettings | null = null;
let cachedSettingsTime = 0;
const CACHE_TTL_MS = 60000; // 60 seconds in-memory TTL

export function clearDbCache() {
  cachedProducts = null;
  cachedProductsTime = 0;
  cachedCategories = null;
  cachedCategoriesTime = 0;
  cachedSettings = null;
  cachedSettingsTime = 0;
}

// Auto-seed initial data to MongoDB if empty
let initialized = false;
async function ensureDbInitialized() {
  if (initialized) return;
  try {
    await ensureIndexes();
    const db = await getDb();
    
    // Check categories
    const catCount = await db.collection('categories').countDocuments();
    if (catCount === 0 && INITIAL_CATEGORIES.length > 0) {
      await db.collection('categories').insertMany(
        INITIAL_CATEGORIES.map((c) => ({ ...c, _id: undefined }))
      );
    }

    // Check products
    const prodCount = await db.collection('products').countDocuments();
    if (prodCount === 0 && INITIAL_PRODUCTS.length > 0) {
      await db.collection('products').insertMany(
        INITIAL_PRODUCTS.map((p) => ({ ...p, _id: undefined }))
      );
    }

    // Check settings
    const settingsCount = await db.collection('settings').countDocuments();
    if (settingsCount === 0) {
      const settingsDocs = Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({
        key,
        value: String(value),
        updatedAt: new Date().toISOString(),
      }));
      await db.collection('settings').insertMany(settingsDocs);
    }

    initialized = true;
  } catch (err) {
    console.warn('⚠️ ensureDbInitialized warning:', err);
  }
}

// ---------------- PRODUCTS ----------------

export async function getProducts(options?: {
  categoryId?: string;
  search?: string;
  featuredOnly?: boolean;
}): Promise<ProductItem[]> {
  const now = Date.now();
  let allProds: ProductItem[] = [];

  if (cachedProducts && now - cachedProductsTime < CACHE_TTL_MS) {
    allProds = cachedProducts;
  } else {
    try {
      await ensureDbInitialized();
      const db = await getDb();
      const docs = await db
        .collection('products')
        .find({ isActive: true })
        .sort({ createdAt: -1 })
        .toArray();

      allProds = docs.map((p: any) => ({
        id: p.id || String(p._id),
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
        discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
        stock: Number(p.stock || 0),
        categoryId: p.categoryId,
        categoryName: p.categoryName || 'General',
        categoryIds: p.categoryIds || (p.categoryId ? [p.categoryId] : []),
        categoryNames: p.categoryNames || [p.categoryName || 'General'],
        imageUrl: p.imageUrl,
        images: Array.isArray(p.images) ? p.images : [],
        isFeatured: Boolean(p.isFeatured),
        isActive: Boolean(p.isActive),
        createdAt: typeof p.createdAt === 'string' ? p.createdAt : (p.createdAt?.toISOString?.() || new Date().toISOString()),
      }));

      cachedProducts = allProds;
      cachedProductsTime = now;
    } catch (err) {
      console.warn('MongoDB getProducts fallback:', err);
      allProds = [...INITIAL_PRODUCTS];
    }
  }

  let list = allProds;
  if (options?.featuredOnly) {
    list = list.filter((p) => p.isFeatured);
  }
  if (options?.categoryId && options.categoryId !== 'all') {
    list = list.filter(
      (p) => p.categoryIds?.includes(options.categoryId!) || p.categoryId === options.categoryId
    );
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
    await ensureDbInitialized();
    const db = await getDb();
    const docs = await db
      .collection('products')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map((p: any) => ({
      id: p.id || String(p._id),
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      stock: Number(p.stock || 0),
      categoryId: p.categoryId,
      categoryName: p.categoryName || 'General',
      categoryIds: p.categoryIds || (p.categoryId ? [p.categoryId] : []),
      categoryNames: p.categoryNames || [p.categoryName || 'General'],
      imageUrl: p.imageUrl,
      images: Array.isArray(p.images) ? p.images : [],
      isFeatured: Boolean(p.isFeatured),
      isActive: Boolean(p.isActive),
      createdAt: typeof p.createdAt === 'string' ? p.createdAt : (p.createdAt?.toISOString?.() || new Date().toISOString()),
    }));
  } catch (err) {
    console.warn('MongoDB getAllProductsAdmin fallback:', err);
    return getProducts();
  }
}

export async function getProductById(id: string): Promise<ProductItem | null> {
  try {
    await ensureDbInitialized();
    const db = await getDb();
    const p: any = await db.collection('products').findOne({ $or: [{ id }, { slug: id }] });
    if (!p) return null;

    return {
      id: p.id || String(p._id),
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      stock: Number(p.stock || 0),
      categoryId: p.categoryId,
      categoryName: p.categoryName || 'General',
      categoryIds: p.categoryIds || [p.categoryId],
      categoryNames: p.categoryNames || [p.categoryName || 'General'],
      imageUrl: p.imageUrl,
      images: Array.isArray(p.images) ? p.images : [],
      isFeatured: Boolean(p.isFeatured),
      isActive: Boolean(p.isActive),
      createdAt: typeof p.createdAt === 'string' ? p.createdAt : (p.createdAt?.toISOString?.() || new Date().toISOString()),
    };
  } catch (err) {
    console.warn('MongoDB getProductById fallback:', err);
    return null;
  }
}

export async function createProduct(
  data: Omit<ProductItem, 'id' | 'createdAt' | 'categoryName'>
): Promise<ProductItem> {
  clearDbCache();
  const catIds = data.categoryIds && data.categoryIds.length > 0 ? data.categoryIds : [data.categoryId];
  const rawPrimaryCatId = catIds[0] || 'general';

  const baseSlugPart =
    encodeURIComponent(data.name.trim().toLowerCase()).replace(/%/g, '').substring(0, 30) || 'product';
  const uniqueSlug = `${baseSlugPart}-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  const categories = await getCategories();
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const categoryNames = catIds.map((cid) => catMap.get(cid) || 'General');
  const primaryCatName = categoryNames[0] || 'General';

  const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const productDoc: ProductItem = {
    id: newId,
    name: data.name.trim(),
    slug: uniqueSlug,
    description: data.description,
    price: Number(data.price),
    discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
    stock: Number(data.stock || 0),
    categoryId: rawPrimaryCatId,
    categoryName: primaryCatName,
    categoryIds: catIds,
    categoryNames,
    imageUrl: data.imageUrl,
    images: Array.isArray(data.images) ? data.images : [],
    isFeatured: Boolean(data.isFeatured),
    isActive: Boolean(data.isActive),
    createdAt: now,
  };

  try {
    await ensureDbInitialized();
    const db = await getDb();
    await db.collection('products').insertOne({ ...productDoc });
  } catch (err) {
    console.error('MongoDB createProduct error:', err);
  }

  return productDoc;
}

export async function updateProduct(id: string, data: Partial<ProductItem>): Promise<ProductItem | null> {
  clearDbCache();
  try {
    await ensureDbInitialized();
    const db = await getDb();

    const updateFields: any = { updatedAt: new Date().toISOString() };
    if (data.name !== undefined) updateFields.name = data.name.trim();
    if (data.description !== undefined) updateFields.description = data.description;
    if (data.price !== undefined) updateFields.price = Number(data.price);
    if (data.discountPrice !== undefined)
      updateFields.discountPrice = data.discountPrice ? Number(data.discountPrice) : null;
    if (data.stock !== undefined) updateFields.stock = Number(data.stock);
    if (data.imageUrl !== undefined) updateFields.imageUrl = data.imageUrl;
    if (data.isFeatured !== undefined) updateFields.isFeatured = Boolean(data.isFeatured);
    if (data.isActive !== undefined) updateFields.isActive = Boolean(data.isActive);
    if (data.images !== undefined) updateFields.images = data.images;

    if (data.categoryIds !== undefined && data.categoryIds.length > 0) {
      updateFields.categoryIds = data.categoryIds;
      updateFields.categoryId = data.categoryIds[0];
      const categories = await getCategories();
      const catMap = new Map(categories.map((c) => [c.id, c.name]));
      updateFields.categoryNames = data.categoryIds.map((cid) => catMap.get(cid) || 'General');
      updateFields.categoryName = updateFields.categoryNames[0] || 'General';
    } else if (data.categoryId !== undefined) {
      updateFields.categoryId = data.categoryId;
      updateFields.categoryIds = [data.categoryId];
      const categories = await getCategories();
      const matched = categories.find((c) => c.id === data.categoryId);
      updateFields.categoryName = matched ? matched.name : 'General';
      updateFields.categoryNames = [updateFields.categoryName];
    }

    await db.collection('products').updateOne({ id }, { $set: updateFields });
    return await getProductById(id);
  } catch (err) {
    console.error('MongoDB updateProduct error:', err);
    return null;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  clearDbCache();
  try {
    await ensureDbInitialized();
    const db = await getDb();
    const res = await db.collection('products').deleteOne({ id });
    return res.deletedCount > 0;
  } catch (err) {
    console.warn('MongoDB deleteProduct error:', err);
    return false;
  }
}

// ---------------- CATEGORIES ----------------

export async function getCategories(): Promise<CategoryItem[]> {
  const now = Date.now();
  if (cachedCategories && now - cachedCategoriesTime < CACHE_TTL_MS) {
    return cachedCategories;
  }

  try {
    await ensureDbInitialized();
    const db = await getDb();
    const docs = await db.collection('categories').find({}).sort({ name: 1 }).toArray();

    const mapped = docs.map((c: any) => ({
      id: c.id || String(c._id),
      name: c.name,
      slug: c.slug,
    }));

    cachedCategories = mapped;
    cachedCategoriesTime = now;
    return mapped;
  } catch (err) {
    console.warn('MongoDB getCategories fallback:', err);
    return [...INITIAL_CATEGORIES];
  }
}

export async function createCategory(name: string): Promise<CategoryItem> {
  clearDbCache();
  const slug =
    name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cat-${Date.now()}`;
  const newCat: CategoryItem = {
    id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    slug,
  };

  try {
    await ensureDbInitialized();
    const db = await getDb();
    await db.collection('categories').insertOne({ ...newCat });
  } catch (err) {
    console.error('MongoDB createCategory error:', err);
  }

  return newCat;
}

export async function deleteCategory(id: string): Promise<boolean> {
  clearDbCache();
  try {
    await ensureDbInitialized();
    const db = await getDb();
    const res = await db.collection('categories').deleteOne({ id });
    return res.deletedCount > 0;
  } catch (err) {
    console.warn('MongoDB deleteCategory error:', err);
    return false;
  }
}

// ---------------- ORDERS & CUSTOMERS ----------------

export async function getOrders(): Promise<OrderRecord[]> {
  try {
    await ensureDbInitialized();
    const db = await getDb();
    const docs = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();

    return docs.map((o: any) => ({
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
      createdAt: typeof o.createdAt === 'string' ? o.createdAt : (o.createdAt?.toISOString?.() || new Date().toISOString()),
      items: Array.isArray(o.items) ? o.items : [],
    }));
  } catch (err) {
    console.warn('MongoDB getOrders fallback:', err);
    return [];
  }
}

export async function getOrderByIdAndMobile(id: string, mobile: string): Promise<OrderRecord | null> {
  const cleanId = id.trim().toUpperCase();
  const cleanMobile = mobile.trim();

  try {
    await ensureDbInitialized();
    const db = await getDb();
    const o: any = await db.collection('orders').findOne({
      id: { $regex: new RegExp(`^${cleanId}$`, 'i') },
      mobile: cleanMobile,
    });

    if (!o) return null;

    return {
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
      createdAt: typeof o.createdAt === 'string' ? o.createdAt : (o.createdAt?.toISOString?.() || new Date().toISOString()),
      items: Array.isArray(o.items) ? o.items : [],
    };
  } catch (err) {
    console.warn('MongoDB getOrderByIdAndMobile error:', err);
    return null;
  }
}

export async function createOrder(data: {
  customerName: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  note?: string | null;
  items: { productId: string; quantity: number }[];
}): Promise<OrderRecord> {
  const settings = await getSettings();
  const deliveryFee = settings.deliveryCharge || 150;

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
      productName: prod ? prod.name : 'Handcrafted Item',
      quantity: item.quantity,
      price: price,
      total: itemTotal,
    });
  }

  const grandTotal = subtotal + deliveryFee;
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(100 + Math.random() * 900);
  const orderId = `ORD-${dateStr}-${randomNum}`;
  const now = new Date().toISOString();

  const newOrder: OrderRecord = {
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
    createdAt: now,
    items: orderItemsData,
  };

  try {
    await ensureDbInitialized();
    const db = await getDb();
    await db.collection('orders').insertOne({ ...newOrder });

    // Update or insert customer record
    await db.collection('customers').updateOne(
      { mobile: data.mobile },
      {
        $set: {
          name: data.customerName,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          updatedAt: now,
        },
        $inc: {
          totalOrders: 1,
          totalSpent: grandTotal,
        },
        $setOnInsert: {
          id: `cust-${Date.now()}`,
          mobile: data.mobile,
          createdAt: now,
          extraMobiles: [],
          extraAddresses: [],
        },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error('MongoDB createOrder error:', err);
  }

  return newOrder;
}

export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  try {
    await ensureDbInitialized();
    const db = await getDb();
    const res = await db
      .collection('orders')
      .updateOne({ id: orderId }, { $set: { status, updatedAt: new Date().toISOString() } });
    return res.modifiedCount > 0;
  } catch (err) {
    console.error('MongoDB updateOrderStatus error:', err);
    return false;
  }
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  try {
    await ensureDbInitialized();
    const db = await getDb();
    const res = await db.collection('orders').deleteOne({ id: orderId });
    return res.deletedCount > 0;
  } catch (err) {
    console.error('MongoDB deleteOrder error:', err);
    return false;
  }
}

export async function getCustomers(): Promise<CustomerRecord[]> {
  try {
    await ensureDbInitialized();
    const db = await getDb();
    const docs = await db.collection('customers').find({}).sort({ createdAt: -1 }).toArray();

    return docs.map((c: any) => ({
      id: c.id || String(c._id),
      name: c.name,
      mobile: c.mobile,
      address: c.address || '',
      city: c.city || '',
      state: c.state || '',
      pincode: c.pincode || '',
      totalOrders: Number(c.totalOrders || 0),
      totalSpent: Number(c.totalSpent || 0),
      createdAt: typeof c.createdAt === 'string' ? c.createdAt : (c.createdAt?.toISOString?.() || new Date().toISOString()),
    }));
  } catch (err) {
    console.warn('MongoDB getCustomers fallback:', err);
    return [];
  }
}

export async function deleteCustomer(customerId: string): Promise<boolean> {
  try {
    await ensureDbInitialized();
    const db = await getDb();
    const res = await db.collection('customers').deleteOne({
      $or: [{ id: customerId }, { _id: customerId as any }],
    });
    return res.deletedCount > 0;
  } catch (err) {
    console.error('MongoDB deleteCustomer error:', err);
    return false;
  }
}

// ---------------- SETTINGS ----------------

export async function getSettings(): Promise<SiteSettings> {
  const now = Date.now();
  if (cachedSettings && now - cachedSettingsTime < CACHE_TTL_MS) {
    return cachedSettings;
  }

  try {
    await ensureDbInitialized();
    const db = await getDb();
    const docs = await db.collection('settings').find({}).toArray();

    if (docs.length > 0) {
      const merged: any = { ...DEFAULT_SETTINGS };
      for (const s of docs) {
        if (s.key in merged) {
          if (s.key === 'deliveryCharge') {
            merged[s.key] = Number(s.value);
          } else if (s.key === 'showTopBannerText') {
            merged[s.key] = s.value === 'true' || s.value === true;
          } else {
            merged[s.key] = s.value;
          }
        }
      }
      cachedSettings = merged;
      cachedSettingsTime = now;
      return merged;
    }
  } catch (err) {
    console.warn('MongoDB getSettings fallback:', err);
  }

  return { ...DEFAULT_SETTINGS };
}

export async function updateSettings(newSettings: Partial<SiteSettings>): Promise<SiteSettings> {
  clearDbCache();
  try {
    await ensureDbInitialized();
    const db = await getDb();
    const now = new Date().toISOString();

    const ops = Object.entries(newSettings)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => ({
        updateOne: {
          filter: { key },
          update: {
            $set: {
              key,
              value: String(value),
              updatedAt: now,
            },
          },
          upsert: true,
        },
      }));

    if (ops.length > 0) {
      await db.collection('settings').bulkWrite(ops);
    }
  } catch (err) {
    console.error('MongoDB updateSettings error:', err);
  }

  return await getSettings();
}

// ---------------- CONTACT MESSAGES ----------------

export async function getContactMessages() {
  try {
    await ensureDbInitialized();
    const db = await getDb();
    const docs = await db.collection('contact_messages').find({}).sort({ createdAt: -1 }).toArray();
    return docs.map((m: any) => ({
      id: m.id || String(m._id),
      name: m.name,
      email: m.email,
      phone: m.phone,
      subject: m.subject || null,
      message: m.message,
      isRead: Boolean(m.isRead),
      createdAt: typeof m.createdAt === 'string' ? m.createdAt : (m.createdAt?.toISOString?.() || new Date().toISOString()),
    }));
  } catch (err) {
    console.error('MongoDB getContactMessages error:', err);
    return [];
  }
}

export async function createContactMessage(data: {
  name: string;
  email: string;
  phone: string;
  subject?: string | null;
  message: string;
}) {
  const doc = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    subject: data.subject ? data.subject.trim() : null,
    message: data.message.trim(),
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  try {
    await ensureDbInitialized();
    const db = await getDb();
    await db.collection('contact_messages').insertOne({ ...doc });
  } catch (err) {
    console.error('MongoDB createContactMessage error:', err);
  }

  return doc;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  try {
    await ensureDbInitialized();
    const db = await getDb();
    const res = await db.collection('contact_messages').deleteOne({ id });
    return res.deletedCount > 0;
  } catch (err) {
    console.error('MongoDB deleteContactMessage error:', err);
    return false;
  }
}

export async function updateContactMessageStatus(id: string, isRead: boolean): Promise<any> {
  try {
    await ensureDbInitialized();
    const db = await getDb();
    await db
      .collection('contact_messages')
      .updateOne({ id }, { $set: { isRead: Boolean(isRead), updatedAt: new Date().toISOString() } });
    return await db.collection('contact_messages').findOne({ id });
  } catch (err) {
    console.error('MongoDB updateContactMessageStatus error:', err);
    return null;
  }
}
