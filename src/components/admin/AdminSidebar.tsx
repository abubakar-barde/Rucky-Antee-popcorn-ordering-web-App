import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  Settings,
  ArrowLeft,
  Shield,
  Sparkles,
} from 'lucide-react';

interface AdminSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onSwitchToCustomer: () => void;
  pendingOrdersCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  onSwitchToCustomer,
  pendingOrdersCount,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'orders',
      label: 'Orders Management',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    { id: 'products', label: 'Popcorn Products', icon: <Package className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { id: 'sales', label: 'Sales & Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'settings', label: 'Store & Supabase', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col justify-between border-r border-stone-800 shrink-0 min-h-[calc(100vh-45px)]">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-lg shadow-sm">
              🍿
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-sm text-white tracking-tight">
                  Ruckyn Antee
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500 text-stone-950 uppercase">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium">Business Operations</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-stone-950 text-amber-400' : 'bg-amber-500 text-stone-950'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Switch back to Customer */}
      <div className="p-4 border-t border-stone-800 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-stone-800/60 border border-stone-700/60 text-[11px] text-stone-400">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Supabase Realtime</span>
          </div>
          Listening for order events
        </div>

        <button
          onClick={onSwitchToCustomer}
          className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> View Customer App
        </button>
      </div>
    </aside>
  );
};
