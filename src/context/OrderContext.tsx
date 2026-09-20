import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus, PopcornProduct, formatOrderStatus } from '../types';
import { OrdersService, ProductsService } from '../lib/supabaseService';
import { useAuth } from './AuthContext';
import { formatNaira } from '../lib/currency';

interface OrderContextType {
  orders: Order[];
  products: PopcornProduct[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  isLoading: boolean;
  createOrder: (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  clearAllOrders: () => Promise<boolean>;
  refreshOrders: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  createProduct: (product: Omit<PopcornProduct, 'id'>) => Promise<PopcornProduct>;
  updateProduct: (id: string, updates: Partial<PopcornProduct>) => Promise<PopcornProduct | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  lastRealtimeAlert: { message: string; timestamp: number } | null;
  clearRealtimeAlert: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<PopcornProduct[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRealtimeAlert, setLastRealtimeAlert] = useState<{ message: string; timestamp: number } | null>(null);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedOrders, fetchedProducts] = await Promise.all([
        OrdersService.getAll(),
        ProductsService.getAll(),
      ]);
      setOrders(fetchedOrders);
      setProducts(fetchedProducts);

      // If active order is set, keep it refreshed
      if (activeOrder) {
        const found = fetchedOrders.find((o) => o.id === activeOrder.id);
        if (found) setActiveOrder(found);
      }
    } catch (err) {
      console.error('Error fetching initial orders & products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrder]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Supabase Realtime Orders Subscription
  useEffect(() => {
    console.log('OrderContext: Setting up order subscription');
    const unsubscribe = OrdersService.subscribe((updatedOrders) => {
      console.log('OrderContext: Received updated orders from subscription, count:', updatedOrders.length);
      setOrders((prev) => {
        // Check if there is a newly added order
        if (updatedOrders.length > prev.length && prev.length > 0) {
          const newest = updatedOrders[0];
          setLastRealtimeAlert({
            message: `New Order Received! #${newest.id} by ${newest.customer_name || 'Customer'} (${formatNaira(newest.total)})`,
            timestamp: Date.now(),
          });
        }
        return updatedOrders;
      });

      // Update active order live if its status changed
      setActiveOrder((current) => {
        if (!current) return null;
        const updated = updatedOrders.find((o) => o.id === current.id);
        if (updated && updated.status !== current.status) {
          setLastRealtimeAlert({
            message: `Order #${updated.id} status updated to: ${formatOrderStatus(updated.status)}`,
            timestamp: Date.now(),
          });
          return updated;
        }
        return updated || current;
      });
    });

    return () => {
      console.log('OrderContext: Cleaning up order subscription');
      unsubscribe();
    };
  }, []);

  // Supabase Realtime Products Subscription
  useEffect(() => {
    const unsubscribeProducts = ProductsService.subscribe((updatedProducts) => {
      setProducts(updatedProducts);
    });

    return () => {
      unsubscribeProducts();
    };
  }, []);

  const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> => {
    const placedOrder = await OrdersService.create(orderData);
    setActiveOrder(placedOrder);
    return placedOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    const updated = await OrdersService.updateStatus(orderId, status);
    if (updated) {
      if (activeOrder?.id === orderId) {
        setActiveOrder(updated);
      }
      return true;
    }
    return false;
  };

  const clearAllOrders = async (): Promise<boolean> => {
    await OrdersService.deleteAll();
    setOrders([]);
    setActiveOrder(null);
    return true;
  };

  const refreshOrders = async () => {
    const fetched = await OrdersService.getAll();
    setOrders(fetched);
  };

  const refreshProducts = async () => {
    const fetched = await ProductsService.getAll();
    setProducts(fetched);
  };

  const createProduct = async (product: Omit<PopcornProduct, 'id'>): Promise<PopcornProduct> => {
    const created = await ProductsService.create(product);
    setProducts((prev) => [created, ...prev]);
    return created;
  };

  const updateProduct = async (id: string, updates: Partial<PopcornProduct>): Promise<PopcornProduct | null> => {
    const updated = await ProductsService.update(id, updates);
    if (updated) {
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    }
    return updated;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    const success = await ProductsService.delete(id);
    if (success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
    return success;
  };

  const deleteOrder = async (orderId: string): Promise<boolean> => {
    // Optimistically update the UI by setting status to archived
    const previousOrders = [...orders];
    setOrders((prev) => 
      prev.map(o => o.id === orderId ? { ...o, status: 'archived' } : o)
    );
    if (activeOrder?.id === orderId) {
      setActiveOrder({ ...activeOrder, status: 'archived' });
    }

    try {
      const success = await OrdersService.deleteOrder(orderId);
      if (!success) {
        // If operation failed on server, revert the UI state
        setOrders(previousOrders);
        return false;
      }
      return true;
    } catch (err) {
      // If error occurred, revert the UI state
      setOrders(previousOrders);
      console.error('Optimistic soft-delete failed, reverted UI:', err);
      return false;
    }
  };

  const clearRealtimeAlert = () => setLastRealtimeAlert(null);

  return (
    <OrderContext.Provider
      value={{
        orders,
        products,
        activeOrder,
        setActiveOrder,
        isLoading,
        createOrder,
        updateOrderStatus,
        clearAllOrders,
        refreshOrders,
        refreshProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        deleteOrder,
        lastRealtimeAlert,
        clearRealtimeAlert,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
