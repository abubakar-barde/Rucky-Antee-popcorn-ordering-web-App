import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  ShoppingBag,
  User,
  Compass,
  History,
  Menu,
  X,
  Shield,
  MapPin,
  ChevronDown,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { BottomNavigationBar } from '../navigation/BottomNavigationBar';

interface CustomerNavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const CustomerNavbar: React.FC<CustomerNavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, role, signOut, setShowAuthModal, setAuthModalTab } = useAuth();
  const { totalItemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdown(false);
      }
    };
    if (profileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdown]);

  // Main Desktop & Mobile Links
  const navLinks = [
    {
      id: 'home',
      label: 'Home',
      isActive: currentPage === 'home',
      action: () => onNavigate('home'),
    },
    {
      id: 'menu',
      label: 'Menu / Shop',
      isActive: currentPage === 'menu' || currentPage === 'product-details',
      action: () => onNavigate('menu'),
    },
    {
      id: 'my-orders',
      label: 'My Orders',
      isActive:
        currentPage === 'my-orders' ||
        currentPage === 'order-details' ||
        currentPage === 'tracking',
      action: () => onNavigate('my-orders'),
    },
    {
      id: 'cart',
      label: 'Cart',
      isActive:
        currentPage === 'cart' ||
        currentPage === 'checkout' ||
        currentPage === 'order-confirmation',
      action: () => onNavigate('cart'),
      badge: totalItemCount > 0 ? totalItemCount : undefined,
    },
  ];

  const handleMobileNav = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Branding */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center gap-2.5 text-left group"
                title="Ruckyn Antee Popcorn - Home"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
                  🍿
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block leading-none">
                    Hand-Crafted
                  </span>
                  <span className="font-display font-extrabold text-lg sm:text-xl text-stone-900 tracking-tight leading-tight block">
                    Ruckyn Antee <span className="text-amber-500 font-normal">Popcorn</span>
                  </span>
                </div>
              </button>
            </div>

            {/* Desktop Horizontal Navigation Links */}
            <div
              className="hidden md:flex items-center gap-1 bg-stone-100/80 p-1 rounded-xl border border-stone-200/70"
              aria-label="Main Navigation"
            >
              {navLinks.map((link) => {
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      link.action();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      link.isActive
                        ? 'bg-white text-amber-700 shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge !== undefined && (
                      <span
                        className={`min-w-4 h-4 px-1 rounded-full text-[10px] font-black flex items-center justify-center leading-none ${
                          link.isActive
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-800 text-white'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Location, Notifications, Cart Drawer & User Profile / Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Delivery Location pill (Desktop) */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-stone-600 bg-amber-50/60 px-3 py-1.5 rounded-full border border-amber-200/60">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate max-w-[130px] font-medium">
                  {user?.default_city || 'Metro Express'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-emerald-700 font-semibold text-[11px]">Hot & Fresh</span>
              </div>

              {/* Notification Bell */}
              <NotificationBell />

              {/* Cart Drawer Trigger Button */}
              <button
                id="header-cart-button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold transition-all shadow-xs flex items-center gap-2"
                aria-label={`View Cart with ${totalItemCount} items`}
                title="Open Cart Drawer"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="hidden sm:inline text-xs font-extrabold">Cart</span>
                {totalItemCount > 0 && (
                  <span className="min-w-5 h-5 px-1 bg-stone-950 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center leading-none">
                    {totalItemCount}
                  </span>
                )}
              </button>

              {/* User profile dropdown or Sign-In button */}
              {user ? (
                <div className="flex items-center gap-1.5">
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setProfileDropdown(!profileDropdown)}
                      className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all text-xs font-semibold ${
                        currentPage === 'profile'
                          ? 'border-amber-500 bg-amber-50/50 text-amber-900 shadow-xs'
                          : 'border-stone-200 hover:border-amber-400 bg-white text-stone-800'
                      }`}
                      aria-label="Account Menu"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      <span className="hidden sm:inline max-w-[90px] truncate">
                        {user.full_name?.split(' ')[0] || 'Account'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                    </button>

                    {profileDropdown && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-3.5 py-2.5 border-b border-stone-100">
                          <p className="text-xs font-bold text-stone-900 truncate">
                            {user.full_name}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                            {user.role}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            onNavigate('profile');
                            setProfileDropdown(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2 font-medium transition-colors ${
                            currentPage === 'profile'
                              ? 'bg-amber-50 text-amber-800 font-bold'
                              : 'text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <User className="w-4 h-4 text-stone-400" />
                          Account / Profile
                        </button>

                        <button
                          onClick={() => {
                            onNavigate('my-orders');
                            setProfileDropdown(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2 font-medium transition-colors ${
                            currentPage === 'my-orders'
                              ? 'bg-amber-50 text-amber-800 font-bold'
                              : 'text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <History className="w-4 h-4 text-stone-400" />
                          My Orders & Receipts
                        </button>

                        {/* STRICT: Only show Admin link if authenticated user role is strictly 'admin' */}
                        {role === 'admin' && (
                          <button
                            onClick={() => {
                              onNavigate('admin');
                              setProfileDropdown(false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs text-amber-800 font-bold hover:bg-amber-100/70 flex items-center gap-2 border-t border-stone-100 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-amber-600" />
                            Open Admin Portal
                          </button>
                        )}

                        <div className="border-t border-stone-100 mt-1 pt-1">
                          <button
                            onClick={() => {
                              setProfileDropdown(false);
                              signOut();
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Desktop Quick Logout Button */}
                  <button
                    onClick={signOut}
                    className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-rose-300 hover:bg-rose-50 text-stone-600 hover:text-rose-700 text-xs font-semibold transition-colors"
                    title="Sign Out / Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalTab('login');
                    setShowAuthModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500 bg-amber-50/60 hover:bg-amber-500 text-amber-900 hover:text-stone-950 text-xs font-bold transition-all shadow-2xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Account / Sign In</span>
                </button>
              )}

              {/* Mobile Menu Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-amber-100 bg-white px-4 pt-3 pb-5 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150 shadow-lg">
            {/* User Account State header in mobile menu */}
            {user ? (
              <div className="pb-2.5 mb-2 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-stone-900 truncate">{user.full_name}</p>
                  <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                  {user.role}
                </span>
              </div>
            ) : (
              <div className="pb-2.5 mb-2 border-b border-stone-100">
                <p className="text-xs font-bold text-stone-900 mb-1">
                  Welcome to Ruckyn Antee Popcorn
                </p>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalTab('login');
                    setShowAuthModal(true);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs text-center"
                >
                  Sign In / Register
                </button>
              </div>
            )}

            {/* Mobile Nav Links */}
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleMobileNav(link.action)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                  link.isActive
                    ? 'bg-amber-50 text-amber-800 font-bold'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full text-xs font-black bg-amber-500 text-stone-950 flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </button>
            ))}

            {/* Account / Profile in mobile list */}
            {user && (
              <button
                onClick={() =>
                  handleMobileNav(() => {
                    onNavigate('profile');
                  })
                }
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] flex items-center gap-2 ${
                  currentPage === 'profile'
                    ? 'bg-amber-50 text-amber-800 font-bold'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <User className="w-4 h-4 text-stone-400" />
                <span>Account / Profile</span>
              </button>
            )}

            {/* STRICT: Only show Admin Portal if authenticated user role is strictly 'admin' */}
            {role === 'admin' && (
              <button
                onClick={() =>
                  handleMobileNav(() => {
                    onNavigate('admin');
                  })
                }
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-amber-800 bg-amber-100/70 mt-2 flex items-center gap-2 min-h-[44px]"
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Open Admin Portal</span>
              </button>
            )}

            {/* Logout button in mobile menu */}
            {user && (
              <div className="pt-2 mt-2 border-t border-stone-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Premium Fixed Bottom Navigation Bar matching visual reference */}
      <BottomNavigationBar
        type="customer"
        currentPage={currentPage}
        onNavigate={onNavigate}
      />
    </>
  );
};
