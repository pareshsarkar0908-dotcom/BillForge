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
with check (auth.uid() = id);

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
