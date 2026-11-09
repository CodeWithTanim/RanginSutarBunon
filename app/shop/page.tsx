import React from 'react';
import { getProducts, getCategories } from '@/lib/db';
import ShopClient from '@/components/ShopClient';

// Enable Incremental Static Regeneration (ISR) so shop page is served in < 50ms directly from Edge CDN
export const revalidate = 60;

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return <ShopClient initialProducts={products} initialCategories={categories} />;
}
