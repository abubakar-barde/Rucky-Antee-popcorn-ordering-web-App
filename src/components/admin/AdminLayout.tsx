import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { Order } from '../../types';
import { AdminNavbar } from './AdminNavbar';
import { BottomNavigationBar } from '../navigation/BottomNavigationBar';
import { AdminDashboardPage } from './AdminDashboardPage';
import { AdminOrdersPage } from './AdminOrdersPage';
import { AdminOrderDetailsPage } from './AdminOrderDetailsPage';
import { AdminProductsPage } from './AdminProductsPage';
import { AdminCustomersPage } from './AdminCustomersPage';
import { AdminSalesPage } from './AdminSalesPage';
import { AdminSettingsPage } from './AdminSettingsPage';

interface AdminLayoutProps {
  onSwitchToCustomer: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onSwitchToCustomer }) => {
  const { orders } = useOrders();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  const handleOpenOrder = (order: Order) => {
    setSelectedOrder(order);
    setCurrentTab('order-details');
  };

  const handleBackToOrders = () => {
    setSelectedOrder(null);
    setCurrentTab('orders');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 font-sans text-stone-900 pb-16 md:pb-0">
      {/* Horizontal Top Navigation Bar for Admin */}
      <AdminNavbar
        currentTab={currentTab === 'order-details' ? 'orders' : currentTab}
        onSelectTab={(tab) => {
          setSelectedOrder(null);
          setCurrentTab(tab);
        }}
        onSwitchToCustomer={onSwitchToCustomer}
        pendingOrdersCount={pendingOrdersCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {currentTab === 'dashboard' && (
          <AdminDashboardPage
            onViewOrders={() => setCurrentTab('orders')}
            onOpenOrderDetails={handleOpenOrder}
            onViewProducts={() => setCurrentTab('products')}
          />
        )}

        {currentTab === 'orders' && (
          <AdminOrdersPage onOpenOrder={handleOpenOrder} />
        )}

        {currentTab === 'order-details' && selectedOrder && (
          <AdminOrderDetailsPage order={selectedOrder} onBack={handleBackToOrders} />
        )}

        {currentTab === 'products' && <AdminProductsPage />}

        {currentTab === 'customers' && <AdminCustomersPage />}

        {currentTab === 'sales' && <AdminSalesPage />}

        {currentTab === 'settings' && <AdminSettingsPage />}
      </main>
    </div>
  );
};

