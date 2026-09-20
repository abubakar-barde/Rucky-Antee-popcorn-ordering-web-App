import React from 'react';
import {
  Home,
  Layers,
  ClipboardList,
  ShoppingCart,
  User,
  LayoutDashboard,
  Package,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface CustomerBottomNavProps {
  type: 'customer';
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface AdminBottomNavProps {
  type: 'admin';
  currentTab: string;
  onSelectTab: (tab: string) => void;
  pendingOrdersCount?: number;
}

export type BottomNavigationBarProps = CustomerBottomNavProps | AdminBottomNavProps;

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = (props) => {
  const { user, setShowAuthModal, setAuthModalTab } = useAuth();
  const { totalItemCount } = useCart();

  // ----------------------------------------------------
  // CUSTOMER BOTTOM NAVIGATION (Glassmorphism + Gold Accents)
  // ----------------------------------------------------
  if (props.type === 'customer') {
    const { currentPage, onNavigate } = props;

    const isHomeActive = currentPage === 'home';
    const isMenuActive = currentPage === 'menu' || currentPage === 'product-details';
    const isOrdersActive =
      currentPage === 'my-orders' ||
      currentPage === 'order-details' ||
      currentPage === 'tracking';
    const isCartActive =
      currentPage === 'cart' ||
      currentPage === 'checkout' ||
      currentPage === 'order-confirmation';
    const isAccountActive = currentPage === 'profile';

    const customerItems = [
      {
        id: 'home',
        label: 'Home',
        icon: <Home className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />,
        isActive: isHomeActive,
        onClick: () => {
          onNavigate('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      },
      {
        id: 'menu',
        label: 'Menu',
        icon: <Layers className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />,
        isActive: isMenuActive,
        onClick: () => {
          onNavigate('menu');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      },
      {
        id: 'my-orders',
        label: 'Orders',
        icon: <ClipboardList className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />,
        isActive: isOrdersActive,
        onClick: () => {
          onNavigate('my-orders');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      },
      {
        id: 'cart',
        label: 'Cart',
        icon: (
          <div className="relative flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />
            {totalItemCount > 0 && (
              <span
                id="bottom-nav-cart-badge"
                className="absolute -top-2 -right-3 bg-amber-500 text-stone-950 font-black text-xs min-w-[20px] h-[20px] px-1.5 rounded-full flex items-center justify-center leading-none shadow-md transition-transform duration-200"
              >
                {totalItemCount}
              </span>
            )}
          </div>
        ),
        isActive: isCartActive,
        onClick: () => {
          onNavigate('cart');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      },
      {
        id: 'account',
        label: 'Account',
        icon: <User className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />,
        isActive: isAccountActive,
        onClick: () => {
          if (user) {
            onNavigate('profile');
          } else {
            setAuthModalTab('login');
            setShowAuthModal(true);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      },
    ];

    return (
      <nav
        id="app-bottom-navigation"
        aria-label="Customer Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-200/70 shadow-2xl pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5"
      >
        <div className="max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-2 sm:px-6">
          <div className="grid grid-cols-5 items-center justify-items-center">
            {customerItems.map((item) => (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={item.onClick}
                className={`w-full flex flex-col items-center justify-center py-1.5 sm:py-2 px-1 sm:px-2 rounded-2xl transition-all duration-200 min-h-[52px] min-w-[56px] group relative focus:outline-none select-none ${
                  item.isActive
                    ? 'text-amber-800 bg-amber-100/70 shadow-xs'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <div
                  className={`relative flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                    item.isActive ? 'scale-105' : ''
                  }`}
                >
                  {item.icon}
                </div>
                <span
                  className={`text-xs sm:text-sm tracking-tight mt-1 leading-tight transition-colors duration-200 whitespace-nowrap ${
                    item.isActive
                      ? 'font-extrabold text-amber-900'
                      : 'font-semibold text-stone-700 group-hover:text-stone-900'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  // ----------------------------------------------------
  // ADMIN BOTTOM NAVIGATION (Glassmorphism + Gold Accents)
  // ----------------------------------------------------
  const { currentTab, onSelectTab, pendingOrdersCount = 0 } = props;

  const isDashboardActive = currentTab === 'dashboard';
  const isOrdersActive = currentTab === 'orders' || currentTab === 'order-details';
  const isProductsActive = currentTab === 'products';
  const isCustomersActive = currentTab === 'customers';
  const isAccountActive = currentTab === 'settings';

  const adminItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />,
      isActive: isDashboardActive,
      onClick: () => {
        onSelectTab('dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: (
        <div className="relative flex items-center justify-center">
          <ClipboardList className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />
          {pendingOrdersCount > 0 && (
            <span
              id="admin-bottom-orders-badge"
              className="absolute -top-2 -right-3 bg-amber-500 text-stone-950 font-black text-xs min-w-[20px] h-[20px] px-1.5 rounded-full flex items-center justify-center leading-none shadow-md transition-transform duration-200"
            >
              {pendingOrdersCount}
            </span>
          )}
        </div>
      ),
      isActive: isOrdersActive,
      onClick: () => {
        onSelectTab('orders');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'products',
      label: 'Products',
      icon: <Package className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />,
      isActive: isProductsActive,
      onClick: () => {
        onSelectTab('products');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <Users className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />,
      isActive: isCustomersActive,
      onClick: () => {
        onSelectTab('customers');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'account',
      label: 'Account',
      icon: <User className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />,
      isActive: isAccountActive,
      onClick: () => {
        onSelectTab('settings');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
  ];

  return (
    <nav
      id="admin-bottom-navigation"
      aria-label="Admin Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-200/70 shadow-2xl pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5"
    >
      <div className="max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-2 sm:px-6">
        <div className="grid grid-cols-5 items-center justify-items-center">
          {adminItems.map((item) => (
            <button
              key={item.id}
              id={`admin-nav-item-${item.id}`}
              onClick={item.onClick}
              className={`w-full flex flex-col items-center justify-center py-1.5 sm:py-2 px-1 sm:px-2 rounded-2xl transition-all duration-200 min-h-[52px] min-w-[56px] group relative focus:outline-none select-none ${
                item.isActive
                  ? 'text-amber-800 bg-amber-100/70 shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <div
                className={`relative flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                  item.isActive ? 'scale-105' : ''
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`text-xs sm:text-sm tracking-tight mt-1 leading-tight transition-colors duration-200 whitespace-nowrap ${
                  item.isActive
                    ? 'font-extrabold text-amber-900'
                    : 'font-semibold text-stone-700 group-hover:text-stone-900'
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
