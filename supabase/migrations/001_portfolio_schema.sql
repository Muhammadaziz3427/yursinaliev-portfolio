-- ============================================================================
-- YURSINALIEV.COM: BIO-CYBER MINIMAL DATABASE SCHEMA
-- Muhammadaziz Yursinaliyev — Medicine/Surgery x Cybersecurity/Software Engineering
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Enums
do $$ begin
  create type public.profile_role as enum ('admin', 'user');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.gallery_category as enum ('anatomy', 'ui_design');
exception
  when duplicate_object then null;
end $$;

-- 1. Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role public.profile_role not null default 'user',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 2. Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  problem_solution text not null,
  tech_stack text[] not null default '{}',
  github_url text,
  live_url text,
  cover_image text,
  likes_count integer not null default 0 check (likes_count >= 0),
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 3. Essays
create table if not exists public.essays (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content_markdown text not null,
  cover_image text,
  read_time integer not null default 5 check (read_time > 0 and read_time <= 180),
  likes_count integer not null default 0 check (likes_count >= 0),
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- 4. Gallery
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category public.gallery_category not null default 'anatomy',
  image_url text not null,
  description text,
  aspect_ratio text default '4/3',
  created_at timestamptz not null default timezone('utc', now())
);

-- 5. Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  essay_id uuid references public.essays(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 2000),
  is_approved boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  constraint comments_one_target check (
    (essay_id is not null and project_id is null)
    or (essay_id is null and project_id is not null)
  )
);

-- 6. Likes
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  essay_id uuid references public.essays(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint likes_one_target check (
    (essay_id is not null and project_id is null)
    or (essay_id is null and project_id is not null)
  )
);

create unique index if not exists likes_user_essay_unique on public.likes (user_id, essay_id) where essay_id is not null;
create unique index if not exists likes_user_project_unique on public.likes (user_id, project_id) where project_id is not null;

-- 7. Activity Log
create table if not exists public.activity (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  label text not null,
  detail text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

-- Indexes
create index if not exists projects_created_at_idx on public.projects (created_at desc);
create index if not exists essays_published_at_idx on public.essays (published_at desc);
create index if not exists gallery_created_at_idx on public.gallery (created_at desc);
create index if not exists comments_essay_id_idx on public.comments (essay_id);
create index if not exists comments_project_id_idx on public.comments (project_id);
create index if not exists activity_created_at_idx on public.activity (created_at desc);

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

-- Trigger: Likes Count Sync
create or replace function public.set_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.project_id is not null then
      update public.projects set likes_count = likes_count + 1 where id = new.project_id;
    else
      update public.essays set likes_count = likes_count + 1 where id = new.essay_id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.project_id is not null then
      update public.projects set likes_count = greatest(0, likes_count - 1) where id = old.project_id;
    else
      update public.essays set likes_count = greatest(0, likes_count - 1) where id = old.essay_id;
    end if;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists likes_count_after_insert on public.likes;
create trigger likes_count_after_insert
  after insert on public.likes
  for each row execute procedure public.set_like_count();

drop trigger if exists likes_count_after_delete on public.likes;
create trigger likes_count_after_delete
  after delete on public.likes
  for each row execute procedure public.set_like_count();

-- RLS Enforcement
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.essays enable row level security;
alter table public.gallery enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.activity enable row level security;

-- Policies
drop policy if exists profiles_public_read on public.profiles;
create policy profiles_public_read on public.profiles for select using (true);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());

drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects for select using (true);

drop policy if exists projects_admin_all on public.projects;
create policy projects_admin_all on public.projects for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists essays_public_read on public.essays;
create policy essays_public_read on public.essays for select using (published_at is not null or public.is_admin());

drop policy if exists essays_admin_all on public.essays;
create policy essays_admin_all on public.essays for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists gallery_public_read on public.gallery;
create policy gallery_public_read on public.gallery for select using (true);

drop policy if exists gallery_admin_all on public.gallery;
create policy gallery_admin_all on public.gallery for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists comments_public_read on public.comments;
create policy comments_public_read on public.comments for select using (is_approved = true or public.is_admin());

drop policy if exists comments_user_insert on public.comments;
create policy comments_user_insert on public.comments for insert with check (auth.uid() = user_id);

drop policy if exists comments_owner_modify on public.comments;
create policy comments_owner_modify on public.comments for all using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());

drop policy if exists likes_public_read on public.likes;
create policy likes_public_read on public.likes for select using (true);

drop policy if exists likes_user_insert on public.likes;
create policy likes_user_insert on public.likes for insert with check (auth.uid() = user_id);

drop policy if exists likes_owner_delete on public.likes;
create policy likes_owner_delete on public.likes for delete using (auth.uid() = user_id or public.is_admin());

drop policy if exists activity_public_read on public.activity;
create policy activity_public_read on public.activity for select using (true);

drop policy if exists activity_admin_all on public.activity;
create policy activity_admin_all on public.activity for all using (public.is_admin()) with check (public.is_admin());

-- Storage Bucket
insert into storage.buckets (id, name, public)
values ('portfolio-gallery', 'portfolio-gallery', true)
on conflict (id) do nothing;

drop policy if exists portfolio_gallery_public_read on storage.objects;
create policy portfolio_gallery_public_read on storage.objects for select using (bucket_id = 'portfolio-gallery');

drop policy if exists portfolio_gallery_admin_all on storage.objects;
create policy portfolio_gallery_admin_all on storage.objects for all using (bucket_id = 'portfolio-gallery' and public.is_admin()) with check (bucket_id = 'portfolio-gallery' and public.is_admin());