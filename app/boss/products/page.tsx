'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Search,
  Sparkles,
  CheckCircle2,
  XCircle,
  Upload,
  AlertTriangle,
  X,
} from 'lucide-react';
import { ProductItem, CategoryItem } from '@/lib/initialData';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [addingCat, setAddingCat] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '',
    categoryId: '',
    imageUrl: '',
    isFeatured: false,
    isActive: true,
  });

  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create category');
      setNewCatName('');
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Error creating category');
    } finally {
      setAddingCat(false);
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${catId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Error deleting category');
    }
  };

  const fetchProducts = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([prods, cats]) => {
        if (Array.isArray(prods)) setProducts(prods);
        if (Array.isArray(cats)) setCategories(cats);
      })
      .catch((err) => console.error('Error fetching admin products:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      discountPrice: '',
      stock: '10',
      categoryId: categories[0]?.id || 'cat-1',
      imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd858d9721b?auto=format&fit=crop&q=80&w=800',
      isFeatured: false,
      isActive: true,
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: ProductItem) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      description: prod.description,
      price: String(prod.price),
      discountPrice: prod.discountPrice ? String(prod.discountPrice) : '',
      stock: String(prod.stock),
      categoryId: prod.categoryId,
      imageUrl: prod.imageUrl,
      isFeatured: prod.isFeatured,
      isActive: prod.isActive,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image upload failed');
      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (err: any) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.price || !formData.categoryId || !formData.imageUrl) {
      setError('Please fill in all required product fields');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
      stock: parseInt(formData.stock, 10) || 0,
      categoryId: formData.categoryId,
      imageUrl: formData.imageUrl.trim(),
      isFeatured: formData.isFeatured,
      isActive: formData.isActive,
    };

    try {
      let res;
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save product');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.message || 'Error saving product');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete product');
      }
      setDeletingProduct(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Could not delete product');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-stone-100">Product Management</h1>
          <p className="text-xs text-stone-400">Add, edit, or toggle products in your online storefront</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="px-5 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105"
          >
            <Package className="w-4 h-4 text-amber-400" /> Manage Categories
          </button>
          <button
            onClick={openAddModal}
            className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
        </div>
      </div>

      {/* Toolbar Search */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or category..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none"
          />
        </div>
        <span className="text-xs text-stone-400 font-semibold">{filteredProducts.length} Product(s)</span>
      </div>

      {/* Products Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-stone-400 font-bold uppercase tracking-wider border-b border-stone-800">
              <tr>
                <th className="px-4 py-3.5">Product</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Regular Price</th>
                <th className="px-4 py-3.5">Discount Price</th>
                <th className="px-4 py-3.5">Stock</th>
                <th className="px-4 py-3.5">Featured</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">Loading catalog...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">No products found.</td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-stone-100 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-stone-950 shrink-0 border border-stone-800" />
                      <div>
                        <span className="font-semibold block line-clamp-1">{p.name}</span>
                        <span className="text-[10px] text-stone-500 font-mono">ID: {p.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-amber-300">{p.categoryName}</td>
                    <td className="px-4 py-3.5 font-bold">৳{p.price}</td>
                    <td className="px-4 py-3.5 text-rose-300 font-bold">
                      {p.discountPrice ? `৳${p.discountPrice}` : '-'}
                    </td>
                    <td className="px-4 py-3.5 font-semibold">
                      <span className={p.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {p.isFeatured ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-800/50">
                          Featured
                        </span>
                      ) : (
                        <span className="text-stone-500 text-[10px]">Normal</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {p.isActive ? (
                        <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="text-stone-500 flex items-center gap-1 text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-amber-300 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingProduct(p)}
                        className="p-1.5 bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-400 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <h2 className="font-serif text-xl font-bold text-amber-100">
                {editingProduct ? 'Edit Product Details' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-stone-300">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Hand-Woven Jamdani Pure Silk Shawl"
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-stone-300">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of artisanal craftsmanship..."
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-stone-300">Regular Price (৳) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    placeholder="3499"
                    className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-stone-300">Discount Price (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="2899"
                    className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-stone-300">Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    placeholder="12"
                    className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-stone-300">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-stone-300">Product Image URL or File Upload *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    required
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none"
                  />
                  <label className="px-4 py-3 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-xl font-bold cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-4 h-4" /> {uploadingImage ? 'Uploading...' : 'Upload File'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-0"
                  />
                  <span className="font-semibold text-stone-200">Mark as Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-0"
                  />
                  <span className="font-semibold text-stone-200">Active in Storefront</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-lg"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-stone-100">Confirm Product Deletion</h3>
            <p className="text-xs text-stone-300">
              Are you sure you want to remove <strong>"{deletingProduct.name}"</strong>? This action cannot be undone.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg"
              >
                Yes, Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-100">Category Management</h3>
                <p className="text-xs text-stone-400">Add or delete store categories dynamically</p>
              </div>
              <button onClick={() => setIsCatModalOpen(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="flex gap-2 text-xs">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Enter new category name..."
                required
                className="flex-1 px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
              />
              <button
                type="submit"
                disabled={addingCat}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shrink-0 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> {addingCat ? 'Adding...' : 'Add'}
              </button>
            </form>

            {/* Existing Categories List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Existing Categories ({categories.length})</h4>
              {categories.length === 0 ? (
                <p className="text-xs text-stone-500 italic py-2">No custom categories found.</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((c) => (
                    <div key={c.id} className="p-3 bg-stone-950 border border-stone-800 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-200">{c.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(c.id, c.name)}
                        className="p-1.5 bg-rose-950/60 border border-rose-800/40 text-rose-400 hover:bg-rose-900 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end border-t border-stone-800">
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
