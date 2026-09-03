alter table public.lessons
add constraint lessons_published_content_not_blank
check (not is_published or char_length(btrim(content)) > 0);

alter table public.lesson_sources
add constraint lesson_sources_url_http
check (url is null or url ~* '^https?://');

alter table public.lesson_sources
add constraint lesson_sources_publication_year_four_digits
check (publication_year is null or publication_year between 1000 and 9999);

grant select, insert, update on table public.lessons to authenticated;
revoke delete on table public.lessons from authenticated;

grant select, insert, update on table public.lesson_sources to authenticated;
revoke delete on table public.lesson_sources from authenticated;

create policy "Authenticated users can read published lessons"
on public.lessons
for select
to authenticated
using (
  (select auth.uid()) is not null
  and is_published
  and exists (
    select 1
    from public.modules
    join public.courses
      on courses.id = modules.course_id
    where modules.id = lessons.module_id
      and courses.is_published
  )
);

create policy "Admins can read all lessons"
on public.lessons
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'ADMIN'
  )
);

create policy "Admins can create lessons"
on public.lessons
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'ADMIN'
  )
);

create policy "Admins can update lessons"
on public.lessons
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'ADMIN'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'ADMIN'
  )
);

create policy "Authenticated users can read published lesson sources"
on public.lesson_sources
for select
to authenticated
using (
  (select auth.uid()) is not null
  and exists (
    select 1
    from public.lessons
    join public.modules
      on modules.id = lessons.module_id
    join public.courses
      on courses.id = modules.course_id
    where lessons.id = lesson_sources.lesson_id
      and lessons.is_published
      and courses.is_published
  )
);

create policy "Admins can read all lesson sources"
on public.lesson_sources
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'ADMIN'
  )
);

create policy "Admins can create lesson sources"
on public.lesson_sources
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'ADMIN'
  )
);

create policy "Admins can update lesson sources"
on public.lesson_sources
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'ADMIN'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'ADMIN'
  )
);

