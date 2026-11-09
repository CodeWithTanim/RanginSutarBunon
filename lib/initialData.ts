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
  categoryIds?: string[];
  categoryNames?: string[];
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
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;

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
  { id: 'cat-textiles', name: 'Handloom Textiles', slug: 'handloom-textiles' },
  { id: 'cat-pottery', name: 'Terracotta & Pottery', slug: 'terracotta-pottery' },
  { id: 'cat-decor', name: 'Home Decor & Crafts', slug: 'home-decor-crafts' },
  { id: 'cat-brass', name: 'Brassware & Metal', slug: 'brassware-metal' },
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-jamdani-01',
    name: 'Traditional Dhakai Jamdani Saree',
    slug: 'traditional-dhakai-jamdani-saree',
    description: 'Authentic hand-woven Jamdani saree with intricate floral motifs crafted over months by heritage master weavers in Narayanganj.',
    price: 6500,
    discountPrice: 5200,
    stock: 12,
    categoryId: 'cat-textiles',
    categoryName: 'Handloom Textiles',
    categoryIds: ['cat-textiles'],
    categoryNames: ['Handloom Textiles'],
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
    images: [],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-terracotta-01',
    name: 'Handcrafted Unglazed Terracotta Tea Set',
    slug: 'handcrafted-unglazed-terracotta-tea-set',
    description: 'Eco-friendly natural clay teapot and four cups, handcrafted using traditional wheel-thrown pottery techniques.',
    price: 1800,
    discountPrice: 1450,
    stock: 25,
    categoryId: 'cat-pottery',
    categoryName: 'Terracotta & Pottery',
    categoryIds: ['cat-pottery'],
    categoryNames: ['Terracotta & Pottery'],
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800',
    images: [],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-shawl-01',
    name: 'Handwoven Pure Silk Shawl',
    slug: 'handwoven-pure-silk-shawl',
    description: 'Luxurious handmade pure silk shawl dyed with natural botanical colors, soft texture with timeless elegance.',
    price: 3800,
    discountPrice: 3200,
    stock: 18,
    categoryId: 'cat-textiles',
    categoryName: 'Handloom Textiles',
    categoryIds: ['cat-textiles'],
    categoryNames: ['Handloom Textiles'],
    imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd858d9721b?auto=format&fit=crop&q=80&w=800',
    images: [],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-kantha-01',
    name: 'Artisan Nakshi Kantha Quilt',
    slug: 'artisan-nakshi-kantha-quilt',
    description: 'Vintage pure cotton handmade Nakshi Kantha featuring centuries-old Bengali needlework stories and geometric patterns.',
    price: 4500,
    discountPrice: 3900,
    stock: 10,
    categoryId: 'cat-decor',
    categoryName: 'Home Decor & Crafts',
    categoryIds: ['cat-decor'],
    categoryNames: ['Home Decor & Crafts'],
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800',
    images: [],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-brass-01',
    name: 'Antique Engraved Brass Planter',
    slug: 'antique-engraved-brass-planter',
    description: 'Hand-hammered pure solid brass planter with traditional embossed foliage motifs for classic home aesthetic.',
    price: 2900,
    discountPrice: 2400,
    stock: 15,
    categoryId: 'cat-brass',
    categoryName: 'Brassware & Metal',
    categoryIds: ['cat-brass'],
    categoryNames: ['Brassware & Metal'],
    imageUrl: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&q=80&w=800',
    images: [],
    isFeatured: false,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-wood-01',
    name: 'Hand-Carved Floral Wooden Wall Hanging',
    slug: 'hand-carved-floral-wooden-wall-hanging',
    description: 'Carved from seasoned mahogany wood by village woodcraft masters, finished with natural beeswax polish.',
    price: 2200,
    discountPrice: 1850,
    stock: 20,
    categoryId: 'cat-decor',
    categoryName: 'Home Decor & Crafts',
    categoryIds: ['cat-decor'],
    categoryNames: ['Home Decor & Crafts'],
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
    images: [],
    isFeatured: false,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_ORDERS: OrderRecord[] = [];

export const INITIAL_CUSTOMERS: CustomerRecord[] = [];

export const DEFAULT_SETTINGS: SiteSettings = {
  deliveryCharge: 150,
  siteTitle: 'Rangin Sutar Bunon',
  metaDescription: 'Discover authentic handcrafted items, traditional textiles and pottery at Rangin Sutar Bunon.',
  metaKeywords: 'handicraft, jamdani saree, terracotta, silk shawl, brassware, handmade, bangladesh',
  ogTitle: 'Rangin Sutar Bunon - Authentic Handcrafted Heritage',
  ogDescription: 'Experience timeless quality handloom textiles and artisan home decor delivered nationwide.',
  ogImage: 'https://images.unsplash.com/photo-1606760227091-3dd858d9721b?auto=format&fit=crop&q=80&w=1200',
  logoUrl: '',
  faviconUrl: '/favicon.ico',
  brandDisplayMode: 'both',

  // Top Announcement Banner Defaults
  topBannerPhone: '+880 1700-000000',
  topBannerEmail: 'support@ranginsutarbunon.com',
  showTopBannerText: true,
  topBannerText: 'Special Delivery: 100% Cash on Delivery Across Bangladesh',
  topBannerLinkText: 'Shop Now',
  topBannerLinkUrl: '/shop',

  // Hero Section Defaults
  heroTagline: 'Artisan Heritage Collection',
  heroHeadline: 'Grab Upto 50% Off On Selected Handcrafted Items',
  heroSubheadline: 'Authentic Jamdani textiles, unglazed terracotta pottery, organic Darjeeling teas, and antique brassware crafted by master weavers.',
  heroCtaText: 'Buy Now',
  heroImageUrl: '/uploads/Items/Hero-Section.png',

  // Footer Defaults
  footerAboutText: 'Celebrating rich quality and timeless artisanal heritage. Bringing authentic handcrafted products directly to your doorstep with love and care.',
  footerPhone: '+880 1700-000000',
  footerEmail: 'support@ranginsutarbunon.com',
  footerAddress: 'Dhaka, Bangladesh',
  footerCopyright: '© 2026 Rangin Sutar Bunon. All rights reserved. Developed by CodeWithTanim.',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  youtubeUrl: 'https://youtube.com',

  // About Page Defaults
  aboutBadgeText: 'Our Story',
  aboutTitle: 'About Rangin Sutar Bunon',
  aboutSubtitle: 'Bridging the timeless bond between master artisans and discerning homes.',
  aboutStoryHeading: 'Our Heritage & Mission',
  aboutStoryContent: 'Rangin Sutar Bunon was born out of a deep reverence for centuries-old artisanal traditions. We work directly with independent artisan weavers, potters, and craftsmen to ensure fair living wages while bringing museum-grade, heirloom craft into everyday modern life.',
  aboutStat1Value: '100%',
  aboutStat1Label: 'Artisan Crafted',
  aboutStat2Value: '24/7',
  aboutStat2Label: 'Customer Support',
  aboutStat3Value: 'COD',
  aboutStat3Label: 'Nationwide Delivery',
};
