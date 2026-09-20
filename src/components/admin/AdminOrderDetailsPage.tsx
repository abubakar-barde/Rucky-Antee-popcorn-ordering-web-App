import React, { useState } from 'react';
import { Order, OrderStatus, formatOrderStatus } from '../../types';
import { useOrders } from '../../context/OrderContext';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle,
  Radio,
  Clock,
  Printer,
} from 'lucide-react';
import { formatNaira } from '../../lib/currency';

interface AdminOrderDetailsPageProps {
  order: Order;
  onBack: () => void;
}

export const AdminOrderDetailsPage: React.FC<AdminOrderDetailsPageProps> = ({ order, onBack }) => {
  const { updateOrderStatus } = useOrders();
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    setCurrentStatus(newStatus);
    const success = await updateOrderStatus(order.id, newStatus);
    setIsUpdating(false);
    if (success) {
      setSuccessNotice(true);
      setTimeout(() => setSuccessNotice(false), 2000);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
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

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-amber-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-white inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print Kitchen Ticket
          </button>
        </div>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          Status updated in Supabase <code>orders</code> table! Realtime event dispatched to customer.
        </div>
      )}

      {/* Main Order Container */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-8">
        {/* Header summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-2xl text-stone-900">
                Order #{order.id}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${getStatusColor(
                  currentStatus
                )}`}
              >
                {formatOrderStatus(currentStatus)}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Received {new Date(order.created_at).toLocaleString()} • User ID: {order.user_id}
            </p>
          </div>

          {/* Status Change Control */}
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Update Order Status (Broadcasts Live):
            </label>
            <select
              value={currentStatus}
              disabled={isUpdating}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              className="w-full text-xs font-bold py-1.5 px-3 rounded-xl border border-stone-300 bg-white text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing (Popping)</option>
              <option value="ready">Ready (Heat-Sealed)</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Customer & Delivery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Profile Box */}
          <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-2 text-stone-700 font-bold text-xs uppercase tracking-wider">
              <User className="w-4 h-4 text-amber-600" />
              <span>Customer Information</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-stone-900 text-sm">{order.customer_name}</p>
              <p className="text-stone-600 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" /> {order.customer_email}
              </p>
              <p className="text-stone-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" /> {order.customer_phone}
              </p>
            </div>
          </div>

          {/* Delivery & Payment Box */}
          <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-2 text-stone-700 font-bold text-xs uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>Delivery Coordinates & Payment</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-stone-900">
                {order.delivery_address}, {order.delivery_city}
              </p>
              <p className="text-stone-600">
                Payment Method: <strong className="text-stone-800">{order.payment_method}</strong> ({order.payment_status})
              </p>
              {order.delivery_notes && (
                <p className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200/60 mt-2">
                  <strong>Notes:</strong> {order.delivery_notes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Ordered Popcorn Flavors list */}
        <div>
          <h3 className="text-sm font-bold text-stone-900 font-display mb-3">
            Ordered Popcorn Items ({order.items.length})
          </h3>

          <div className="border border-stone-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Product Flavor</th>
                  <th className="p-3.5">Size & Finish</th>
                  <th className="p-3.5 text-center">Unit Price</th>
                  <th className="p-3.5 text-center">Quantity</th>
                  <th className="p-3.5 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/20">
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-stone-900 text-sm">{item.product_name}</p>
                        <p className="text-[10px] text-stone-400">ID: {item.product_id}</p>
                      </div>
                    </td>
                    <td className="p-3.5 text-stone-700 font-medium">
                      {item.size}
                      {item.seasoning && (
                        <span className="block text-[10px] text-stone-400">{item.seasoning}</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center text-stone-700">{formatNaira(item.unit_price)}</td>
                    <td className="p-3.5 text-center font-bold text-stone-900">{item.quantity}</td>
                    <td className="p-3.5 text-right font-black text-stone-900">
                      {formatNaira(item.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Total Calculation */}
        <div className="flex justify-end pt-2">
          <div className="w-full max-w-xs space-y-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-stone-900">{formatNaira(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span className="font-bold text-stone-900">
                {order.delivery_fee === 0 ? 'FREE' : formatNaira(order.delivery_fee)}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-200">
              <span>Total Bill</span>
              <span className="text-amber-700">{formatNaira(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