create function public.create_module_lesson(
  p_course_id uuid,
  p_module_id uuid,
  p_title text,
  p_content text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_lesson_id uuid;
  next_position integer;
begin
  perform 1
  from public.modules
  where modules.id = p_module_id
    and modules.course_id = p_course_id
  for update;

  if not found then
    return null;
  end if;

  select coalesce(max(lessons.position), 0) + 1
  into next_position
  from public.lessons
  where lessons.module_id = p_module_id;

  insert into public.lessons (module_id, title, content, position)
  values (p_module_id, p_title, p_content, next_position)
  returning id into new_lesson_id;

  return new_lesson_id;
end;
$$;

create function public.move_module_lesson(
  p_course_id uuid,
  p_module_id uuid,
  p_lesson_id uuid,
  p_direction integer
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_position integer;
  target_lesson_id uuid;
  target_position integer;
  temporary_position integer;
begin
  if p_direction not in (-1, 1) then
    raise exception 'Direction must be -1 or 1.' using errcode = '22023';
  end if;

  perform 1
  from public.modules
  where modules.id = p_module_id
    and modules.course_id = p_course_id
  for update;

  if not found then
    return false;
  end if;

  select lessons.position
  into current_position
  from public.lessons
  where lessons.id = p_lesson_id
    and lessons.module_id = p_module_id
  for update;

  if not found then
    return false;
  end if;

  if p_direction = -1 then
    select lessons.id, lessons.position
    into target_lesson_id, target_position
    from public.lessons
    where lessons.module_id = p_module_id
      and lessons.position < current_position
    order by lessons.position desc
    limit 1
    for update;
  else
    select lessons.id, lessons.position
    into target_lesson_id, target_position
    from public.lessons
    where lessons.module_id = p_module_id
      and lessons.position > current_position
    order by lessons.position asc
    limit 1
    for update;
  end if;

  if target_lesson_id is null then
    return false;
  end if;

  select max(lessons.position) + 1
  into temporary_position
  from public.lessons
  where lessons.module_id = p_module_id;

  update public.lessons
  set position = temporary_position
  where id = p_lesson_id;

  update public.lessons
  set position = current_position
  where id = target_lesson_id;

  update public.lessons
  set position = target_position
  where id = p_lesson_id;

  return true;
end;
$$;

create function public.create_lesson_source(
  p_course_id uuid,
  p_module_id uuid,
  p_lesson_id uuid,
  p_title text,
  p_author text,
  p_url text,
  p_publication_year integer
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_source_id uuid;
  next_position integer;
begin
  perform 1
  from public.lessons
  join public.modules
    on modules.id = lessons.module_id
  where lessons.id = p_lesson_id
    and lessons.module_id = p_module_id
    and modules.course_id = p_course_id
  for update of lessons;

  if not found then
    return null;
  end if;

  select coalesce(max(lesson_sources.position), 0) + 1
  into next_position
  from public.lesson_sources
  where lesson_sources.lesson_id = p_lesson_id;

  insert into public.lesson_sources (
    lesson_id,
    title,
    author,
    url,
    publication_year,
    position
  )
  values (
    p_lesson_id,
    p_title,
    p_author,
    p_url,
    p_publication_year,
    next_position
  )
  returning id into new_source_id;

  return new_source_id;
end;
$$;

create function public.move_lesson_source(
  p_course_id uuid,
  p_module_id uuid,
  p_lesson_id uuid,
  p_source_id uuid,
  p_direction integer
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_position integer;
  target_source_id uuid;
  target_position integer;
  temporary_position integer;
begin
  if p_direction not in (-1, 1) then
    raise exception 'Direction must be -1 or 1.' using errcode = '22023';
  end if;

  perform 1
  from public.lessons
  join public.modules
    on modules.id = lessons.module_id
  where lessons.id = p_lesson_id
    and lessons.module_id = p_module_id
    and modules.course_id = p_course_id
  for update of lessons;

  if not found then
    return false;
  end if;

  select lesson_sources.position
  into current_position
  from public.lesson_sources
  where lesson_sources.id = p_source_id
    and lesson_sources.lesson_id = p_lesson_id
  for update;

  if not found then
    return false;
  end if;

  if p_direction = -1 then
    select lesson_sources.id, lesson_sources.position
    into target_source_id, target_position
    from public.lesson_sources
    where lesson_sources.lesson_id = p_lesson_id
      and lesson_sources.position < current_position
    order by lesson_sources.position desc
    limit 1
    for update;
  else
    select lesson_sources.id, lesson_sources.position
    into target_source_id, target_position
    from public.lesson_sources
    where lesson_sources.lesson_id = p_lesson_id
      and lesson_sources.position > current_position
    order by lesson_sources.position asc
    limit 1
    for update;
  end if;

  if target_source_id is null then
    return false;
  end if;

  select max(lesson_sources.position) + 1
  into temporary_position
  from public.lesson_sources
  where lesson_sources.lesson_id = p_lesson_id;

  update public.lesson_sources
  set position = temporary_position
  where id = p_source_id;

  update public.lesson_sources
  set position = current_position
  where id = target_source_id;

  update public.lesson_sources
  set position = target_position
  where id = p_source_id;

  return true;
end;
$$;

revoke execute on function public.create_module_lesson(uuid, uuid, text, text)
from public, anon;
revoke execute on function public.move_module_lesson(uuid, uuid, uuid, integer)
from public, anon;
revoke execute on function public.create_lesson_source(
  uuid,
  uuid,
  uuid,
  text,
  text,
  text,
  integer
)
from public, anon;
revoke execute on function public.move_lesson_source(
  uuid,
  uuid,
  uuid,
  uuid,
  integer
)
from public, anon;

grant execute on function public.create_module_lesson(uuid, uuid, text, text)
to authenticated;
grant execute on function public.move_module_lesson(uuid, uuid, uuid, integer)
to authenticated;
grant execute on function public.create_lesson_source(
  uuid,
  uuid,
  uuid,
  text,
  text,
  text,
  integer
)
to authenticated;
grant execute on function public.move_lesson_source(
  uuid,
  uuid,
  uuid,
  uuid,
  integer
)
to authenticated;
