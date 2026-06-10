-- BillForge Supabase setup
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan_id text not null default 'starter',
  pdf_used integer not null default 0,
  period_started_at timestamptz not null default now(),
  period_ends_at timestamptz not null default (now() + interval '30 days'),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  plan_id text not null,
  amount integer not null,
  razorpay_payment_id text,
  razorpay_order_id text,
  status text not null default 'created',
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  doc_type text not null,
  title text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  details text,
  gstin text,
  pan text,
  mobile text,
  ship_to text,
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_items (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  description text not null,
  hsn text,
  unit text default 'Pcs.',
  rate numeric not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.customers add column if not exists pan text;
alter table public.customers add column if not exists mobile text;
alter table public.customers add column if not exists ship_to text;
alter table public.saved_items add column if not exists unit text default 'Pcs.';
alter table public.profiles add column if not exists period_started_at timestamptz not null default now();
alter table public.profiles add column if not exists period_ends_at timestamptz not null default (now() + interval '30 days');

create unique index if not exists profiles_email_unique on public.profiles (email);
create index if not exists documents_user_id_updated_idx on public.documents (user_id, updated_at desc);
create index if not exists customers_user_id_updated_idx on public.customers (user_id, updated_at desc);
create index if not exists saved_items_user_id_updated_idx on public.saved_items (user_id, updated_at desc);

alter table public.profiles enable row level security;
alter table public.payments enable row level security;
alter table public.documents enable row level security;
alter table public.customers enable row level security;
alter table public.saved_items enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert on public.payments to authenticated;
grant select, insert, update, delete on public.documents to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.saved_items to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, plan_id, pdf_used, updated_at)
  values (new.id, new.email, 'starter', 0, now())
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (
  auth.uid() = id
  AND plan_id = (select plan_id from public.profiles where id = auth.uid())
  AND pdf_used = (select pdf_used from public.profiles where id = auth.uid())
);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can read own payments" on public.payments;
create policy "Users can read own payments"
on public.payments for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own payments" on public.payments;
create policy "Users can insert own payments"
on public.payments for insert
with check (auth.uid() = user_id);

drop policy if exists "Admin can read all profiles" on public.profiles;
create policy "Admin can read all profiles"
on public.profiles for select
using (auth.jwt() ->> 'email' = 'pareshsarkar0908@gmail.com');

drop policy if exists "Admin can read all payments" on public.payments;
create policy "Admin can read all payments"
on public.payments for select
using (auth.jwt() ->> 'email' = 'pareshsarkar0908@gmail.com');

drop policy if exists "Users can read own documents" on public.documents;
create policy "Users can read own documents"
on public.documents for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own documents" on public.documents;
create policy "Users can insert own documents"
on public.documents for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own documents" on public.documents;
create policy "Users can update own documents"
on public.documents for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own documents" on public.documents;
create policy "Users can delete own documents"
on public.documents for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own customers" on public.customers;
create policy "Users can read own customers"
on public.customers for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own customers" on public.customers;
create policy "Users can insert own customers"
on public.customers for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own customers" on public.customers;
create policy "Users can update own customers"
on public.customers for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own customers" on public.customers;
create policy "Users can delete own customers"
on public.customers for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read own saved items" on public.saved_items;
create policy "Users can read own saved items"
on public.saved_items for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own saved items" on public.saved_items;
create policy "Users can insert own saved items"
on public.saved_items for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own saved items" on public.saved_items;
create policy "Users can update own saved items"
on public.saved_items for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own saved items" on public.saved_items;
create policy "Users can delete own saved items"
on public.saved_items for delete
using (auth.uid() = user_id);

drop policy if exists "Admin can read all documents" on public.documents;
create policy "Admin can read all documents"
on public.documents for select
using (auth.jwt() ->> 'email' = 'pareshsarkar0908@gmail.com');

drop policy if exists "Admin can read all customers" on public.customers;
create policy "Admin can read all customers"
on public.customers for select
using (auth.jwt() ->> 'email' = 'pareshsarkar0908@gmail.com');

drop policy if exists "Admin can read all saved items" on public.saved_items;
create policy "Admin can read all saved items"
on public.saved_items for select
using (auth.jwt() ->> 'email' = 'pareshsarkar0908@gmail.com');

-- Business platform upgrade: multi-business profiles, richer document history,
-- product catalog metadata, custom taxes, and audit/history tables.

