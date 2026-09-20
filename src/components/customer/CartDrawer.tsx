import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { formatNaira, FREE_DELIVERY_THRESHOLD } from '../../lib/currency';

interface CartDrawerProps {
  onCheckout: () => void;
  onViewCartPage: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onViewCartPage }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    total,
    totalItemCount,
  } = useCart();

  const [dynamicThreshold, setDynamicThreshold] = useState(() => {
    try {
      const saved = localStorage.getItem('ruckyn_antee_store_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Number(parsed.freeDeliveryThreshold) || FREE_DELIVERY_THRESHOLD;
      }
    } catch {}
    return FREE_DELIVERY_THRESHOLD;
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('ruckyn_antee_store_settings_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          setDynamicThreshold(Number(parsed.freeDeliveryThreshold) || FREE_DELIVERY_THRESHOLD);
        }
      } catch {}
    };

    window.addEventListener('store_settings_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('store_settings_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs flex justify-end">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-display">
                Your Fresh Batch ({totalItemCount})
              </h2>
              <p className="text-[11px] text-stone-500">Ruckyn Antee Gourmet Popcorn</p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free delivery tracker */}
        <div className="px-4 py-2.5 bg-amber-100/60 border-b border-amber-200/60 text-xs text-amber-900">
          {subtotal >= dynamicThreshold ? (
            <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>You unlocked FREE Express Delivery!</span>
            </div>
          ) : (
            <div>
              <span>Add <strong>{formatNaira(dynamicThreshold - subtotal)}</strong> more for <strong>FREE Delivery</strong></span>
              <div className="w-full bg-amber-200/80 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotal / dynamicThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
              <span className="text-4xl mb-3">🍿</span>
              <p className="font-semibold text-stone-800 text-sm">Your cart is empty</p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Treat yourself to freshly kettle-cooked artisan popcorn!
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-3 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-white transition-colors"
              >
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-lg object-cover bg-stone-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="text-xs font-bold text-stone-900 truncate">
                      {item.product.name}
                    </h3>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-amber-800 font-medium">
                    {item.selectedSize.label} ({item.selectedSize.weight})
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-stone-300 rounded-lg bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-stone-900 min-w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-bold text-stone-900">
                      {formatNaira(item.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout action */}
        {items.length > 0 && (
          <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Estimated Delivery</span>
                <span className="font-semibold text-stone-900">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    formatNaira(deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-1.5 border-t border-stone-200">
                <span>Total Amount</span>
                <span className="text-amber-700">{formatNaira(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onViewCartPage();
                }}
                className="py-2.5 px-3 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-white transition-colors"
              >
                View Full Cart
              </button>
              <button
                id="drawer-checkout-btn"
                onClick={() => {
                  setIsCartOpen(false);
                  onCheckout();
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 text-xs font-black shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                Checkout <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
