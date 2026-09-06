'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowUpDown, AlertCircle } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { ProductItem, CategoryItem, INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '@/lib/initialData';

export default function ShopPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('category');
      if (catParam) setSelectedCategory(catParam);
      const searchParam = params.get('search');
      if (searchParam) setSearchQuery(searchParam);
    }

    setLoading(true);
    Promise.all([
      fetch('/api/products').then((res) => res.json()),
      fetch('/api/categories').then((res) => res.json()),
    ])
      .then(([prodsData, catsData]) => {
        if (Array.isArray(prodsData)) setProducts(prodsData);
        if (Array.isArray(catsData)) setCategories(catsData);
      })
      .catch((err) => console.error('Error loading shop data:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(
        (p) => p.categoryId === selectedCategory || (p.categoryIds && p.categoryIds.includes(selectedCategory))
      );
    }

    if (sortBy === 'price-low') {
      result.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-3 text-center sm:text-left">
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-gray-900">
          Catalog
        </h1>
        <p className="text-sm text-gray-600 max-w-2xl">
          Browse our complete collection. Filter by category or search directly for specific items.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or keyword..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 focus:border-[#003d29] text-gray-900 placeholder-gray-500 rounded-full text-xs outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>

          <div className="md:col-span-6 flex items-center justify-between md:justify-end gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">
              <ArrowUpDown className="w-4 h-4 text-[#003d29]" /> Sort By:
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-100 border border-gray-200 text-gray-900 text-xs rounded-full px-4 py-2.5 outline-none focus:border-[#003d29] cursor-pointer font-semibold"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#003d29] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter(
              (p) => p.categoryId === cat.id || (p.categoryIds && p.categoryIds.includes(cat.id))
            ).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#003d29] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="bg-white border border-gray-200 rounded-3xl h-80 animate-pulse p-4 flex flex-col justify-between"
            >
              <div className="w-full h-44 bg-gray-100 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white border border-gray-200 rounded-3xl p-8 max-w-lg mx-auto shadow-sm">
          <AlertCircle className="w-12 h-12 text-[#003d29] mx-auto" />
          <h3 className="font-serif text-xl font-bold text-gray-900">No products available</h3>
          <p className="text-xs text-gray-500">
            We couldn’t find any items matching your selected search query or category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-6 py-2.5 bg-[#003d29] hover:bg-[#00281b] text-white font-bold text-xs rounded-full shadow-md transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="text-[#003d29] font-bold">{filteredProducts.length}</span> item(s)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
