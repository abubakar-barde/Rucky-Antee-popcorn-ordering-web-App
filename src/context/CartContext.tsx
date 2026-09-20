import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, PopcornProduct, ProductSize } from '../types';
import { FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE } from '../lib/currency';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: PopcornProduct, size?: ProductSize, quantity?: number, seasoning?: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  totalItemCount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_SESSION_STORAGE_KEY = 'ruckyn_antee_customer_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = sessionStorage.getItem(CART_SESSION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to sessionStorage to persist during the customer session
  useEffect(() => {
    try {
      sessionStorage.setItem(CART_SESSION_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore sessionStorage quota / iframe restrictions
    }
  }, [items]);

  const addToCart = (
    product: PopcornProduct,
    size?: ProductSize,
    quantity: number = 1,
    seasoning: string = 'Signature Crisp'
  ) => {
    const chosenSize = size || product.sizes[0] || {
      id: 'regular',
      label: 'Regular Bag',
      priceMultiplier: 1.0,
      weight: '65g',
    };

    const calculatedUnitPrice = Number((product.price * chosenSize.priceMultiplier).toFixed(2));
    const itemUniqueKey = `${product.id}-${chosenSize.id}-${seasoning}`;

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === itemUniqueKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: Number((calculatedUnitPrice * newQty).toFixed(2)),
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: itemUniqueKey,
          product,
          selectedSize: chosenSize,
          seasoningLevel: seasoning,
          quantity,
          unitPrice: calculatedUnitPrice,
          totalPrice: Number((calculatedUnitPrice * quantity).toFixed(2)),
        };
        return [...prev, newItem];
      }
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: Number((item.unitPrice * newQuantity).toFixed(2)),
            }
          : item
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('ruckyn_antee_store_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          deliveryFee: Number(parsed.deliveryFee) || STANDARD_DELIVERY_FEE,
          freeDeliveryThreshold: Number(parsed.freeDeliveryThreshold) || FREE_DELIVERY_THRESHOLD,
        };
      }
    } catch {}
    return {
      deliveryFee: STANDARD_DELIVERY_FEE,
      freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    };
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('ruckyn_antee_store_settings_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          setStoreSettings({
            deliveryFee: Number(parsed.deliveryFee) || STANDARD_DELIVERY_FEE,
            freeDeliveryThreshold: Number(parsed.freeDeliveryThreshold) || FREE_DELIVERY_THRESHOLD,
          });
        }
      } catch {}
    };

    window.addEventListener('store_settings_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('store_settings_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const totalItemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = Number(items.reduce((acc, curr) => acc + curr.totalPrice, 0).toFixed(2));
  
  // Delivery fee based on store settings
  const effectiveDeliveryFee = storeSettings.deliveryFee;
  const effectiveFreeThreshold = storeSettings.freeDeliveryThreshold;
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= effectiveFreeThreshold ? 0 : effectiveDeliveryFee;
  const discount = 0;
  const total = Number((subtotal + deliveryFee - discount).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemCount,
        subtotal,
        deliveryFee,
        discount,
        total,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
