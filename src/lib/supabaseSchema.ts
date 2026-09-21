export const SUPABASE_SQL_SCHEMA = `-- ============================================================
-- Ruckyn Antee Popcorn - Supabase Production Database Schema
-- Run this in your Supabase Project SQL Editor
-- ============================================================

-- 1. Create PROFILES table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  avatar_url text,
  default_address text,
  default_city text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by owner or admin"
  on public.profiles for select
  using (auth.uid() = id or (select role from public.profiles where id = auth.uid()) = 'admin');

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger: auto-create profile on auth.users sign up with role = 'customer'
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Valued Customer'),
    'customer' -- New registrations always default strictly to customer
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Create PRODUCTS table
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  price numeric(10, 2) not null,
  category text not null,
  image_url text not null,
  is_available boolean default true not null,
  sizes jsonb default '[]'::jsonb not null,
  calories text,
  tags text[] default array[]::text[],
  ingredients text[] default array[]::text[],
  rating numeric(3, 1) default 5.0,
  reviews_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on products
alter table public.products enable row level security;

create policy "Products are viewable by everyone"
  on public.products for select
  using (true);

create policy "Only admins can insert or update products"
  on public.products for all
  using ((select role from public.profiles where id = auth.uid()) = 'admin');


-- 3. Create ORDERS table
create table if not exists public.orders (
  id text primary key,
  user_id uuid references public.profiles(id) on delete set null,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  phone text,
  delivery_address text not null,
  delivery_city text not null,
  delivery_notes text,
  notes text,
  status text not null default 'pending' 
    check (status in ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'archived')),
  payment_method text not null,
  payment_status text not null default 'Paid' check (payment_status in ('Paid', 'Unpaid')),
  subtotal numeric(10, 2) not null,
  delivery_fee numeric(10, 2) not null default 0.00,
  discount numeric(10, 2) not null default 0.00,
  total numeric(10, 2) not null,
  estimated_delivery text default '25-35 mins',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migration / Safety: If orders table was previously created without customer_name or columns:
alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists customer_phone text;
alter table public.orders add column if not exists phone text;
alter table public.orders add column if not exists user_id uuid references public.profiles(id);
alter table public.orders add column if not exists customer_id uuid references public.profiles(id);
alter table public.orders add column if not exists delivery_city text default 'Local Delivery';
alter table public.orders add column if not exists delivery_notes text;
alter table public.orders add column if not exists notes text;
alter table public.orders add column if not exists payment_status text default 'Paid';

-- Backfill customer_name from profiles table for any legacy records
update public.orders o
set customer_name = p.full_name
from public.profiles p
where (o.customer_name is null or o.customer_name = '' or o.customer_name = 'Customer' or o.customer_name = 'Valued Customer')
  and (o.user_id = p.id or o.customer_id = p.id);

-- Enable RLS on orders
alter table public.orders enable row level security;

create policy "Customers view own orders, admins view all orders"
  on public.orders for select
  using (auth.uid() = user_id or (select role from public.profiles where id = auth.uid()) = 'admin');

create policy "Customers can insert orders"
  on public.orders for insert
  with check (true);

create policy "Admins can update orders"
  on public.orders for update
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

create policy "Admins can delete orders"
  on public.orders for delete
  using ((select role from public.profiles where id = auth.uid()) = 'admin');


-- 4. Create ORDER_ITEMS table
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id text references public.orders(id) on delete cascade not null,
  product_id text not null,
  product_name text not null,
  product_image text not null,
  size text not null,
  unit_price numeric(10, 2) not null,
  quantity integer not null check (quantity > 0),
  total_price numeric(10, 2) not null,
  seasoning text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on order_items
alter table public.order_items enable row level security;

create policy "Order items viewable by order owner or admin"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or (select role from public.profiles where id = auth.uid()) = 'admin')
    )
  );

create policy "Insert order items on order placement"
  on public.order_items for insert
  with check (true);

create policy "Admins can delete order items"
  on public.order_items for delete
  using ((select role from public.profiles where id = auth.uid()) = 'admin');


-- 6. Create NOTIFICATIONS table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  order_id uuid references public.orders(id),
  title text not null,
  message text not null,
  type text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_created_at on public.notifications(created_at);

-- Enable RLS on notifications
alter table public.notifications enable row level security;

create policy "Customers can view/update own notifications"
  on public.notifications for all
  using (auth.uid() = user_id);

create policy "Admins can view/manage notifications"
  on public.notifications for all
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Enable Realtime
alter publication supabase_realtime add table public.notifications;
`;

export const SUPABASE_SCHEMA_SQL = SUPABASE_SQL_SCHEMA;
