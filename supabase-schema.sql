-- BillForge Supabase setup
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan_id text not null default 'starter',
  pdf_used integer not null default 0,
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

create unique index if not exists profiles_email_unique on public.profiles (email);

alter table public.profiles enable row level security;
alter table public.payments enable row level security;

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
