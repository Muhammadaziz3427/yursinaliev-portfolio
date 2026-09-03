-- ============================================================================
-- YURSINALIEV.UZ: 10-MODULE COMPLETE DYNAMIC DATABASE & STORAGE SCHEMA
-- ============================================================================

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Custom Enums
do $$ begin
  create type public.profile_role as enum ('admin', 'user');
exception
  when duplicate_object then null;
end $$;

-- 1. PROFILES & ADMIN ACCESS
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role public.profile_role not null default 'user',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.admin_profiles (email) 
values 
  ('admin@yursinaliev.com'),
  ('yursinaliyevm@gmail.com'),
  ('yursinaliyev@gmail.com')
on conflict (email) do nothing;

-- 2. SITE CONFIGURATION
create table if not exists public.site_config (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Muhammadaziz Yursinaliyev',
  title text default 'Software Engineer & Future Surgeon',
  headline text default 'Bridging Medical Precision and Cyber-Security Architecture.',
  bio text default 'Passionate technologist dedicated to biomedical innovation, high-assurance security engineering, and surgical science.',
  profile_image_url text,
  github_url text default 'https://github.com/Muhammadaziz3427',
  linkedin_url text default 'https://linkedin.com',
  twitter_url text default 'https://twitter.com',
  email text default 'yursinaliyevm@gmail.com',
  status_text text default 'Tashkent · Dual-Core Practice Active',
  theme text default 'dark',
  updated_at timestamptz default timezone('utc', now())
);

-- Seed default site_config if not present
insert into public.site_config (name, title, headline, bio, email, status_text)
select 'Muhammadaziz Yursinaliyev', 'Software Engineer & Future Surgeon', 'Bridging Medical Precision and Cyber-Security Architecture.', 'Passionate technologist dedicated to biomedical innovation, high-assurance security engineering, and surgical science.', 'yursinaliyevm@gmail.com', 'Tashkent · Dual-Core Practice Active'
where not exists (select 1 from public.site_config);

-- 3. ESSAYS
create table if not exists public.essays (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text,
  content_markdown text,
  category text default 'Technical',
  tags text[] default '{}',
  featured_image_url text,
  cover_image text,
  read_time integer default 5,
  published boolean default true,
  published_at timestamptz default timezone('utc', now()),
  likes_count integer not null default 0,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

-- 4. BOOKS
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  cover_image_url text,
  category text default 'Tech',
  status text default 'Completed', -- 'Reading', 'Completed', 'Wishlist'
  rating integer default 5 check (rating between 1 and 5),
  review text,
  key_takeaways text[] default '{}',
  book_link text,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

-- 5. TRAVELS
create table if not exists public.travels (
  id uuid primary key default gen_random_uuid(),
  trip_title text not null,
  location text not null,
  country text,
  start_date date,
  end_date date,
  description text,
  photo_urls text[] default '{}',
  lessons_learned text[] default '{}',
  rating text default '⭐⭐⭐⭐⭐',
  highlights text,
  created_at timestamptz default timezone('utc', now())
);

-- 6. GAMES & INTERESTS
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text default 'Video Game', -- 'Video Game', 'Board Game', 'Hobby', 'Sport'
  description text,
  playtime text,
  rating integer default 5 check (rating between 1 and 5),
  image_url text,
  why_i_like text,
  achievements text[] default '{}',
  created_at timestamptz default timezone('utc', now())
);

-- 7. SECURITY NOTES
create table if not exists public.security_notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text default 'Concept', -- 'Concept', 'Tool', 'Vulnerability', 'Best Practice'
  content text,
  difficulty text default 'Intermediate', -- 'Beginner', 'Intermediate', 'Advanced'
  tags text[] default '{}',
  code_snippets text,
  "references" text[] default '{}',
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

-- 8. MEDICAL LEARNING
create table if not exists public.medical_learning (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  system text default 'Cardiovascular', -- 'Cardiovascular', 'Nervous', 'Skeletal', 'Digestive', 'Endocrine'
  description text,
  diagram_urls text[] default '{}',
  key_facts text[] default '{}',
  clinical_relevance text,
  status text default 'Learning', -- 'Learning', 'Mastered', 'Interested'
  created_at timestamptz default timezone('utc', now())
);

