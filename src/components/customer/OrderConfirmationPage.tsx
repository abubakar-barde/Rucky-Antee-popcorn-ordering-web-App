import React from 'react';
import { Order } from '../../types';
import { CheckCircle2, Clock, MapPin, Truck, ArrowRight, ShoppingBag, Radio } from 'lucide-react';
import { motion } from 'motion/react';
import { formatNaira } from '../../lib/currency';

interface OrderConfirmationPageProps {
  order: Order;
  onTrackOrder: (order: Order) => void;
  onContinueShopping: () => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  onTrackOrder,
  onContinueShopping,
}) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Celebration Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-lg text-center space-y-4"
      >
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Order Placed Successfully!
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display tracking-tight mt-1">
            Thank you, {order.customer_name}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
            Your popcorn order is now stored in Supabase and has been beamed directly to our kitchen staff.
          </p>
        </div>

        {/* Order Reference Pill */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950 text-sm font-bold">
          <span>Order ID:</span>
          <span className="font-mono text-base font-black text-amber-800">#{order.id}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        </div>

        {/* Delivery ETA banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-left mt-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-stone-400 block font-semibold">Estimated Delivery Time</span>
              <span className="text-sm font-black text-stone-900">{order.estimated_delivery || '25-35 mins'}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-stone-400 block font-semibold">Delivering To</span>
              <span className="text-sm font-bold text-stone-900 truncate block max-w-[200px]">
                {order.delivery_address}, {order.delivery_city}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
          <button
            id="confirmation-track-btn"
            onClick={() => onTrackOrder(order)}
            className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Radio className="w-4 h-4 text-stone-950 animate-pulse" />
            Track Live Order Status
          </button>

          <button
            onClick={onContinueShopping}
            className="py-3 px-5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" /> Order More Popcorn
          </button>
        </div>
      </motion.div>

      {/* Item summary */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-stone-900 font-display">Items in this Batch</h2>
        <div className="divide-y divide-stone-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-12 h-12 rounded-lg object-cover bg-stone-100"
                />
                <div>
                  <p className="font-bold text-stone-900">{item.product_name}</p>
                  <p className="text-[11px] text-stone-500">
                    {item.size} • Qty: {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-black text-stone-900">{formatNaira(item.total_price)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-200 pt-3 space-y-1.5 text-xs text-stone-600">
          <div className="flex justify-between">
            <span>Payment Method</span>
            <span className="font-semibold text-stone-800">{order.payment_method}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-stone-900 pt-1">
            <span>Total Paid</span>
            <span className="text-amber-700">{formatNaira(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
