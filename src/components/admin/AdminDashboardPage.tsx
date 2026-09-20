import React from 'react';
import { useOrders } from '../../context/OrderContext';
import { Order, OrderStatus, formatOrderStatus } from '../../types';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ChefHat,
} from 'lucide-react';
import { formatNaira } from '../../lib/currency';

interface AdminDashboardPageProps {
  onViewOrders: () => void;
  onOpenOrderDetails: (order: Order) => void;
  onViewProducts: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onViewOrders,
  onOpenOrderDetails,
  onViewProducts,
}) => {
  const { orders, products, updateOrderStatus } = useOrders();

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, curr) => acc + curr.total, 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const activeOrders = orders.filter((o) =>
    ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)
  );
  const completedOrders = orders.filter((o) => o.status === 'delivered');

  const recentOrders = orders.slice(0, 6);

  const handleQuickStatus = async (orderId: string, nextStatus: OrderStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateOrderStatus(orderId, nextStatus);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold animate-pulse';
      case 'confirmed':
        return 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
      case 'preparing':
        return 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
      case 'ready':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold';
      case 'out_for_delivery':
        return 'bg-amber-500 text-stone-950 border-amber-600 font-black';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      case 'cancelled':
        return 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Total Revenue
            </span>
            <span className="text-2xl font-black text-stone-900 font-display mt-0.5 block">
              {formatNaira(totalRevenue)}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Live from Supabase
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Pending Orders
            </span>
            <span className="text-2xl font-black text-amber-600 font-display mt-0.5 block">
              {pendingOrders.length}
            </span>
            <span className="text-[11px] text-stone-500 font-medium mt-0.5 block">
              Needs kitchen confirmation
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              In Kitchen & Transit
            </span>
            <span className="text-2xl font-black text-indigo-600 font-display mt-0.5 block">
              {activeOrders.length}
            </span>
            <span className="text-[11px] text-stone-500 font-medium mt-0.5 block">
              Popping & Courier en route
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Completed Orders
            </span>
            <span className="text-2xl font-black text-stone-900 font-display mt-0.5 block">
              {completedOrders.length}
            </span>
            <span className="text-[11px] text-stone-500 font-medium mt-0.5 block">
              Delivered successfully
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Realtime Orders Table & Flavor Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Realtime Live Orders Queue */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-sm font-black text-stone-900 font-display">
                Realtime Orders Queue
              </h2>
            </div>
            <button
              onClick={onViewOrders}
              className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
            >
              View All Orders ({orders.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-stone-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Order</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Kitchen Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => onOpenOrderDetails(order)}
                    className="hover:bg-amber-50/30 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-mono font-black text-stone-900 whitespace-nowrap">
                      #{order.id}
                      <span className="block font-sans font-normal text-[10px] text-stone-400">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-stone-800 truncate max-w-[130px]">
                        {order.customer_name}
                      </p>
                      <p className="text-[10px] text-stone-400 truncate max-w-[130px]">
                        {order.delivery_city}
                      </p>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-stone-700">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} bags/tins
                      </span>
                      <span className="block text-[10px] text-stone-400 truncate max-w-[140px]">
                        {order.items.map((i) => i.product_name).join(', ')}
                      </span>
                    </td>
                    <td className="p-3.5 font-black text-stone-900">
                      {formatNaira(order.total)}
                      <span className="block text-[10px] font-normal text-stone-400">
                        {order.payment_method.split(' ')[0]}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {formatOrderStatus(order.status)}
                      </span>
                    </td>
                    <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      {/* Quick stage advance button */}
                      {order.status === 'pending' && (
                        <button
                          onClick={(e) => handleQuickStatus(order.id, 'confirmed', e)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-[11px] shadow-xs"
                        >
                          Confirm
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={(e) => handleQuickStatus(order.id, 'preparing', e)}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[11px] shadow-xs"
                        >
                          Start Popping
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={(e) => handleQuickStatus(order.id, 'ready', e)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] shadow-xs"
                        >
                          Seal & Pack
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={(e) => handleQuickStatus(order.id, 'out_for_delivery', e)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-[11px] shadow-xs"
                        >
                          Dispatch
                        </button>
                      )}
                      {order.status === 'out_for_delivery' && (
                        <button
                          onClick={(e) => handleQuickStatus(order.id, 'delivered', e)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-xs"
                        >
                          Delivered
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <span className="text-[11px] text-emerald-700 font-bold">✓ Complete</span>
                      )}
                      {order.status === 'cancelled' && (
                        <span className="text-[11px] text-rose-600 font-bold">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Popcorn Products & Quick Inventory */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 font-display">
                Popcorn Catalog ({products.length})
              </h3>
              <button
                onClick={onViewProducts}
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3">
              {products.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-stone-100 bg-stone-50/60 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-stone-400">{p.category}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-stone-900 block">{formatNaira(p.price)}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        p.is_available
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p.is_available ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onViewProducts}
              className="w-full py-2.5 px-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs transition-colors"
            >
              + Add / Edit Popcorn Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
