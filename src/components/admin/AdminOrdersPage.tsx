import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { Order, OrderStatus, formatOrderStatus } from '../../types';
import { Search, Filter, Radio, ChevronRight, Eye } from 'lucide-react';
import { formatNaira } from '../../lib/currency';

interface AdminOrdersPageProps {
  onOpenOrder: (order: Order) => void;
}

type OrderFilterTab = 'all' | 'pending' | 'active' | 'completed' | 'cancelled';

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({ onOpenOrder }) => {
  const { orders, updateOrderStatus, deleteOrder } = useOrders();
  const [activeTab, setActiveTab] = useState<OrderFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order) => {
    // Hide archived orders entirely
    if (order.status === 'archived') return false;

    // Tab filter
    let matchesTab = true;
    if (activeTab === 'pending') {
      matchesTab = order.status === 'pending';
    } else if (activeTab === 'active') {
      matchesTab = ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status);
    } else if (activeTab === 'completed') {
      matchesTab = order.status === 'delivered';
    } else if (activeTab === 'cancelled') {
      matchesTab = order.status === 'cancelled';
    }

    // Search filter
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (order.id || '').toLowerCase().includes(query) ||
      (order.customer_name || '').toLowerCase().includes(query) ||
      (order.customer_email || '').toLowerCase().includes(query) ||
      (order.customer_phone || order.phone || '').includes(query) ||
      (order.delivery_city || '').toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  const handleStatusSelect = async (orderId: string, newStatus: OrderStatus | 'delete', e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    if (newStatus === 'delete') {
      if (window.confirm('Are you sure you want to permanently delete this order?')) {
        await deleteOrder(orderId);
      }
    } else {
      await updateOrderStatus(orderId, newStatus);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'preparing':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'ready':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'out_for_delivery':
        return 'bg-amber-500 text-stone-950 border-amber-600 font-black';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'cancelled':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    active: orders.filter((o) => ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)).length,
    completed: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 font-display">
            Customer Orders Database
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Realtime PostgREST records from Supabase <code>orders</code> and <code>order_items</code> tables.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, customer name, phone..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-stone-200">
        {[
          { id: 'all', label: 'All Orders', count: counts.all },
          { id: 'pending', label: 'Pending Action', count: counts.pending },
          { id: 'active', label: 'Active Kitchen/Transit', count: counts.active },
          { id: 'completed', label: 'Delivered', count: counts.completed },
          { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as OrderFilterTab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === tab.id ? 'bg-stone-950 text-white' : 'bg-stone-200 text-stone-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-stone-500 space-y-2">
            <span className="text-3xl">🍿</span>
            <p className="font-bold text-stone-800 text-sm">No orders found in this view</p>
            <p className="text-xs text-stone-400">Try selecting another filter or clear search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items Summary</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Live Status</th>
                  <th className="p-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => onOpenOrder(order)}
                    className="hover:bg-amber-50/40 cursor-pointer transition-colors"
                  >
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-mono font-black text-stone-900 block text-sm">
                        #{order.id}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(order.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-stone-900">{order.customer_name}</p>
                      <p className="text-[11px] text-stone-500">{order.customer_phone}</p>
                      <p className="text-[10px] text-stone-400 truncate max-w-[150px]">
                        {order.delivery_address}
                      </p>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-stone-800">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} items
                      </span>
                      <p className="text-[10px] text-stone-500 truncate max-w-[170px]">
                        {order.items.map((i) => `${i.quantity}x ${i.product_name}`).join(', ')}
                      </p>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-stone-800 block">
                        {order.payment_method}
                      </span>
                      <span
                        className={`inline-block text-[10px] font-bold ${
                          order.payment_status === 'Paid' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>

                    <td className="p-4 font-black text-stone-900 text-sm">
                      {formatNaira(order.total)}
                    </td>

                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusSelect(order.id, e.target.value as OrderStatus, e)}
                          className={`text-xs font-extrabold py-1 px-2 rounded-lg border focus:outline-none cursor-pointer ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="delete" className="text-rose-600 font-bold">Delete Order</option>
                        </select>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => onOpenOrder(order)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                        title="View Full Order Details"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
