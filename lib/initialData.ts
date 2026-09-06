export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  categoryId: string;
  categoryName: string;
  imageUrl: string;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export interface OrderItemRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderRecord {
  id: string;
  customerName: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  note?: string | null;
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  status: string; // 'Order Placed' | 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled'
  paymentMethod: string;
  createdAt: string;
  items: OrderItemRecord[];
}

export interface CustomerRecord {
  id: string;
  name: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export interface SiteSettings {
  deliveryCharge: number;
  siteTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  logoUrl: string;
  faviconUrl: string;
  brandDisplayMode: 'both' | 'logo_only' | 'text_only';

  // Top Announcement Banner Settings
  topBannerPhone: string;
  topBannerEmail: string;
  showTopBannerText: boolean;
  topBannerText: string;
  topBannerLinkText: string;
  topBannerLinkUrl: string;

  // Hero Section Settings
  heroTagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaText: string;
  heroImageUrl: string;

  // Footer Settings
  footerAboutText: string;
  footerPhone: string;
  footerEmail: string;
  footerAddress: string;
  footerCopyright: string;

  // About Page Settings
  aboutBadgeText: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutStoryHeading: string;
  aboutStoryContent: string;
  aboutStat1Value: string;
  aboutStat1Label: string;
  aboutStat2Value: string;
  aboutStat2Label: string;
  aboutStat3Value: string;
  aboutStat3Label: string;
}

export const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'Handcrafted Textiles', slug: 'handcrafted-textiles' },
  { id: 'cat-2', name: 'Artisan Pottery', slug: 'artisan-pottery' },
  { id: 'cat-3', name: 'Organic Teas & Spices', slug: 'organic-teas-spices' },
  { id: 'cat-4', name: 'Heritage Brassware', slug: 'heritage-brassware' },
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    name: 'Hand-Woven Jamdani Pure Silk Shawl',
    slug: 'hand-woven-jamdani-pure-silk-shawl',
    description: 'Exquisite hand-spun Jamdani silk shawl crafted by master artisans using traditional wooden looms.',
    price: 3499,
    discountPrice: 2899,
    stock: 12,
    categoryId: 'cat-1',
    categoryName: 'Handcrafted Textiles',
    imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd858d9721b?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1606760227091-3dd858d9721b?auto=format&fit=crop&q=80&w=800'
    ],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Artisanal Terracotta Tea Set (6 Cups)',
    slug: 'artisanal-terracotta-tea-set-6-cups',
    description: 'Natural unglazed clay tea service handcrafted with traditional motifs.',
    price: 1599,
    discountPrice: 1299,
    stock: 25,
    categoryId: 'cat-2',
    categoryName: 'Artisan Pottery',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800'
    ],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Premium Royal Darjeeling First Flush Tea (100g)',
    slug: 'premium-royal-darjeeling-first-flush-tea',
    description: 'Single-origin organic Darjeeling tea harvested during early spring.',
    price: 899,
    discountPrice: 749,
    stock: 40,
    categoryId: 'cat-3',
    categoryName: 'Organic Teas & Spices',
    imageUrl: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=800'
    ],
    isFeatured: false,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'Hand-Carved Antique Brass Spiced Urn',
    slug: 'hand-carved-antique-brass-spiced-urn',
    description: 'Solid brass decorative oil lamp & incense urn crafted by legacy metalworkers.',
    price: 2499,
    discountPrice: 1999,
    stock: 8,
    categoryId: 'cat-4',
    categoryName: 'Heritage Brassware',
    imageUrl: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=800'
    ],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'ORD-20260906-001',
    customerName: 'Ananya Roy',
    mobile: '01712345678',
    address: 'House 4B, Road 12, Dhanmondi',
    city: 'Dhaka',
    state: 'Dhaka Division',
    pincode: '1209',
    note: 'Please deliver in the evening if possible.',
    subtotal: 2899,
    deliveryCharge: 80,
    totalAmount: 2979,
    status: 'Delivered',
    paymentMethod: 'Cash on Delivery',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Hand-Woven Jamdani Pure Silk Shawl',
        quantity: 1,
        price: 2899,
        total: 2899
      }
    ]
  }
];

export const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust-1',
    name: 'Ananya Roy',
    mobile: '01712345678',
    address: 'House 4B, Road 12, Dhanmondi',
    city: 'Dhaka',
    state: 'Dhaka Division',
    pincode: '1209',
    totalOrders: 1,
    totalSpent: 2979,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

export const DEFAULT_SETTINGS: SiteSettings = {
  deliveryCharge: 80,
  siteTitle: 'Rangin Sutar Bunon',
  metaDescription: 'Discover authentic handcrafted items and products.',
  metaKeywords: 'handicraft, saree, silk shawl, tea set, products',
  ogTitle: 'Rangin Sutar Bunon',
  ogDescription: 'Experience timeless quality products directly online.',
  ogImage: 'https://images.unsplash.com/photo-1606760227091-3dd858d9721b?auto=format&fit=crop&q=80&w=1200',
  logoUrl: '',
  faviconUrl: '/favicon.ico',
  brandDisplayMode: 'both',

  // Top Announcement Banner Defaults
  topBannerPhone: '+880 1700-000000',
  topBannerEmail: 'support@ranginsutarbunon.com',
  showTopBannerText: true,
  topBannerText: 'Welcome to Rangin Sutar Bunon',
  topBannerLinkText: 'Shop Now',
  topBannerLinkUrl: '/shop',

  // Hero Section Defaults
  heroTagline: 'Special Offer',
  heroHeadline: 'Grab Special Offers On Our Collection',
  heroSubheadline: 'Explore our latest collection of items handcrafted with care and quality.',
  heroCtaText: 'Buy Now',
  heroImageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd858d9721b?auto=format&fit=crop&q=80&w=1000',

  // Footer Defaults
  footerAboutText: 'Celebrating rich quality and design. Bringing authentic products directly to your home.',
  footerPhone: '+880 1700-000000',
  footerEmail: 'support@ranginsutarbunon.com',
  footerAddress: 'Dhaka, Bangladesh',
  footerCopyright: '© 2026 Rangin Sutar Bunon. All rights reserved.',

  // About Page Defaults
  aboutBadgeText: 'Our Story',
  aboutTitle: 'About Rangin Sutar Bunon',
  aboutSubtitle: 'We are dedicated to delivering authentic quality products directly to you.',
  aboutStoryHeading: 'Our Legacy',
  aboutStoryContent: 'Every piece in our shop represents quality and dedication. We guarantee standard quality with reliable customer service.',
  aboutStat1Value: '100%',
  aboutStat1Label: 'Authentic Quality',
  aboutStat2Value: '24/7',
  aboutStat2Label: 'Customer Support',
  aboutStat3Value: 'COD',
  aboutStat3Label: 'Nationwide Cash on Delivery',
};
