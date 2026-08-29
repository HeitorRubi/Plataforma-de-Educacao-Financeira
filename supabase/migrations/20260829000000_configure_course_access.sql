grant select, insert, update on table public.courses to authenticated;
revoke delete on table public.courses from authenticated;

create policy "Authenticated users can read published courses"
on public.courses
for select
to authenticated
using ((select auth.uid()) is not null and is_published);

create policy "Admins can read all courses"
on public.courses
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

create policy "Admins can create courses"
on public.courses
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

create policy "Admins can update courses"
on public.courses
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