-- 9. PROJECTS
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  number text default '01',
  summary text,
  description text,
  problem text,
  solution text,
  result text,
  year text default '2024',
  role text,
  category text default 'Product',
  hero_image_url text,
  image_url text,
  gallery_urls text[] default '{}',
  tech_stack text[] default '{}',
  status text default 'Live', -- 'Live', 'In Progress', 'Archived'
  live_url text,
  github_url text,
  featured boolean default false,
  likes_count integer default 0,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

-- 10. QUICK TIPS
create table if not exists public.quick_tips (
  id uuid primary key default gen_random_uuid(),
  insight text not null,
  category text default 'Tech', -- 'Tech', 'Life', 'Medicine', 'Philosophy'
  created_at timestamptz default timezone('utc', now())
);

-- 11. GALLERY
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  note text,
  category text default 'Anatomy',
  aspect_ratio text default '16/10',
  details text[] default '{}',
  image_url text not null,
  description text,
  image_alt text,
  "order" integer default 0,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

-- 12. TELEMETRY & ACTIVITY
create table if not exists public.telemetry_logs (
  id uuid primary key default gen_random_uuid(),
  log_level text check (log_level in ('debug','info','warn','error')) default 'info',
  message text not null,
  component text,
  timestamp timestamptz not null default timezone('utc', now())
);

create table if not exists public.activity (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  label text not null,
  detail text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

-- Helper: is_admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  ) or exists (
    select 1
    from public.admin_profiles
    where lower(email) = lower(auth.jwt() ->> 'email')
  ) or lower(auth.jwt() ->> 'email') in (
    'admin@yursinaliev.com',
    'yursinaliyevm@gmail.com',
    'yursinaliyev@gmail.com'
  );
$$;

-- Trigger: Auth User Created -> Sync Profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'Visitor'),
    new.raw_user_meta_data ->> 'avatar_url',
    case
      when lower(new.email) in ('yursinaliyevm@gmail.com', 'yursinaliyev@gmail.com', 'admin@yursinaliev.com') then 'admin'::public.profile_role
      else 'user'::public.profile_role
    end
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS on all 10+ tables
alter table public.profiles enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.site_config enable row level security;
alter table public.essays enable row level security;
alter table public.books enable row level security;
alter table public.travels enable row level security;
alter table public.games enable row level security;
alter table public.security_notes enable row level security;
alter table public.medical_learning enable row level security;
alter table public.projects enable row level security;
alter table public.quick_tips enable row level security;
alter table public.gallery enable row level security;
alter table public.telemetry_logs enable row level security;
alter table public.activity enable row level security;

-- Public READ & Admin ALL Policies
do $$
declare
  tbl text;
begin
  for tbl in select unnest(array[
    'profiles', 'admin_profiles', 'site_config', 'essays', 'books', 'travels',
    'games', 'security_notes', 'medical_learning', 'projects', 'quick_tips',
    'gallery', 'telemetry_logs', 'activity'
  ]) loop
    execute format('drop policy if exists %I_public_read on public.%I;', tbl, tbl);
    execute format('create policy %I_public_read on public.%I for select using (true);', tbl, tbl);

    execute format('drop policy if exists %I_admin_all on public.%I;', tbl, tbl);
    execute format('create policy %I_admin_all on public.%I for all using (public.is_admin()) with check (public.is_admin());', tbl, tbl);
  end loop;
end $$;

-- Storage Buckets Setup
insert into storage.buckets (id, name, public)
values 
  ('portfolio-media', 'portfolio-media', true),
  ('portfolio-gallery', 'portfolio-gallery', true)
on conflict (id) do nothing;

drop policy if exists portfolio_media_read on storage.objects;
create policy portfolio_media_read on storage.objects 
for select using (bucket_id in ('portfolio-media', 'portfolio-gallery'));

drop policy if exists portfolio_media_admin_write on storage.objects;
create policy portfolio_media_admin_write on storage.objects 
for all using (bucket_id in ('portfolio-media', 'portfolio-gallery') and public.is_admin())
with check (bucket_id in ('portfolio-media', 'portfolio-gallery') and public.is_admin());
