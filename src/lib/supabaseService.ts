import { supabase, isSupabaseConfigured } from './supabase';
import { PopcornProduct, Order, OrderItem, UserProfile, OrderStatus, UserRole } from '../types';
import { POPCORN_SIZES } from '../data/initialData';
import { formatNaira } from './currency';

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
    total_price: Number(it.subtotal || it.total_price) || (Number(it.unit_price) * Number(it.quantity)) || 0,
    created_at: it.created_at,
  }));

  const customerName =
    row.customer_name ||
    row.customerName ||
    (row.profiles && typeof row.profiles === 'object' ? row.profiles.full_name : null) ||
    'Customer';

  const customerEmail =
    row.customer_email ||
    row.customerEmail ||
    (row.profiles && typeof row.profiles === 'object' ? row.profiles.email : '') ||
    '';

  const customerPhone =
    row.customer_phone ||
    row.phone ||
    (row.profiles && typeof row.profiles === 'object' ? row.profiles.phone : '') ||
    '';

  return {
    id: String(row.id),
    customer_id: String(row.customer_id || row.user_id || ''),
    user_id: String(row.user_id || row.customer_id || ''),
    status: (row.status as OrderStatus) || 'pending',
    subtotal: Number(row.subtotal) || 0,
    delivery_fee: Number(row.delivery_fee) || 0,
    total: Number(row.total) || 0,
    delivery_address: row.delivery_address || '',
    phone: customerPhone,
    customer_phone: customerPhone,
    payment_method: row.payment_method || 'Card',
    notes: row.notes || row.delivery_notes || '',
    delivery_notes: row.delivery_notes || row.notes || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
    items,
    // UI helpers
    customer_name: customerName,
    customer_email: customerEmail,
    payment_status: row.payment_status || 'Paid',
    delivery_city: row.delivery_city || 'Local Delivery',
    estimated_delivery: row.estimated_delivery || '25-35 mins',
    discount: Number(row.discount) || 0,
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
    let clearedTime = 0;
    try {
      const stored = localStorage.getItem('ruckyn_antee_cleared_timestamp');
      if (stored) clearedTime = parseInt(stored, 10) || 0;
    } catch {}

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

      let orders = (data || []).map((row: any) => mapOrderFromDb(row));

      // Enrich customer names from profiles for any historical orders where customer_name is missing or placeholder
      const ordersNeedingName = orders.filter(
        (o) => !o.customer_name || o.customer_name === 'Customer' || o.customer_name === 'Valued Customer'
      );
      if (ordersNeedingName.length > 0) {
        const userIds = Array.from(
          new Set(ordersNeedingName.map((o) => o.user_id || o.customer_id).filter(Boolean))
        );
        if (userIds.length > 0) {
          try {
            const { data: profileRows } = await supabase
              .from('profiles')
              .select('id, full_name, email, phone')
              .in('id', userIds);

            if (profileRows && profileRows.length > 0) {
              const profileMap = new Map(profileRows.map((p: any) => [p.id, p]));
              orders.forEach((o) => {
                const targetId = o.user_id || o.customer_id;
                const p = profileMap.get(targetId);
                if (p && p.full_name) {
                  o.customer_name = p.full_name;
                  if (!o.customer_email && p.email) o.customer_email = p.email;
                  if (!o.customer_phone && p.phone) {
                    o.customer_phone = p.phone;
                    o.phone = p.phone;
                  }
                }
              });
            }
          } catch (profileErr) {
            console.warn('Could not enrich orders with profile names:', profileErr);
          }
        }
      }

      if (clearedTime > 0) {
        return orders.filter((o) => new Date(o.created_at).getTime() > clearedTime);
      }
      return orders;
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
        .or(`customer_id.eq.${customerId},user_id.eq.${customerId}`)
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
    const custName = (orderData.customer_name || '').trim() || 'Valued Customer';
    const custEmail = (orderData.customer_email || '').trim();
    const custPhone = (orderData.customer_phone || orderData.phone || '').trim();
    const deliveryAddress = (orderData.delivery_address || '').trim();
    const deliveryCity = (orderData.delivery_city || 'Local Delivery').trim();
    const deliveryNotes = (orderData.delivery_notes || orderData.notes || '').trim();
    const paymentMethod = orderData.payment_method || 'Card';
    const paymentStatus = orderData.payment_status || 'Paid';
    const custId = orderData.customer_id || orderData.user_id || null;

    const orderId = orderData.id || `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    let createdOrder: any = null;

    // Strategy 1: Direct table insert into 'orders' with customer_name explicitly included
    const directPayload: any = {
      id: orderId,
      user_id: custId,
      customer_id: custId,
      customer_name: custName,
      customer_email: custEmail,
      customer_phone: custPhone,
      phone: custPhone,
      delivery_address: deliveryAddress,
      delivery_city: deliveryCity,
      delivery_notes: deliveryNotes,
      notes: deliveryNotes,
      status: 'pending',
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      subtotal: Number(orderData.subtotal) || 0,
      delivery_fee: Number(orderData.delivery_fee) || 0,
      discount: Number(orderData.discount) || 0,
      total: Number(orderData.total) || 0,
      estimated_delivery: orderData.estimated_delivery || '25-35 mins',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data: insertedOrder, error: insertErr } = await supabase
        .from('orders')
        .insert(directPayload)
        .select()
        .maybeSingle();

      if (!insertErr && insertedOrder) {
        createdOrder = insertedOrder;

        // Insert line items
        if (items.length > 0) {
          const itemRows = items.map((it) => ({
            order_id: createdOrder.id,
            product_id: it.product_id,
            product_name: it.product_name,
            product_image: it.product_image || '',
            size: it.size || 'Regular',
            unit_price: Number(it.unit_price) || 0,
            quantity: Number(it.quantity) || 1,
            total_price: Number(it.total_price || it.subtotal) || (Number(it.unit_price) * Number(it.quantity)),
            subtotal: Number(it.subtotal || it.total_price) || (Number(it.unit_price) * Number(it.quantity)),
            seasoning: it.seasoning || '',
          }));

          const { error: itemsErr } = await supabase.from('order_items').insert(itemRows);
          if (itemsErr) {
            console.warn('Warning inserting order_items into Supabase:', itemsErr);
          }
        }
      } else if (insertErr) {
        console.warn('Direct insert into orders attempted, fallback to RPC:', insertErr.message);
      }
    } catch (e) {
      console.warn('Direct insert exception, trying RPC fallback:', e);
    }

    // Strategy 2: If direct insert failed, try RPC create_customer_order
    if (!createdOrder) {
      const p_items = items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      // Try with p_customer_name included
      let rpcRes = await supabase.rpc('create_customer_order', {
        p_items,
        p_customer_name: custName,
        p_delivery_address: deliveryAddress,
        p_phone: custPhone,
        p_payment_method: paymentMethod,
        p_notes: deliveryNotes,
      });

      if (rpcRes.error) {
        // Fallback to signature without p_customer_name if not defined in database RPC
        rpcRes = await supabase.rpc('create_customer_order', {
          p_items,
          p_delivery_address: deliveryAddress,
          p_phone: custPhone,
          p_payment_method: paymentMethod,
          p_notes: deliveryNotes,
        });
      }

      if (rpcRes.error) {
        throw new Error(rpcRes.error.message || 'Failed to create order in Supabase database.');
      }

      createdOrder = rpcRes.data;

      // Update customer_name on the created order in Supabase
      if (createdOrder && createdOrder.id) {
        try {
          await supabase
            .from('orders')
            .update({
              customer_name: custName,
              customer_email: custEmail,
              customer_phone: custPhone,
            })
            .eq('id', createdOrder.id);
        } catch (e) {
          console.warn('Could not update customer_name on created order:', e);
        }
      }
    }

    if (!createdOrder) {
      throw new Error('Failed to create order in Supabase database.');
    }

    // Ensure customer name is preserved on the returned object
    createdOrder.customer_name = custName;
    createdOrder.customer_email = custEmail;
    createdOrder.customer_phone = custPhone;

    // Create notifications
    try {
      const targetCustId = createdOrder.customer_id || createdOrder.user_id || custId;
      if (targetCustId) {
        await NotificationsService.create({
          user_id: targetCustId,
          order_id: createdOrder.id,
          title: 'Order Received',
          message: `Your popcorn order #${createdOrder.id} has been received successfully.`,
          type: 'order_status',
        });
      }

      // Admin notification
      const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
      if (admins) {
        for (const admin of admins) {
          await NotificationsService.create({
            user_id: admin.id,
            order_id: createdOrder.id,
            title: 'New Customer Order',
            message: `New order #${createdOrder.id} placed by ${custName} (${formatNaira(Number(orderData.total) || 0)}).`,
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
      const messages: Record<OrderStatus, string> = {
        pending: 'Your order is pending review.',
        confirmed: 'Your order has been confirmed by our kitchen.',
        preparing: 'Your popcorn is now popping fresh in our kitchen!',
        ready: 'Your order is heat-sealed and ready for pickup / dispatch.',
        out_for_delivery: 'Our courier is out for delivery with your hot popcorn!',
        delivered: 'Your popcorn order has been delivered! Enjoy your treat.',
        cancelled: 'Your order has been cancelled.',
        archived: '',
      };
      const notifUserId = data.customer_id || data.user_id;
      if (notifUserId && status !== 'archived') {
        await NotificationsService.create({
          user_id: notifUserId,
          order_id: data.id,
          title: 'Order Status Update',
          message: messages[status] || `Your order status changed to ${status}.`,
          type: 'order_status',
        });
      }
    } catch (err) {
      console.error('Error creating notification:', err);
    }

    return mapOrderFromDb(data);
  },

  async deleteOrder(orderId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      // Soft delete: update status to 'archived' instead of 'cancelled' to avoid customer notifications
      const { error } = await supabase
        .from('orders')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', orderId);
        
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error soft-deleting order from Supabase:', err);
      return false;
    }
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

  async deleteAll(): Promise<boolean> {
    try {
      localStorage.setItem('ruckyn_antee_cleared_timestamp', Date.now().toString());
      localStorage.removeItem('ruckyn_antee_local_orders_v1');
    } catch {}

    if (!isSupabaseConfigured()) {
      return true;
    }

    try {
      const { error: itemsError } = await supabase.from('order_items').delete().not('id', 'is', null);
      if (itemsError) throw itemsError;
      
      const { error: ordersError } = await supabase.from('orders').delete().not('id', 'is', null);
      if (ordersError) throw ordersError;
      
      return true;
    } catch (err) {
      console.error('Error clearing orders from Supabase:', err);
      return false;
    }
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

  async delete(notificationId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    if (error) throw error;
  },

  async clearAll(userId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);
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
