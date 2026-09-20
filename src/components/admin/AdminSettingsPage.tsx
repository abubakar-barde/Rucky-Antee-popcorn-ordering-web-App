import React, { useState } from 'react';
import {
  Store,
  Clock,
  Truck,
  ShieldCheck,
  Bell,
  Mail,
  MapPin,
  Check,
  Sliders,
  UserCheck,
  Sparkles,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  // Store operational settings state
  const [storeName, setStoreName] = useState(() => {
    try {
      const saved = localStorage.getItem('ruckyn_antee_store_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.storeName || 'Ruckyn Antee Popcorn';
      }
    } catch {}
    return 'Ruckyn Antee Popcorn';
  });
  const [deliveryFee, setDeliveryFee] = useState(() => {
    try {
      const saved = localStorage.getItem('ruckyn_antee_store_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.deliveryFee || '1500';
      }
    } catch {}
    return '1500';
  });
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(() => {
    try {
      const saved = localStorage.getItem('ruckyn_antee_store_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.freeDeliveryThreshold || '15000';
      }
    } catch {}
    return '15000';
  });
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(() => {
    try {
      const saved = localStorage.getItem('ruckyn_antee_store_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.prepTimeMinutes || '15-25 mins';
      }
    } catch {}
    return '15-25 mins';
  });
  const [contactEmail, setContactEmail] = useState(() => {
    try {
      const saved = localStorage.getItem('ruckyn_antee_store_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.contactEmail || 'orders@ruckynpopcorn.com';
      }
    } catch {}
    return 'orders@ruckynpopcorn.com';
  });
  const [supportPhone, setSupportPhone] = useState(() => {
    try {
      const saved = localStorage.getItem('ruckyn_antee_store_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.supportPhone || '+234 800 000 7825';
      }
    } catch {}
    return '+234 800 000 7825';
  });
  const [storeAddress, setStoreAddress] = useState(() => {
    try {
      const saved = localStorage.getItem('ruckyn_antee_store_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.storeAddress || 'Plot 12, Gourmet Avenue, Victoria Island, Lagos';
      }
    } catch {}
    return 'Plot 12, Gourmet Avenue, Victoria Island, Lagos';
  });
  const [isStoreOpen, setIsStoreOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('ruckyn_antee_store_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed.isStoreOpen === 'boolean' ? parsed.isStoreOpen : true;
      }
    } catch {}
    return true;
  });
  const [orderAlertSound, setOrderAlertSound] = useState(() => {
    try {
      const saved = localStorage.getItem('ruckyn_antee_store_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed.orderAlertSound === 'boolean' ? parsed.orderAlertSound : true;
      }
    } catch {}
    return true;
  });
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('ruckyn_antee_store_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed.autoAcceptOrders === 'boolean' ? parsed.autoAcceptOrders : false;
      }
    } catch {}
    return false;
  });

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = {
      storeName,
      deliveryFee,
      freeDeliveryThreshold,
      prepTimeMinutes,
      contactEmail,
      supportPhone,
      storeAddress,
      isStoreOpen,
      orderAlertSound,
      autoAcceptOrders
    };
    try {
      localStorage.setItem('ruckyn_antee_store_settings_v1', JSON.stringify(settings));
      window.dispatchEvent(new Event('store_settings_updated'));
    } catch {}
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 2500);
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
          Admin Settings & Operations
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Manage store operational parameters, kitchen delivery rules, and administrative preferences for Ruckyn Antee Popcorn.
        </p>
      </div>

      {savedSettingsNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-2xl flex items-center gap-2.5 font-medium shadow-xs">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          Store operations and administrative settings saved successfully.
        </div>
      )}

      {/* Store Operations & General Parameters Form */}
      <form onSubmit={handleSaveStoreSettings} className="space-y-6">
        
        {/* General Store & Contact Information */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-display">
                Store Identity & Contact Information
              </h3>
              <p className="text-xs text-stone-500">
                Primary business details displayed across customer receipts and invoices.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">Store / Business Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">Support / Order Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">Customer Support Phone</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">Kitchen / Fulfillment Address</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery & Fulfillment Parameters */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-display">
                Delivery & Kitchen Fulfillment
              </h3>
              <p className="text-xs text-stone-500">
                Configure delivery fees, free delivery thresholds, and kettle popping times.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">Standard Delivery Fee (₦)</label>
              <input
                type="text"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                Free Delivery Threshold (₦)
              </label>
              <input
                type="text"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">Estimated Popping Time</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={prepTimeMinutes}
                  onChange={(e) => setPrepTimeMinutes(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operational Toggles & Notification Preferences */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-display">
                Kitchen Operations & Alerts
              </h3>
              <p className="text-xs text-stone-500">
                Manage live ordering status, notification sounds, and automatic order processing.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-stone-900 block">Kitchen Store Status</span>
                <span className="text-xs text-stone-500 block">
                  When open, customers can place new orders. When closed, orders are temporarily paused.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsStoreOpen(!isStoreOpen)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isStoreOpen
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs'
                    : 'bg-stone-200 text-stone-700 border border-stone-300'
                }`}
              >
                {isStoreOpen ? 'Store is Open' : 'Store is Closed'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-stone-900 block">New Order Alert Sound</span>
                <span className="text-xs text-stone-500 block">
                  Play an audible alert chime when a new customer order arrives in the dashboard.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOrderAlertSound(!orderAlertSound)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  orderAlertSound
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                    : 'bg-stone-200 text-stone-700 border border-stone-300'
                }`}
              >
                {orderAlertSound ? 'Sound Enabled' : 'Sound Muted'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-stone-900 block">Auto-Accept New Orders</span>
                <span className="text-xs text-stone-500 block">
                  Automatically transition paid orders to "Preparing" status immediately upon checkout.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAutoAcceptOrders(!autoAcceptOrders)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  autoAcceptOrders
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'bg-stone-200 text-stone-700 border border-stone-300'
                }`}
              >
                {autoAcceptOrders ? 'Auto-Accept ON' : 'Manual Review'}
              </button>
            </div>
          </div>
        </div>

        {/* Administrator Role & Security Summary */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-stone-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-display">
                Administrator Privileges & Security
              </h3>
              <p className="text-xs text-stone-500">
                Your account is authorized with application administrator privileges for Ruckyn Antee Popcorn.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs text-stone-700">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-amber-600" />
              <span>Role: <strong className="text-stone-900 font-semibold uppercase tracking-wider">Application Administrator</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-500 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Full Store Management Access</span>
            </div>
          </div>
        </div>

        {/* Save Changes Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all"
          >
            Save Operations Settings
          </button>
        </div>
      </form>
    </div>
  );
};
