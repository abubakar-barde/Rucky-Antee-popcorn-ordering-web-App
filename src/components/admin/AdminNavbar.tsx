import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  Radio,
  Store,
  Menu,
  X,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface AdminNavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onSwitchToCustomer: () => void;
  pendingOrdersCount: number;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  currentTab,
  onSelectTab,
  onSwitchToCustomer,
  pendingOrdersCount,
}) => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabaseConnected = isSupabaseConfigured();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      id: 'products',
      label: 'Products',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'sales',
      label: 'Analytics',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isTabActive = (tabId: string) => {
    if (tabId === 'orders') {
      return currentTab === 'orders' || currentTab === 'order-details';
    }
    return currentTab === tabId;
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-stone-950/95 backdrop-blur-md border-b border-stone-800 text-stone-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Branding & Desktop Nav Tabs */}
            <div className="flex items-center gap-6 lg:gap-8">
              {/* Brand / Logo */}
              <button
                onClick={() => handleTabClick('dashboard')}
                className="flex items-center gap-2.5 text-left group"
                title="Ruckyn Antee Admin Portal"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
                  🍿
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-extrabold text-base sm:text-lg text-white tracking-tight leading-none">
                      Ruckyn Antee
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500 text-stone-950 uppercase tracking-wide">
                      Admin
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-400/90 tracking-wider uppercase block mt-0.5">
                    Operations Portal
                  </span>
                </div>
              </button>

              {/* Desktop Horizontal Navigation Tabs */}
              <nav
                className="hidden md:flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800"
                aria-label="Admin Navigation"
              >
                {navItems.map((item) => {
                  const active = isTabActive(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        active
                          ? 'bg-amber-500 text-stone-950 shadow-xs'
                          : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className={`min-w-4 h-4 px-1 rounded-full text-[10px] font-black flex items-center justify-center ${
                            active
                              ? 'bg-stone-950 text-amber-400'
                              : 'bg-amber-500 text-stone-950'
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

            {/* Right: Realtime status, Kitchen toggle, Customer store link & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Kitchen Toggle (Desktop) */}
              <button
                onClick={() => setStoreOpen(!storeOpen)}
                className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  storeOpen
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                    : 'bg-rose-950/60 text-rose-300 border-rose-800/80'
                }`}
                title="Toggle Store Orders"
              >
                <Store className="w-3.5 h-3.5" />
                <span>{storeOpen ? 'Kitchen: Live' : 'Kitchen: Paused'}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    storeOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                />
              </button>

              {/* Supabase Live Indicator (Desktop) */}
              <div
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-[11px] font-medium text-stone-300"
                title="Supabase Database Status"
              >
                <Radio
                  className={`w-3.5 h-3.5 ${
                    supabaseConnected
                      ? 'text-emerald-400 animate-pulse'
                      : 'text-amber-400'
                  }`}
                />
                <span>Realtime</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    supabaseConnected ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
              </div>

              {/* Switch to Customer Store Button */}
              <button
                onClick={onSwitchToCustomer}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 text-stone-200 hover:text-amber-400 text-xs font-bold transition-all shadow-xs"
                title="View Customer Popcorn Store"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>View Store</span>
              </button>

              {/* Admin Profile & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-xs font-semibold text-stone-200 transition-colors"
                  aria-label="Admin Profile Menu"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-stone-950 font-black flex items-center justify-center text-xs">
                    {user?.full_name?.charAt(0) || 'A'}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate">
                    {user?.full_name?.split(' ')[0] || 'Admin'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-stone-900 rounded-xl shadow-xl border border-stone-800 py-1.5 z-50 text-stone-200">
                    <div className="px-3.5 py-2.5 border-b border-stone-800">
                      <p className="text-xs font-bold text-white truncate">
                        {user?.full_name || 'Store Administrator'}
                      </p>
                      <p className="text-[11px] text-stone-400 truncate">{user?.email}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500 text-stone-950 uppercase">
                          Admin Role
                        </span>
                        <span className="text-[10px] text-stone-400">Store Manager</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSwitchToCustomer();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-stone-300 hover:bg-stone-800 hover:text-white flex items-center gap-2 font-medium transition-colors"
                    >
                      <Store className="w-4 h-4 text-stone-400" />
                      Switch to Customer Store
                    </button>

                    <button
                      onClick={() => {
                        handleTabClick('settings');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-stone-300 hover:bg-stone-800 hover:text-white flex items-center gap-2 font-medium transition-colors"
                    >
                      <Settings className="w-4 h-4 text-stone-400" />
                      Settings
                    </button>

                    <div className="border-t border-stone-800 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          signOut();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 flex items-center gap-2 font-bold transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                aria-label="Toggle Admin Navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-800 bg-stone-950 px-4 py-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="pb-2 mb-2 border-b border-stone-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white truncate">
                  {user?.full_name || 'Admin'}
                </p>
                <p className="text-[11px] text-stone-400 truncate">{user?.email}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-stone-950 uppercase">
                Admin
              </span>
            </div>

            {/* Links */}
            {navItems.map((item) => {
              const active = isTabActive(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    active
                      ? 'bg-amber-500 text-stone-950'
                      : 'text-stone-300 hover:text-white hover:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`min-w-5 h-5 px-1.5 rounded-full text-xs font-black flex items-center justify-center ${
                        active
                          ? 'bg-stone-950 text-amber-400'
                          : 'bg-amber-500 text-stone-950'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Action buttons on mobile */}
            <div className="pt-2 mt-2 border-t border-stone-800 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSwitchToCustomer();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-bold border border-stone-800"
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span>View Customer App</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-bold border border-rose-900/60"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
