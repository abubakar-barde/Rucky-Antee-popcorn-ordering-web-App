import React, { useState } from 'react';
import { PopcornProduct, ProductSize } from '../../types';
import { useCart } from '../../context/CartContext';
import { ArrowLeft, Star, Plus, Minus, CheckCircle, ShieldCheck, Heart, Sparkles, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { formatNaira } from '../../lib/currency';

interface ProductDetailsPageProps {
  product: PopcornProduct;
  onBack: () => void;
  onViewCart: () => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product,
  onBack,
  onViewCart,
}) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<ProductSize>(
    product.sizes[0] || {
      id: 'regular',
      label: 'Regular Bag',
      priceMultiplier: 1.0,
      weight: '65g',
    }
  );
  const [seasoningLevel, setSeasoningLevel] = useState<string>('Signature Crisp');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const calculatedUnitPrice = Number((product.price * selectedSize.priceMultiplier).toFixed(2));
  const calculatedTotal = Number((calculatedUnitPrice * quantity).toFixed(2));
  const isAvailable = product.is_available !== false;

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addToCart(product, selectedSize, quantity, seasoningLevel);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-amber-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Popcorn Menu
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        {/* Product Image Showcase */}
        <div className="md:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 shadow-xs border border-stone-100">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-stone-950 shadow-xs">
                {product.category}
              </span>
            </div>
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-stone-900/80 text-amber-300 text-xs font-bold backdrop-blur-xs flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-300" />
              <span>{product.rating || 4.9}</span>
              <span className="text-stone-400">({product.reviews_count || 120} reviews)</span>
            </div>
          </div>

          {/* Quick trust metrics */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-amber-50/50 border border-amber-200/50 text-center">
            <div>
              <span className="text-[10px] text-stone-400 block font-semibold">Calories</span>
              <span className="text-xs font-bold text-stone-800">{product.calories || '175 kcal/30g'}</span>
            </div>
            <div className="border-x border-amber-200/50">
              <span className="text-[10px] text-stone-400 block font-semibold">Quality</span>
              <span className="text-xs font-bold text-stone-800">100% Non-GMO</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block font-semibold">Preparation</span>
              <span className="text-xs font-bold text-stone-800">Kettle Cooked</span>
            </div>
          </div>
        </div>

        {/* Product Configurations */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Ruckyn Antee Gourmet
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className={`text-[11px] font-semibold ${isAvailable ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {isAvailable ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-amber-700">
                  {formatNaira(calculatedUnitPrice)}
                </span>
                <span className="text-xs text-stone-400 font-medium">per {selectedSize.weight}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                Select Size:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedSize.id === size.id
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-stone-900">{size.label}</span>
                      <span className="text-[11px] font-extrabold text-amber-800">
                        {formatNaira(product.price * size.priceMultiplier)}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 mt-0.5 block">{size.weight}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Seasoning Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                Seasoning & Coating Finish:
              </label>
              <div className="flex flex-wrap gap-2">
                {['Signature Crisp', 'Light & Subtle', 'Extra Rich Glaze'].map((seasoning) => (
                  <button
                    key={seasoning}
                    onClick={() => setSeasoningLevel(seasoning)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      seasoningLevel === seasoning
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {seasoning}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingredients preview */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Ingredients:
                </span>
                <p className="text-[11px] text-stone-600 leading-normal">
                  {product.ingredients.join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-stone-200 space-y-4">
            <div className="flex items-center justify-between gap-4">
              {/* Quantity counter */}
              <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50 p-1">
                <button
                  disabled={!isAvailable}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-stone-900">
                  {quantity}
                </span>
                <button
                  disabled={!isAvailable}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Total & Add Button */}
              <div className="flex-1 flex gap-2">
                <button
                  id="add-to-cart-action-btn"
                  disabled={!isAvailable}
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                    !isAvailable
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                      : isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950'
                  }`}
                >
                  {!isAvailable ? (
                    'Temporarily Out of Stock'
                  ) : isAdded ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> Added to Bag!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add {formatNaira(calculatedTotal)} to Cart
                    </>
                  )}
                </button>

                {isAdded && (
                  <button
                    onClick={onViewCart}
                    className="px-3.5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs"
                  >
                    View Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
