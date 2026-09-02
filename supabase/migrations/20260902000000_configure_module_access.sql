grant select, insert, update on table public.modules to authenticated;
revoke delete on table public.modules from authenticated;

create policy "Authenticated users can read published course modules"
on public.modules
for select
to authenticated
using (
  (select auth.uid()) is not null
  and exists (
    select 1
    from public.courses
    where courses.id = modules.course_id
      and courses.is_published
  )
);

create policy "Admins can read all modules"
on public.modules
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

create policy "Admins can create modules"
on public.modules
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

create policy "Admins can update modules"
on public.modules
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

create function public.create_course_module(
  p_course_id uuid,
  p_title text,
  p_description text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_module_id uuid;
  next_position integer;
begin
  perform 1
  from public.courses
  where courses.id = p_course_id
  for update;

  if not found then
    return null;
  end if;

  select coalesce(max(modules.position), 0) + 1
  into next_position
  from public.modules
  where modules.course_id = p_course_id;

  insert into public.modules (course_id, title, description, position)
  values (p_course_id, p_title, p_description, next_position)
  returning id into new_module_id;

  return new_module_id;
end;
$$;

create function public.move_course_module(
  p_course_id uuid,
  p_module_id uuid,
  p_direction integer
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_course_id uuid;
  current_position integer;
  target_module_id uuid;
  target_position integer;
  temporary_position integer;
begin
  if p_direction not in (-1, 1) then
    raise exception 'Direction must be -1 or 1.' using errcode = '22023';
  end if;

  select modules.course_id
  into current_course_id
  from public.modules
  where modules.id = p_module_id
    and modules.course_id = p_course_id;

  if not found then
    return false;
  end if;

  perform 1
  from public.courses
  where courses.id = current_course_id
  for update;

  if not found then
    return false;
  end if;

  select modules.position
  into current_position
  from public.modules
  where modules.id = p_module_id
    and modules.course_id = current_course_id
  for update;

  if not found then
    return false;
  end if;

  if p_direction = -1 then
    select modules.id, modules.position
    into target_module_id, target_position
    from public.modules
    where modules.course_id = current_course_id
      and modules.position < current_position
    order by modules.position desc
    limit 1
    for update;
  else
    select modules.id, modules.position
    into target_module_id, target_position
    from public.modules
    where modules.course_id = current_course_id
      and modules.position > current_position
    order by modules.position asc
    limit 1
    for update;
  end if;

  if target_module_id is null then
    return false;
  end if;

  select max(modules.position) + 1
  into temporary_position
  from public.modules
  where modules.course_id = current_course_id;

  update public.modules
  set position = temporary_position
  where id = p_module_id;

  update public.modules
  set position = current_position
  where id = target_module_id;

  update public.modules
  set position = target_position
  where id = p_module_id;

  return true;
end;
$$;

revoke execute on function public.create_course_module(uuid, text, text)
from public, anon;
revoke execute on function public.move_course_module(uuid, uuid, integer)
from public, anon;

grant execute on function public.create_course_module(uuid, text, text)
to authenticated;
grant execute on function public.move_course_module(uuid, uuid, integer)
to authenticated;
