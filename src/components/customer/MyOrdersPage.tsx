import React from 'react';
import { Order, formatOrderStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { Package, Clock, ArrowRight, Radio, ShoppingBag } from 'lucide-react';
import { formatNaira } from '../../lib/currency';

interface MyOrdersPageProps {
  onTrackOrder: (order: Order) => void;
  onViewOrderDetails: (order: Order) => void;
  onBrowseMenu: () => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({
  onTrackOrder,
  onViewOrderDetails,
  onBrowseMenu,
}) => {
  const { user } = useAuth();
  const { orders } = useOrders();

  // Filter orders strictly for the active authenticated user
  const customerOrders = orders.filter(
    (o) => user && (o.customer_id === user.id || o.user_id === user.id)
  );

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'preparing':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'ready':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'out_for_delivery':
      case 'out for delivery':
        return 'bg-amber-500 text-stone-950 border-amber-600 font-black';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 font-display tracking-tight">
            My Popcorn Orders
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Track active deliveries and review your past snacking history
          </p>
        </div>
        <button
          onClick={onBrowseMenu}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4" /> Order Fresh Popcorn
        </button>
      </div>

      {customerOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-3xl">
            🍿
          </div>
          <h2 className="text-base font-bold text-stone-900 font-display">No Orders Found</h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            You haven't placed any popcorn orders yet. Start your first fresh batch today!
          </p>
          <button
            onClick={onBrowseMenu}
            className="mt-2 px-5 py-2.5 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-xs"
          >
            Explore Gourmet Flavors
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {customerOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all p-5 space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-black text-base">
                    🍿
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-stone-900">
                        #{order.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {formatOrderStatus(order.status)}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400">
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-stone-400 block">Total Paid</span>
                  <span className="text-base font-black text-amber-800">
                    {formatNaira(order.total)}
                  </span>
                </div>
              </div>

              {/* Items preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-stone-50">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-10 h-10 rounded-md object-cover bg-stone-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-stone-800 truncate">{item.product_name}</p>
                      <p className="text-[11px] text-stone-500">
                        {item.size} • Qty {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-stone-900">{formatNaira(item.total_price)}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-100">
                <span className="text-[11px] text-stone-500 truncate max-w-xs">
                  Delivering to: {order.delivery_address}
                </span>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => onViewOrderDetails(order)}
                    className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => onTrackOrder(order)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Radio className="w-3 h-3 animate-pulse" />
                    Track Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
