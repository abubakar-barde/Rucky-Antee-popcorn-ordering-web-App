import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { PopcornProduct, PopcornCategory } from '../../types';
import { AdminProductModal } from './AdminProductModal';
import { formatNaira } from '../../lib/currency';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Tag,
  DollarSign,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const { products, createProduct, updateProduct, deleteProduct } = useOrders();
  const { user, role, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PopcornProduct | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Security Verification: Ensure ONLY profile role === 'admin' can access
  if (role !== 'admin' && user?.role !== 'admin' && !isAdmin) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900">Access Restricted</h3>
        <p className="text-xs text-stone-500 mt-1">
          Product management is restricted to users with the <code className="bg-stone-100 px-1 py-0.5 rounded text-rose-700 font-mono">admin</code> role in <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800 font-mono">public.profiles</code>.
        </p>
      </div>
    );
  }

  const categories = ['All', 'Sweet', 'Savory', 'Spicy', 'Specialty', 'Cheese'];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: PopcornProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productData: Partial<PopcornProduct>) => {
    try {
      setErrorMessage(null);
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        setSuccessMessage(`Flavor "${productData.name || editingProduct.name}" updated successfully in Supabase.`);
      } else {
        await createProduct(productData as Omit<PopcornProduct, 'id'>);
        setSuccessMessage(`New flavor "${productData.name}" created successfully in Supabase.`);
      }
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setErrorMessage(err.message || 'Failed to save product in Supabase. Check RLS permissions.');
      setTimeout(() => setErrorMessage(null), 6000);
    }
  };

  const handleToggleAvailability = async (product: PopcornProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setErrorMessage(null);
      const nextStatus = !product.is_available;
      await updateProduct(product.id, { is_available: nextStatus });
      setSuccessMessage(`Product "${product.name}" is now marked as ${nextStatus ? 'Available (In Stock)' : 'Unavailable (Out of Stock)'}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to toggle availability:', err);
      setErrorMessage(err.message || 'Could not update availability.');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      setErrorMessage(null);
      await deleteProduct(productId);
      setDeleteConfirmId(null);
      setSuccessMessage('Product deleted successfully from Supabase.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      setErrorMessage(err.message || 'Failed to delete product from Supabase.');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Alert Banners */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 font-display">
            Popcorn Product Catalog
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage your flavors, pricing, kettle batch inventory, and availability.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs rounded-xl shadow-xs inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Popcorn Flavor
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200">
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search flavor name or ingredients..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <p className="font-bold text-sm">No popcorn flavors match your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Popcorn Flavor</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Snack Base Price</th>
                  <th className="p-4">Sizes Available</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-sm truncate">
                              {prod.name}
                            </span>
                            {prod.is_featured && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-black uppercase">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 truncate max-w-sm">
                            {prod.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 uppercase">
                        {prod.category}
                      </span>
                    </td>

                    <td className="p-4 font-black text-stone-900 text-sm">
                      {formatNaira(prod.price)}
                    </td>

                    <td className="p-4 text-stone-600 font-medium">
                      {prod.sizes.map((s) => s.label).join(', ')}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={(e) => handleToggleAvailability(prod, e)}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border flex items-center gap-1.5 transition-colors ${
                          prod.is_available
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                        }`}
                        title="Click to toggle stock availability"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            prod.is_available ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {prod.is_available ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {deleteConfirmId === prod.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-1.5 py-1 text-stone-400 hover:text-stone-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(prod.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <AdminProductModal
        product={editingProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
      />
    </div>
  );
};
