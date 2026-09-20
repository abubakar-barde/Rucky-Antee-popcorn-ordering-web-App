export type UserRole = 'customer' | 'admin';

// Matches Supabase 'profiles' table: id, full_name, phone, role, created_at, updated_at
export interface UserProfile {
  id: string; // references auth.users id
  full_name: string;
  phone?: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
  email?: string; // retrieved from auth.users session
  default_address?: string;
  default_city?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export const formatOrderStatus = (status: OrderStatus | string): string => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'preparing':
      return 'Preparing';
    case 'ready':
      return 'Ready';
    case 'out_for_delivery':
      return 'Out for Delivery';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

export type PaymentMethod =
  | 'Card'
  | 'Cash on Delivery'
  | 'Mobile Transfer'
  | 'Apple Pay / Google Pay'
  | string;

export type PopcornCategory =
  | 'Sweet'
  | 'Savory'
  | 'Spicy'
  | 'Specialty'
  | 'Cheese'
  | string;

export interface ProductSize {
  id: string;
  label: string;
  priceMultiplier: number;
  weight: string;
  priceModifier?: number;
}

// Matches Supabase 'products' table: id, name, description, price, image_url, category, is_available, created_at, updated_at
export interface PopcornProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
  // UI helpers & display properties
  sizes: ProductSize[];
  calories?: string;
  tags?: string[];
  ingredients?: string[];
  rating?: number;
  reviews_count?: number;
  is_featured?: boolean;
  spiciness_level?: number;
}

// Matches Supabase 'order_items' table: id, order_id, product_id, product_name, quantity, unit_price, subtotal, created_at
export interface OrderItem {
  id: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at?: string;
  // UI helpers
  total_price?: number;
  product_image?: string;
  size?: string;
  seasoning?: string;
}

// Matches Supabase 'orders' table: id, customer_id, status, subtotal, delivery_fee, total, delivery_address, phone, payment_method, notes, created_at, updated_at
export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_address: string;
  phone: string;
  payment_method: PaymentMethod;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  // UI helpers & display properties
  user_id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  delivery_notes?: string;
  delivery_city: string;
  payment_status?: 'Paid' | 'Unpaid';
  discount: number;
  estimated_delivery?: string;
}

export interface CartItem {
  id: string;
  product: PopcornProduct;
  selectedSize: ProductSize;
  seasoningLevel: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
