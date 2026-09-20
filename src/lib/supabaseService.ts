import { supabase, isSupabaseConfigured } from './supabase';
import { PopcornProduct, Order, OrderItem, UserProfile, OrderStatus, UserRole } from '../types';
import { POPCORN_SIZES } from '../data/initialData';

/**
 * Maps Supabase 'orders' and 'order_items' rows to frontend Order interface
 */
function mapOrderFromDb(row: any): Order {
  const items: OrderItem[] = (row.order_items || []).map((it: any) => ({
    id: String(it.id),
    order_id: String(it.order_id),
    product_id: String(it.product_id),
    product_name: it.product_name,
    quantity: Number(it.quantity) || 1,
    unit_price: Number(it.unit_price) || 0,
    subtotal: Number(it.subtotal) || (Number(it.unit_price) * Number(it.quantity)) || 0,
    total_price: Number(it.subtotal) || 0,
    created_at: it.created_at,
  }));

  return {
    id: String(row.id),
    customer_id: String(row.customer_id),
    user_id: String(row.customer_id),
    status: (row.status as OrderStatus) || 'pending',
    subtotal: Number(row.subtotal) || 0,
    delivery_fee: Number(row.delivery_fee) || 0,
    total: Number(row.total) || 0,
    delivery_address: row.delivery_address || '',
    phone: row.phone || '',
    customer_phone: row.phone || '',
    payment_method: row.payment_method || 'Card',
    notes: row.notes || '',
    delivery_notes: row.notes || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
    items,
    // UI helpers
    customer_name: row.customer_name || 'Customer',
    customer_email: row.customer_email || '',
    payment_status: row.payment_status || 'Paid',
    delivery_city: row.delivery_city || 'Local Delivery',
    estimated_delivery: '20-35 mins',
    discount: 0,
  };
}

/**
 * Supabase Products Service
 * Directly interacts with the 'products' table:
 * columns: id, name, description, price, image_url, category, is_available, created_at, updated_at
 */
export const ProductsService = {
  async getAll(): Promise<PopcornProduct[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase products fetch failed:', error);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: String(row.id),
        name: row.name || 'Untitled Popcorn',
        description: row.description || '',
        price: Number(row.price) || 0,
        image_url: row.image_url || '',
        category: row.category || 'Specialty',
        is_available: row.is_available !== false,
        created_at: row.created_at,
        updated_at: row.updated_at,
        sizes: POPCORN_SIZES,
        tags: ['Freshly Popped'],
        ingredients: ['Popped Corn', 'Maldon Salt', 'Vegetable Oil'],
      }));
    } catch (err) {
      console.error('Unexpected error fetching products from Supabase:', err);
      return [];
    }
  },

  async create(product: Omit<PopcornProduct, 'id'>): Promise<PopcornProduct> {
    const payload = {
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
      is_available: product.is_available !== false,
    };

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      sizes: POPCORN_SIZES,
      tags: product.tags || ['Handcrafted'],
    } as PopcornProduct;
  },

  async update(id: string, updates: Partial<PopcornProduct>): Promise<PopcornProduct | null> {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.image_url !== undefined) payload.image_url = updates.image_url;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.is_available !== undefined) payload.is_available = updates.is_available;

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      sizes: updates.sizes || POPCORN_SIZES,
    } as PopcornProduct;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  subscribe(callback: (products: PopcornProduct[]) => void): () => void {
    if (!isSupabaseConfigured()) {
      return () => {};
    }

    const channel = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async () => {
          const updatedProducts = await ProductsService.getAll();
          callback(updatedProducts);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async checkStorageConfiguration(): Promise<{ isConfigured: boolean; bucketName?: string; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { isConfigured: false, error: 'Supabase client is not configured' };
    }

    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) {
        return { isConfigured: false, error: error.message };
      }

      const productBucket = (buckets || []).find(
        (b) => b.name === 'products' || b.name === 'product-images' || b.name === 'popcorn'
      );

      if (productBucket) {
        return { isConfigured: true, bucketName: productBucket.name };
      }

      return {
        isConfigured: false,
        error: buckets && buckets.length > 0
          ? `Storage bucket found (${buckets.map(b => b.name).join(', ')}), but no 'products' or 'product-images' bucket is configured yet.`
          : 'No Supabase Storage buckets exist in this project yet.',
      };
    } catch (err: any) {
      return { isConfigured: false, error: err.message || 'Storage verification failed' };
    }
  },
};

/**
 * Supabase Orders Service
 * Directly interacts with 'orders' and 'order_items' tables:
 * orders columns: id, customer_id, status, subtotal, delivery_fee, total, delivery_address, phone, payment_method, notes, created_at, updated_at
 * order_items columns: id, order_id, product_id, product_name, quantity, unit_price, subtotal, created_at
 */
