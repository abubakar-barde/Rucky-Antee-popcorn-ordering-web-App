import React from 'react';
import { useOrders } from '../../context/OrderContext';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CreditCard,
  PieChart,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { formatNaira } from '../../lib/currency';

export const AdminSalesPage: React.FC = () => {
  const { orders } = useOrders();

  const validOrders = orders.filter((o) => o.status !== 'cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalItemsSold = validOrders.reduce(
    (sum, o) => sum + o.items.reduce((isum, item) => isum + item.quantity, 0),
    0
  );
  const avgOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

  // Breakdown by payment method
  const paymentCounts: Record<string, { count: number; total: number }> = {};
  validOrders.forEach((o) => {
    if (!paymentCounts[o.payment_method]) {
      paymentCounts[o.payment_method] = { count: 0, total: 0 };
    }
    paymentCounts[o.payment_method].count += 1;
    paymentCounts[o.payment_method].total += o.total;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-black text-stone-900 font-display">Sales & Performance</h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Realtime financial analytics computed across all validated Supabase orders.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Gross Popcorn Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-stone-900 font-display mt-2 block">
            {formatNaira(totalRevenue)}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> 100% backed by Supabase
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Average Order Value (AOV)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-stone-900 font-display mt-2 block">
            {formatNaira(avgOrderValue)}
          </span>
          <span className="text-[11px] text-stone-500 font-medium block mt-1">
            Across {validOrders.length} completed transactions
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Total Bags & Tins Dispatched
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-stone-900 font-display mt-2 block">
            {totalItemsSold} Units
          </span>
          <span className="text-[11px] text-stone-500 font-medium block mt-1">
            Freshly popped in copper kettles
          </span>
        </div>
      </div>

      {/* Payment methods breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <CreditCard className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-stone-900 font-display">
              Payment Methods Breakdown
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(paymentCounts).map(([method, data]) => {
              const pct = totalRevenue > 0 ? (data.total / totalRevenue) * 100 : 0;
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-stone-800">{method}</span>
                    <span className="font-black text-stone-900">
                      {formatNaira(data.total)} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 block">{data.count} transactions</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <PieChart className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-stone-900 font-display">
              Fulfillment Pipeline
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              {
                status: 'Delivered',
                count: orders.filter((o) => o.status === 'delivered').length,
                color: 'bg-emerald-500',
              },
              {
                status: 'Out for Delivery',
                count: orders.filter((o) => o.status === 'out_for_delivery').length,
                color: 'bg-amber-500',
              },
              {
                status: 'Preparing / Popping',
                count: orders.filter((o) => o.status === 'preparing').length,
                color: 'bg-purple-500',
              },
              {
                status: 'Confirmed',
                count: orders.filter((o) => o.status === 'confirmed').length,
                color: 'bg-blue-500',
              },
              {
                status: 'Pending',
                count: orders.filter((o) => o.status === 'pending').length,
                color: 'bg-amber-300',
              },
              {
                status: 'Cancelled',
                count: orders.filter((o) => o.status === 'cancelled').length,
                color: 'bg-rose-500',
              },
            ].map((st) => (
              <div
                key={st.status}
                className="flex items-center justify-between p-2 rounded-xl bg-stone-50"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${st.color}`} />
                  <span className="font-semibold text-stone-800">{st.status}</span>
                </div>
                <span className="font-bold text-stone-900">{st.count} orders</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
