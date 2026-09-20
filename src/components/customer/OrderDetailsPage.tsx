import React from 'react';
import { Order, formatOrderStatus } from '../../types';
import { ArrowLeft, Printer, Radio, MapPin, Phone, CreditCard, ShieldCheck } from 'lucide-react';
import { formatNaira } from '../../lib/currency';

interface OrderDetailsPageProps {
  order: Order;
  onBack: () => void;
  onTrack: (order: Order) => void;
}

export const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({
  order,
  onBack,
  onTrack,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-amber-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-white inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print Invoice
          </button>
          <button
            onClick={() => onTrack(order)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
          >
            <Radio className="w-3.5 h-3.5" /> Live Tracking
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🍿</span>
              <span className="font-display font-black text-xl text-stone-900">
                Ruckyn Antee Popcorn
              </span>
            </div>
            <p className="text-xs text-stone-500">Official Gourmet Popcorn Order Receipt</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-mono font-black text-stone-900 block text-base">
              Order #{order.id}
            </span>
            <span className="text-xs text-stone-500 block">
              Placed: {new Date(order.created_at).toLocaleString()}
            </span>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
              Status: {formatOrderStatus(order.status)}
            </span>
          </div>
        </div>

        {/* Recipient and Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs">
          <div>
            <span className="font-bold text-stone-700 block uppercase tracking-wider text-[10px] mb-1">
              Delivery Address:
            </span>
            <p className="font-bold text-stone-900 text-sm">{order.customer_name}</p>
            <p className="text-stone-600">{order.delivery_address}</p>
            <p className="text-stone-600">{order.delivery_city}</p>
            <p className="text-stone-600 mt-1">Phone: {order.customer_phone}</p>
          </div>

          <div>
            <span className="font-bold text-stone-700 block uppercase tracking-wider text-[10px] mb-1">
              Payment & Dispatch:
            </span>
            <p className="font-semibold text-stone-900">Method: {order.payment_method}</p>
            <p className="text-stone-600">Payment Status: <strong className="text-emerald-700">{order.payment_status}</strong></p>
            <p className="text-stone-600 mt-1">
              Estimated Delivery: <strong>{order.estimated_delivery || '25-35 mins'}</strong>
            </p>
            {order.delivery_notes && (
              <p className="text-stone-500 mt-1 italic">Note: "{order.delivery_notes}"</p>
            )}
          </div>
        </div>

        {/* Ordered items table */}
        <div>
          <h3 className="text-sm font-bold text-stone-900 mb-3 font-display">
            Ordered Popcorn Flavors
          </h3>
          <div className="border border-stone-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Size / Finish</th>
                  <th className="p-3 text-center">Unit Price</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/20">
                    <td className="p-3 flex items-center gap-2.5">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-10 h-10 rounded-lg object-cover bg-stone-100"
                      />
                      <span className="font-bold text-stone-900">{item.product_name}</span>
                    </td>
                    <td className="p-3 text-stone-600 font-medium">
                      {item.size}
                      {item.seasoning && <span className="block text-[10px] text-stone-400">{item.seasoning}</span>}
                    </td>
                    <td className="p-3 text-center text-stone-700">{formatNaira(item.unit_price)}</td>
                    <td className="p-3 text-center font-bold text-stone-900">{item.quantity}</td>
                    <td className="p-3 text-right font-black text-stone-900">
                      {formatNaira(item.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end pt-2">
          <div className="w-full max-w-xs space-y-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-stone-900">{formatNaira(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-bold text-stone-900">
                {order.delivery_fee === 0 ? 'FREE' : formatNaira(order.delivery_fee)}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span>-{formatNaira(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-200">
              <span>Total Amount</span>
              <span className="text-amber-700">{formatNaira(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
