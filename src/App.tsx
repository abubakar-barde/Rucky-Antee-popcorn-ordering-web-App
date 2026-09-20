import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider, useOrders } from './context/OrderContext';
import { PopcornProduct, Order } from './types';

// Common Components
import { DemoRoleBar } from './components/common/DemoRoleBar';
import { RealtimeAlertToast } from './components/common/RealtimeAlertToast';
import { AuthModal } from './components/auth/AuthModal';

// Customer Components
import { CustomerNavbar } from './components/customer/CustomerNavbar';
import { CustomerFooter } from './components/customer/CustomerFooter';
import { CartDrawer } from './components/customer/CartDrawer';
import { HomePage } from './components/customer/HomePage';
import { MenuPage } from './components/customer/MenuPage';
import { ProductDetailsPage } from './components/customer/ProductDetailsPage';
import { CartPage } from './components/customer/CartPage';
import { CheckoutPage } from './components/customer/CheckoutPage';
import { OrderConfirmationPage } from './components/customer/OrderConfirmationPage';
import { MyOrdersPage } from './components/customer/MyOrdersPage';
import { OrderDetailsPage } from './components/customer/OrderDetailsPage';
import { OrderTrackingPage } from './components/customer/OrderTrackingPage';
import { ProfilePage } from './components/customer/ProfilePage';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout';

export type CustomerPage =
  | 'home'
  | 'menu'
  | 'product-details'
  | 'cart'
  | 'checkout'
  | 'order-confirmation'
  | 'my-orders'
  | 'order-details'
  | 'tracking'
  | 'profile';

function MainApp() {
  const { role } = useAuth();
  const { orders, products } = useOrders();

  // Role experience toggle: 'customer' | 'admin'
  const [activeExperience, setActiveExperience] = useState<'customer' | 'admin'>('customer');

  // Customer navigation state
  const [currentPage, setCurrentPage] = useState<CustomerPage>('home');
  const [selectedProduct, setSelectedProduct] = useState<PopcornProduct | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Sync activeExperience if user is logged in as customer or admin
  useEffect(() => {
    // If user's role is strictly customer, keep them in customer view
    if (role === 'customer' && activeExperience === 'admin') {
      setActiveExperience('customer');
    }
    // If user's role is admin, force them to admin view
    // if (role === 'admin' && activeExperience === 'customer') {
    //   setActiveExperience('admin');
    // }
  }, [role, activeExperience]);

  // Handler to open product details
  const handleSelectProduct = (product: PopcornProduct) => {
    setSelectedProduct(product);
    setCurrentPage('product-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler to open order tracking
  const handleTrackOrder = (order: Order) => {
    setSelectedOrder(order);
    setCurrentPage('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler to open order receipt/details
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setCurrentPage('order-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler after successful checkout
  const handleOrderSuccess = (order: Order) => {
    setSelectedOrder(order);
    setCurrentPage('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-900 antialiased selection:bg-amber-400 selection:text-stone-950">
      {/* Top Demo & Role Switcher Bar */}
      <DemoRoleBar
        currentView={activeExperience}
        onSwitchView={(exp) => setActiveExperience(exp)}
      />

      {/* Realtime Toast Notifications for live order status changes & new orders */}
      <RealtimeAlertToast />

      {/* Auth Modal */}
      <AuthModal
        onSuccess={(newRole) => {
          if (newRole === 'admin') {
            setActiveExperience('admin');
          }
        }}
      />

      {/* CART DRAWER */}
      <CartDrawer
        onCheckout={() => {
          setCurrentPage('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onViewCartPage={() => {
          setCurrentPage('cart');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* EXPERIENCE ROUTING: ADMIN vs CUSTOMER */}
      {activeExperience === 'admin' && role === 'admin' ? (
        <AdminLayout onSwitchToCustomer={() => setActiveExperience('customer')} />
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Customer Navigation Bar */}
          <CustomerNavbar
            currentPage={currentPage}
            onNavigate={(page) => {
              if (page === 'admin') {
                setActiveExperience('admin');
              } else {
                setCurrentPage(page as CustomerPage);
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Customer Main Page View */}
          <main className="flex-1 pb-28 sm:pb-32">
            {currentPage === 'home' && (
              <HomePage
                products={products}
                onSelectProduct={handleSelectProduct}
                onNavigateToMenu={() => {
                  setCurrentPage('menu');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentPage === 'menu' && (
              <MenuPage
                products={products}
                onSelectProduct={handleSelectProduct}
              />
            )}

            {currentPage === 'product-details' && selectedProduct && (
              <ProductDetailsPage
                product={selectedProduct}
                onBack={() => {
                  setCurrentPage('menu');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onViewCart={() => {
                  setCurrentPage('cart');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentPage === 'cart' && (
              <CartPage
                onContinueShopping={() => {
                  setCurrentPage('menu');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onProceedToCheckout={() => {
                  setCurrentPage('checkout');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentPage === 'checkout' && (
              <CheckoutPage
                onBackToCart={() => {
                  setCurrentPage('cart');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOrderSuccess={handleOrderSuccess}
              />
            )}

            {currentPage === 'order-confirmation' && selectedOrder && (
              <OrderConfirmationPage
                order={selectedOrder}
                onTrackOrder={handleTrackOrder}
                onContinueShopping={() => {
                  setCurrentPage('menu');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentPage === 'my-orders' && (
              <MyOrdersPage
                onTrackOrder={handleTrackOrder}
                onViewOrderDetails={handleViewOrderDetails}
                onBrowseMenu={() => {
                  setCurrentPage('menu');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentPage === 'order-details' && selectedOrder && (
              <OrderDetailsPage
                order={selectedOrder}
                onBack={() => {
                  setCurrentPage('my-orders');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onTrack={handleTrackOrder}
              />
            )}

            {currentPage === 'tracking' && (
              <OrderTrackingPage
                order={selectedOrder}
                orders={orders}
                onSelectOrder={(ord) => setSelectedOrder(ord)}
                onBackToOrders={() => {
                  setCurrentPage('my-orders');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onViewOrderDetails={handleViewOrderDetails}
                onBrowseMenu={() => {
                  setCurrentPage('menu');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentPage === 'profile' && (
              <ProfilePage
                onBrowseMenu={() => {
                  setCurrentPage('menu');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAdmin={() => setActiveExperience('admin')}
              />
            )}
          </main>

          {/* Customer Footer */}
          <CustomerFooter
            onNavigate={(page) => {
              if (page === 'admin') {
                setActiveExperience('admin');
              } else {
                setCurrentPage(page as CustomerPage);
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}
    </div>
  );
}

import { NotificationsProvider } from './context/NotificationsContext';
import { ThemeProvider } from './context/ThemeContext';
// ... rest of imports

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OrderProvider>
          <CartProvider>
            <NotificationsProvider>
              <MainApp />
            </NotificationsProvider>
          </CartProvider>
        </OrderProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
