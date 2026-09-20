import React, { useState } from 'react';
import { Order, OrderStatus, formatOrderStatus } from '../../types';
import {
  Clock,
  CheckCircle,
  ChefHat,
  PackageCheck,
  Truck,
  Home,
  XCircle,
  Phone,
  MapPin,
  ArrowLeft,
  Search,
  ShoppingBag,
} from 'lucide-react';
import { formatNaira } from '../../lib/currency';

interface OrderTrackingPageProps {
  order?: Order | null;
  orders?: Order[];
  onSelectOrder?: (order: Order) => void;
  onBackToOrders: () => void;
  onViewOrderDetails: (order: Order) => void;
  onBrowseMenu?: () => void;
}

// Exactly matches Step 7 specification:
// Pending -> Confirmed -> Preparing -> Ready -> Out for Delivery -> Delivered
// Also support: Cancelled
const ORDER_STEPS: { status: OrderStatus; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    status: 'pending',
    label: 'Pending',
    icon: <Clock className="w-4 h-4" />,
    desc: 'Order received and awaiting kitchen confirmation',
  },
  {
    status: 'confirmed',
    label: 'Confirmed',
    icon: <CheckCircle className="w-4 h-4" />,
    desc: 'Order confirmed and ingredients reserved',
  },
  {
    status: 'preparing',
    label: 'Preparing',
    icon: <ChefHat className="w-4 h-4" />,
    desc: 'Popping & glazing fresh popcorn batch',
  },
  {
    status: 'ready',
    label: 'Ready',
    icon: <PackageCheck className="w-4 h-4" />,
    desc: 'Freshly packed and heat-sealed in tins/bags',
  },
  {
    status: 'out_for_delivery',
    label: 'Out for Delivery',
    icon: <Truck className="w-4 h-4" />,
    desc: 'Courier dispatched with your fresh popcorn',
  },
  {
    status: 'delivered',
    label: 'Delivered',
    icon: <Home className="w-4 h-4" />,
    desc: 'Order safely delivered to your doorstep',
  },
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  order: propOrder,
  orders = [],
  onSelectOrder,
  onBackToOrders,
  onViewOrderDetails,
  onBrowseMenu,
}) => {
  const [lookupId, setLookupId] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);

  const activeOrder = searchedOrder || propOrder || (orders.length > 0 ? orders[0] : null);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    const cleanId = lookupId.trim().replace(/^#/, '');
    if (!cleanId) return;

    const found = orders.find((o) => o.id.toLowerCase() === cleanId.toLowerCase());
    if (found) {
      setSearchedOrder(found);
      if (onSelectOrder) onSelectOrder(found);
    } else {
      setLookupError(`No order found matching reference #${cleanId}`);
    }
  };

  // If no active order exists at all
  if (!activeOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <button
          onClick={onBackToOrders}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-amber-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </button>

        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mx-auto">
            🍿
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
              Track Your Popcorn Order
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
              Enter your order reference ID below to view the status progression from kitchen kettle to your doorstep.
            </p>
          </div>

          <form onSubmit={handleLookup} className="max-w-sm mx-auto space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                placeholder="Enter Order ID (e.g. 101)"
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Search className="w-3.5 h-3.5" /> Track
              </button>
            </div>
            {lookupError && (
              <p className="text-xs text-rose-600 font-medium text-left">{lookupError}</p>
            )}
          </form>

          {onBrowseMenu && (
            <div className="pt-4 border-t border-stone-100">
              <button
                onClick={onBrowseMenu}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-bold transition-colors"
              >
                <ShoppingBag className="w-4 h-4" /> Browse Popcorn Menu
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentStatusIndex = ORDER_STEPS.findIndex((s) => s.status === activeOrder.status);
  const isCancelled = activeOrder.status === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation and Order Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBackToOrders}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-amber-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </button>

        {orders.length > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500">Track another order:</span>
            <select
              value={activeOrder.id}
              onChange={(e) => {
                const found = orders.find((o) => o.id === e.target.value);
                if (found) {
                  setSearchedOrder(found);
                  if (onSelectOrder) onSelectOrder(found);
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold bg-white text-stone-800"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  Order #{o.id} ({formatOrderStatus(o.status)})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Order Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Ruckyn Antee Popcorn Order Tracking
            </span>
          </div>

          <h1 className="text-2xl font-black text-stone-900 font-display tracking-tight">
            Order #{activeOrder.id}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Placed {new Date(activeOrder.created_at).toLocaleDateString()} at{' '}
            {new Date(activeOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {activeOrder.items.length} items
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left sm:text-right">
            <span className="text-[11px] text-stone-400 block font-semibold">Total Amount</span>
            <span className="text-base font-black text-amber-800">
              {formatNaira(activeOrder.total)}
            </span>
          </div>

          <button
            onClick={() => onViewOrderDetails(activeOrder)}
            className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Status Progress Stepper */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900 font-display">
            Order Status Progression
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
              isCancelled
                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                : activeOrder.status === 'delivered'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            {formatOrderStatus(activeOrder.status)}
          </span>
        </div>

        {isCancelled ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-xs font-semibold">
            <XCircle className="w-6 h-6 shrink-0 text-rose-600" />
            <div>
              <p className="font-bold">This order has been cancelled.</p>
              <p className="text-rose-600 mt-0.5">
                If payment was collected, a full refund has been credited. Contact our support team for assistance.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Desktop Horizontal Stepper */}
            <div className="hidden md:flex items-center justify-between relative">
              {/* Connecting Background Line */}
              <div className="absolute left-6 right-6 top-5 h-1 bg-stone-200 -z-0" />
              {/* Active Progress Line */}
              <div
                className="absolute left-6 top-5 h-1 bg-amber-500 -z-0 transition-all duration-500"
                style={{
                  width: `${(Math.max(0, currentStatusIndex) / (ORDER_STEPS.length - 1)) * 90}%`,
                }}
              />

              {ORDER_STEPS.map((step, idx) => {
                const isPassed = currentStatusIndex >= idx;
                const isCurrent = currentStatusIndex === idx;

                return (
                  <div key={step.status} className="flex flex-col items-center text-center z-10 w-24">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCurrent
                          ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-300 shadow-md scale-110'
                          : isPassed
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-200 text-stone-400'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span
                      className={`text-xs font-bold mt-2 leading-tight ${
                        isCurrent
                          ? 'text-amber-700'
                          : isPassed
                          ? 'text-stone-900'
                          : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile Vertical Stepper */}
            <div className="md:hidden space-y-4 relative pl-4 border-l-2 border-amber-200 ml-3">
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = currentStatusIndex >= idx;
                const isCurrent = currentStatusIndex === idx;

                return (
                  <div key={step.status} className="relative pb-2">
                    <div
                      className={`absolute -left-[23px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        isCurrent
                          ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300'
                          : isPassed
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-200 text-stone-400'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          isCurrent
                            ? 'text-amber-700'
                            : isPassed
                            ? 'text-stone-900'
                            : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p className="text-[11px] text-stone-500">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Courier & Delivery Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-stone-900 font-display">Courier Dispatch</h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Ruckyn Antee Dedicated Popcorn Express Rider
          </p>
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/50 flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700">Need delivery assistance?</span>
            <a
              href="tel:+2348007672676"
              className="text-amber-800 font-bold hover:underline flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" /> Call Dispatch
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-stone-900 font-display">Delivery Address</h3>
          </div>
          <p className="text-xs font-semibold text-stone-800">
            {activeOrder.delivery_address || 'No address provided'}, {activeOrder.delivery_city || ''}
          </p>
          {activeOrder.delivery_notes && (
            <p className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
              <strong>Instructions:</strong> {activeOrder.delivery_notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