export const OrdersService = {
  async getAll(): Promise<Order[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase orders fetch error:', error);
        return [];
      }

      return (data || []).map((row: any) => mapOrderFromDb(row));
    } catch (err) {
      console.error('Unexpected error fetching orders from Supabase:', err);
      return [];
    }
  },

  async getByUser(customerId: string): Promise<Order[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase orders by customer error:', error);
        return [];
      }

      return (data || []).map((row: any) => mapOrderFromDb(row));
    } catch (err) {
      console.error('Unexpected error fetching customer orders:', err);
      return [];
    }
  },

  async getById(id: string): Promise<Order | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) return null;
      return mapOrderFromDb(data);
    } catch (err) {
      console.error('Unexpected error fetching order by ID:', err);
      return null;
    }
  },

  async create(orderData: Partial<Order> & { items?: OrderItem[] }): Promise<Order> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.');
    }

    const items = orderData.items || [];
    const p_items = items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    }));

    const { data: createdOrder, error: rpcErr } = await supabase.rpc('create_customer_order', {
      p_items,
      p_delivery_address: orderData.delivery_address || '',
      p_phone: orderData.phone || orderData.customer_phone || '',
      p_payment_method: orderData.payment_method || 'Card',
      p_notes: orderData.notes || orderData.delivery_notes || '',
    });

    if (rpcErr) throw rpcErr;
    if (!createdOrder) throw new Error('Failed to create order');

    // Create notifications
    try {
      // Customer notification
      await NotificationsService.create({
        user_id: createdOrder.customer_id,
        order_id: createdOrder.id,
        title: 'Order Received',
        message: 'Your order has been received successfully.',
        type: 'order_status',
      });
      // Admin notification
      const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
      if (admins) {
        for (const admin of admins) {
          await NotificationsService.create({
            user_id: admin.id,
            order_id: createdOrder.id,
            title: 'New Order',
            message: 'A new customer order has been received.',
            type: 'new_order',
          });
        }
      }
    } catch (err) {
      console.error('Error creating notifications:', err);
    }

    return mapOrderFromDb(createdOrder);
  },

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select('*, order_items(*)')
      .single();

    if (error) {
      console.error('Supabase status update failed:', error);
      return null;
    }

    // Create status update notification
    try {
      console.log('DEBUG: Updating order status, data fetched:', JSON.stringify(data));
      const messages: Record<OrderStatus, string> = {
        pending: 'Your order is pending.',
        confirmed: 'Your order has been confirmed.',
        preparing: 'Your order is now being prepared.',
        ready: 'Your order is ready.',
        out_for_delivery: 'Your order is out for delivery.',
        delivered: 'Your order has been delivered.',
        cancelled: 'Your order has been cancelled.',
      };
      await NotificationsService.create({
        user_id: data.customer_id,
        order_id: data.id,
        title: 'Order Status Update',
        message: messages[status],
        type: 'order_status',
      });
      console.log('DEBUG: Notification created successfully');
    } catch (err) {
      console.error('Error creating notification:', err);
    }

    return mapOrderFromDb(data);
  },

  subscribe(callback: (orders: Order[]) => void): () => void {
    if (!isSupabaseConfigured()) {
      return () => {};
    }

    console.log('Setting up Realtime subscription for public.orders');

    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async (payload) => {
          console.log('Realtime event received for orders:', payload);
          const updatedOrders = await OrdersService.getAll();
          callback(updatedOrders);
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up Realtime subscription for public.orders');
      supabase.removeChannel(channel);
    };
  },
};

/**
 * Supabase Profiles Service
 * Directly interacts with the 'profiles' table:
 * columns: id, full_name, phone, role, created_at, updated_at
 */
export const ProfilesService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;
      return {
        id: data.id,
        full_name: data.full_name,
        phone: data.phone,
        role: (data.role as UserRole) || 'customer',
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (err) {
      console.error('Supabase profile fetch error:', err);
      return null;
    }
  },

  async createProfile(profile: {
    id: string;
    full_name: string;
    phone?: string;
    role?: UserRole;
  }): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;

    const now = new Date().toISOString();
    const payload = {
      id: profile.id,
      full_name: profile.full_name,
      phone: profile.phone || null,
      role: profile.role || 'customer',
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload)
      .select('id, full_name, phone, role, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error creating user profile in Supabase:', error);
      return null;
    }

    return data as UserProfile;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.full_name !== undefined) payload.full_name = updates.full_name;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.role !== undefined) payload.role = updates.role;

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select('id, full_name, phone, role, created_at, updated_at')
      .single();

    if (error) {
      console.error('Supabase profile update error:', error);
      return null;
    }

    return data as UserProfile;
  },
};

export interface Notification {
  id: string;
  user_id: string;
  order_id?: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const NotificationsService = {
  async getAllForUser(userId: string): Promise<Notification[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async markAsRead(notificationId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (error) throw error;
  },

  async markAllAsRead(userId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
  },

  async create(notification: Omit<Notification, 'id' | 'is_read' | 'created_at'>): Promise<Notification> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribe(userId: string, callback: (notification: Notification) => void): () => void {
    if (!isSupabaseConfigured()) return () => {};

    const channel = supabase
      .channel(`public:notifications:user_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
