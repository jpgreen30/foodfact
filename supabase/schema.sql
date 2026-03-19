-- FoodFactScanner Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro')),
  scans_used integer not null default 0,
  scan_credits integer not null default 0,
  total_scans integer not null default 0,
  onboarding_complete boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- profile data (optional extended info from onboarding)
create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mom_status text,
  due_date date,
  baby_birth_date date,
  baby_name text,
  baby_age_months integer,
  diet text[] default '{}',
  concerns text[] default '{}',
  allergies text[] default '{}',
  breastfeeding boolean default false,
  organic_preference boolean default false,
  notifications_enabled boolean default true,
  weekly_report_enabled boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- scan history
create table public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_name text not null,
  brand text,
  overall_score text check (overall_score in ('safe', 'caution', 'danger')),
  chemicals jsonb default '[]',
  ingredients text[] default '{}',
  image_url text,
  scanned_at timestamptz not null default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.user_profiles enable row level security;
alter table public.scans enable row level security;

-- Policies: users can only read/write their own data
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can view own user_profile" on public.user_profiles
  for all using (auth.uid() = user_id);

create policy "Users can view own scans" on public.scans
  for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update updated_at automatically
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger user_profiles_updated_at before update on public.user_profiles
  for each row execute procedure public.set_updated_at();
