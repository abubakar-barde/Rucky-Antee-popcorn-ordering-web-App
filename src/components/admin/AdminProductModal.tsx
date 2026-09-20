import React, { useState, useEffect } from 'react';
import { PopcornProduct, PopcornCategory } from '../../types';
import { X, Image, Plus, Trash2, Check, Sparkles, UploadCloud, AlertCircle, Info } from 'lucide-react';
import { ProductsService } from '../../lib/supabaseService';

interface AdminProductModalProps {
  product?: PopcornProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<PopcornProduct>) => Promise<void>;
}

const PRESET_POPCORN_IMAGES = [
  {
    label: 'Caramel Gold',
    url: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Cheddar & Cheese',
    url: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Classic Movie Butter',
    url: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Dark Truffle / Cocoa',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Spicy Paprika / Jalapeño',
    url: 'https://images.unsplash.com/photo-1584697964190-7bb9b3e1f0e8?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Artisan Kettle Batch',
    url: 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?auto=format&fit=crop&w=800&q=80',
  },
];

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState<PopcornCategory>(product?.category || 'Sweet');
  const [price, setPrice] = useState<number>(product?.price || 3500);
  const [imageUrl, setImageUrl] = useState(
    product?.image_url || PRESET_POPCORN_IMAGES[0].url
  );
  const [isAvailable, setIsAvailable] = useState(product?.is_available ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [spicinessLevel, setSpicinessLevel] = useState(product?.spiciness_level || 0);
  const [ingredientsInput, setIngredientsInput] = useState(
    product?.ingredients?.join(', ') || 'Non-GMO Butterfly Corn, Coconut Oil, Sea Salt'
  );
  const [tagsInput, setTagsInput] = useState(product?.tags?.join(', ') || 'Fresh, Artisan');
  const [isSaving, setIsSaving] = useState(false);
  const [storageStatus, setStorageStatus] = useState<{ isConfigured: boolean; message: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    ProductsService.checkStorageConfiguration().then((res) => {
      if (!isMounted) return;
      if (res.isConfigured) {
        setStorageStatus({
          isConfigured: true,
          message: `Storage bucket '${res.bucketName}' is active.`,
        });
      } else {
        setStorageStatus({
          isConfigured: false,
          message: res.error || 'Supabase Storage is not yet configured for uploads.',
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const ingredients = ingredientsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const tags = tagsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await onSave({
      name,
      description,
      category,
      price: Number(price),
      image_url: imageUrl,
      is_available: isAvailable,
      is_featured: isFeatured,
      spiciness_level: Number(spicinessLevel),
      ingredients,
      tags,
      sizes: product?.sizes || [
        { id: 's', label: 'Snack Bag', weight: '3.5 oz', priceMultiplier: 1.0, priceModifier: 0 },
        { id: 'm', label: 'Sharing Pouch', weight: '7.0 oz', priceMultiplier: 1.5, priceModifier: 1750 },
        { id: 'l', label: 'Party Kettle Tin', weight: '16.0 oz', priceMultiplier: 2.2, priceModifier: 4200 },
      ],
    });

    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-stone-900 font-display">
              {isEditing ? `Edit Popcorn: ${product?.name}` : 'Add New Popcorn Product'}
            </h3>
            <p className="text-xs text-stone-500">
              Synced directly to the Supabase <code>products</code> table.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Product Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Popcorn Flavor Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bourbon Smoked Salted Caramel"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PopcornCategory)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                <option value="Sweet">Sweet</option>
                <option value="Savory">Savory</option>
                <option value="Spicy">Spicy</option>
                <option value="Specialty">Specialty</option>
                <option value="Cheese">Cheese</option>
              </select>
            </div>
          </div>

          {/* Price & Spiciness */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Base Price (Snack Bag) in Naira (₦) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-500 font-bold">₦</span>
                <input
                  type="number"
                  step="50"
                  min="100"
                  required
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Heat Level (0 = Mild, 3 = Extra Spicy)
              </label>
              <select
                value={spicinessLevel}
                onChange={(e) => setSpicinessLevel(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                <option value="0">0 - None / Sweet</option>
                <option value="1">1 - Mild Zing 🌶️</option>
                <option value="2">2 - Medium Kick 🌶️🌶️</option>
                <option value="3">3 - Fiery Ghost Crunch 🌶️🌶️🌶️</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Flavor Story / Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Crispy butterfly popcorn hand-tumbled in slow-cooked caramel with pure butter..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Image Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-stone-700">
                Product Image URL
              </label>
              {storageStatus && (
                <span className={`text-[11px] font-medium flex items-center gap-1 ${
                  storageStatus.isConfigured ? 'text-emerald-600' : 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200'
                }`}>
                  <Info className="w-3 h-3" />
                  {storageStatus.isConfigured
                    ? storageStatus.message
                    : 'Storage not configured: upload requires Supabase Storage bucket; using direct image URLs / presets.'}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-10 h-10 rounded-lg object-cover border border-stone-300 bg-stone-100"
                />
              )}
            </div>

            {/* Presets */}
            <div className="pt-1">
              <span className="text-[10px] text-stone-400 font-bold uppercase block mb-1.5">
                Quick Preset Popcorn Photos:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRESET_POPCORN_IMAGES.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all h-14 ${
                      imageUrl === preset.url
                        ? 'border-amber-500 ring-2 ring-amber-400/40'
                        : 'border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    {imageUrl === preset.url && (
                      <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ingredients & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Ingredients (comma separated)
              </label>
              <input
                type="text"
                value={ingredientsInput}
                onChange={(e) => setIngredientsInput(e.target.value)}
                placeholder="Non-GMO Corn, Sea Salt, Sugar..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Badge Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Gluten-Free, Best-Seller, Artisan..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Availability & Featured toggles */}
          <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span className="font-bold text-stone-900">In-Stock & Available for Ordering</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span className="font-bold text-stone-900">Feature on Home Page Carousel</span>
            </label>
          </div>

          {/* Footer Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black shadow-xs"
            >
              {isSaving ? 'Saving to Supabase...' : isEditing ? 'Update Popcorn' : 'Publish Popcorn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
