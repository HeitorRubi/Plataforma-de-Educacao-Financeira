create type public.user_role as enum ('USER', 'ADMIN');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.user_role not null default 'USER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_title_not_blank check (char_length(btrim(title)) > 0)
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text,
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint modules_title_not_blank check (char_length(btrim(title)) > 0),
  constraint modules_position_positive check (position > 0),
  constraint modules_course_position_unique unique (course_id, position)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  title text not null,
  content text not null default '',
  position integer not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lessons_title_not_blank check (char_length(btrim(title)) > 0),
  constraint lessons_position_positive check (position > 0),
  constraint lessons_module_position_unique unique (module_id, position)
);

create table public.lesson_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table public.lesson_sources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  title text not null,
  author text,
  url text,
  publication_year integer,
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lesson_sources_title_not_blank check (char_length(btrim(title)) > 0),
  constraint lesson_sources_position_positive check (position > 0),
  constraint lesson_sources_lesson_position_unique unique (lesson_id, position)
);

create index lesson_progress_lesson_id_idx
  on public.lesson_progress (lesson_id);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger courses_set_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

create trigger modules_set_updated_at
before update on public.modules
for each row execute function public.set_updated_at();

create trigger lessons_set_updated_at
before update on public.lessons
for each row execute function public.set_updated_at();

create trigger lesson_sources_set_updated_at
before update on public.lesson_sources
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.lesson_sources enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.courses from anon, authenticated;
revoke all on table public.modules from anon, authenticated;
revoke all on table public.lessons from anon, authenticated;
revoke all on table public.lesson_progress from anon, authenticated;
revoke all on table public.lesson_sources from anon, authenticated;

grant all on table public.profiles to service_role;
grant all on table public.courses to service_role;
grant all on table public.modules to service_role;
grant all on table public.lessons to service_role;
grant all on table public.lesson_progress to service_role;
grant all on table public.lesson_sources to service_role;
