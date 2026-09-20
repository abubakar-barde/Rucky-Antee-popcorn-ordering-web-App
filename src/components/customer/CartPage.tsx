import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { formatNaira } from '../../lib/currency';

interface CartPageProps {
  onContinueShopping: () => void;
  onProceedToCheckout: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  onContinueShopping,
  onProceedToCheckout,
}) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    total,
    totalItemCount,
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'POPCORN10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try POPCORN10');
    }
  };

  const discountAmount = promoApplied ? Number((subtotal * 0.1).toFixed(2)) : 0;
  const finalTotal = Number((subtotal + deliveryFee - discountAmount).toFixed(2));

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-4xl mb-4">
          🍿
        </div>
        <h2 className="text-xl font-bold text-stone-900 font-display">Your Popcorn Bag is Empty</h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-sm mx-auto">
          You haven't added any artisan popcorn batches to your order yet.
        </p>
        <button
          onClick={onContinueShopping}
          className="mt-6 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2"
        >
          Browse Popcorn Flavors <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 font-display tracking-tight">
            Review Your Popcorn Order
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {totalItemCount} {totalItemCount === 1 ? 'flavor batch' : 'flavor batches'} ready for freshly sealed delivery
          </p>
        </div>
        <button
          onClick={onContinueShopping}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Snacking
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-stone-200 shadow-xs"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover bg-stone-100 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                    {item.product.category}
                  </span>
                  <h3 className="text-sm font-bold text-stone-900 truncate">
                    {item.product.name}
                  </h3>
                  <p className="text-xs text-stone-600 font-medium mt-0.5">
                    {item.selectedSize.label} ({item.selectedSize.weight})
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Finish: {item.seasoningLevel}
                  </p>
                  <span className="text-xs font-extrabold text-amber-800 sm:hidden block mt-1">
                    {formatNaira(item.unitPrice)} each
                  </span>
                </div>
              </div>

              {/* Quantity Controls & Price */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50 p-0.5">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 hover:bg-white rounded-lg text-stone-600 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-stone-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 hover:bg-white rounded-lg text-stone-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-stone-900 block">
                    {formatNaira(item.totalPrice)}
                  </span>
                  <span className="hidden sm:block text-[11px] text-stone-400">
                    {formatNaira(item.unitPrice)} ea
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={clearCart}
              className="text-xs text-stone-500 hover:text-rose-600 font-medium hover:underline"
            >
              Clear shopping bag
            </button>
            <button
              onClick={onContinueShopping}
              className="sm:hidden text-xs font-bold text-amber-700"
            >
              + Add more items
            </button>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-stone-900 font-display">Order Summary</h2>

          {/* Promo code */}
          <form onSubmit={handleApplyPromo} className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">
              Promo Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Try POPCORN10"
                className="flex-1 px-3 py-2 text-xs uppercase font-semibold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Apply
              </button>
            </div>
            {promoApplied && (
              <p className="text-[11px] text-emerald-600 font-semibold">
                ✓ 10% Popcorn Discount Applied!
              </p>
            )}
            {promoError && (
              <p className="text-[11px] text-rose-500 font-semibold">{promoError}</p>
            )}
          </form>

          {/* Calculation */}
          <div className="space-y-2.5 text-xs text-stone-600 border-t border-stone-100 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-900">{formatNaira(subtotal)}</span>
            </div>

            {promoApplied && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount (POPCORN10)</span>
                <span>-{formatNaira(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-stone-900">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-700 font-bold">FREE</span>
                ) : (
                  formatNaira(deliveryFee)
                )}
              </span>
            </div>

            <div className="flex justify-between text-base font-black text-stone-900 pt-3 border-t border-stone-200">
              <span>Total Due</span>
              <span className="text-amber-700">{formatNaira(finalTotal)}</span>
            </div>
          </div>

          <button
            id="cart-proceed-checkout-btn"
            onClick={onProceedToCheckout}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </button>

          <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Guaranteed warm & crisp or we re-pop it free.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
