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

export const INITIAL_CATEGORIES: CategoryItem[] = [];

export const INITIAL_PRODUCTS: ProductItem[] = [];

export const INITIAL_ORDERS: OrderRecord[] = [];

export const INITIAL_CUSTOMERS: CustomerRecord[] = [];

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