create table if not exists public.businesses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  business_name text not null,
  tax_id text,
  business_email text,
  phone text,
  website text,
  address text,
  currency text not null default '₹',
  logo text,
  signature text,
  brand_color text not null default '#0f766e',
  footer_text text,
  default_taxes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  description text,
  hsn text,
  unit text default 'Pcs.',
  price numeric not null default 0,
  tax_rate numeric not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_items (
  id uuid primary key default gen_random_uuid(),
  document_id text references public.documents(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  description text not null,
  hsn text,
  quantity numeric not null default 0,
  unit text default 'Pcs.',
  rate numeric not null default 0,
  tax_rate numeric not null default 0,
  line_total numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.document_taxes (
  id uuid primary key default gen_random_uuid(),
  document_id text references public.documents(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  tax_name text not null,
  tax_rate numeric not null default 0,
  tax_amount numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.document_history (
  id uuid primary key default gen_random_uuid(),
  document_id text references public.documents(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  action text not null,
  snapshot jsonb,
  created_at timestamptz not null default now()
);

alter table public.documents add column if not exists business_id text;
alter table public.documents add column if not exists document_number text;
alter table public.documents add column if not exists document_date date;
alter table public.documents add column if not exists customer_name text;
alter table public.documents add column if not exists amount numeric not null default 0;
alter table public.documents add column if not exists status text not null default 'Draft';

alter table public.customers add column if not exists business_name text;
alter table public.customers add column if not exists customer_email text;
alter table public.customers add column if not exists tax_id text;
alter table public.customers add column if not exists phone text;

alter table public.saved_items add column if not exists name text;
alter table public.saved_items add column if not exists price numeric;
alter table public.saved_items add column if not exists tax_rate numeric not null default 0;

create index if not exists businesses_user_id_updated_idx on public.businesses (user_id, updated_at desc);
create index if not exists products_user_id_updated_idx on public.products (user_id, updated_at desc);
create index if not exists documents_business_updated_idx on public.documents (business_id, updated_at desc);
create index if not exists documents_user_type_date_idx on public.documents (user_id, doc_type, document_date desc);
create index if not exists document_items_document_idx on public.document_items (document_id);
create index if not exists document_taxes_document_idx on public.document_taxes (document_id);
create index if not exists document_history_document_idx on public.document_history (document_id, created_at desc);

alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.document_items enable row level security;
alter table public.document_taxes enable row level security;
alter table public.document_history enable row level security;

grant select, insert, update, delete on public.businesses to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.document_items to authenticated;
grant select, insert, update, delete on public.document_taxes to authenticated;
grant select, insert, update, delete on public.document_history to authenticated;

drop policy if exists "Users can read own businesses" on public.businesses;
create policy "Users can read own businesses"
on public.businesses for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own businesses" on public.businesses;
create policy "Users can insert own businesses"
on public.businesses for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own businesses" on public.businesses;
create policy "Users can update own businesses"
on public.businesses for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own businesses" on public.businesses;
create policy "Users can delete own businesses"
on public.businesses for delete
using (auth.uid() = user_id);

drop policy if exists "Users can manage own products" on public.products;
create policy "Users can manage own products"
on public.products for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own document items" on public.document_items;
create policy "Users can manage own document items"
on public.document_items for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own document taxes" on public.document_taxes;
create policy "Users can manage own document taxes"
on public.document_taxes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own document history" on public.document_history;
create policy "Users can manage own document history"
on public.document_history for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admin can read all businesses" on public.businesses;
create policy "Admin can read all businesses"
on public.businesses for select
using (auth.jwt() ->> 'email' = 'pareshsarkar0908@gmail.com');

drop policy if exists "Admin can read all products" on public.products;
create policy "Admin can read all products"
on public.products for select
using (auth.jwt() ->> 'email' = 'pareshsarkar0908@gmail.com');

drop policy if exists "Admin can read all document items" on public.document_items;
create policy "Admin can read all document items"
on public.document_items for select
using (auth.jwt() ->> 'email' = 'pareshsarkar0908@gmail.com');

drop policy if exists "Admin can read all document taxes" on public.document_taxes;
create policy "Admin can read all document taxes"
on public.document_taxes for select
using (auth.jwt() ->> 'email' = 'pareshsarkar0908@gmail.com');

drop policy if exists "Admin can read all document history" on public.document_history;
create policy "Admin can read all document history"
on public.document_history for select
using (auth.jwt() ->> 'email' = 'pareshsarkar0908@gmail.com');

-- Data deletion requests
create table if not exists public.data_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  requested_at timestamptz not null default now(),
  status text not null default 'pending'
);

alter table public.data_deletion_requests enable row level security;

drop policy if exists "Users can insert own deletion request" on public.data_deletion_requests;
create policy "Users can insert own deletion request"
on public.data_deletion_requests for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can read own deletion request" on public.data_deletion_requests;
create policy "Users can read own deletion request"
on public.data_deletion_requests for select
using (auth.uid() = user_id);

-- Atomic PDF increment (called by server-side API only via service role)
create or replace function public.increment_pdf_used(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set pdf_used = pdf_used + 1, updated_at = now()
  where id = p_user_id;
end;
$$;
