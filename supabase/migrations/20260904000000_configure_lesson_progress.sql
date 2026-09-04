grant select, insert on table public.lesson_progress to authenticated;
revoke update, delete on table public.lesson_progress from authenticated;
revoke all on table public.lesson_progress from anon;

create policy "Users can read their own lesson progress"
on public.lesson_progress
for select
to authenticated
using (
  user_id = (select auth.uid())
);

create policy "Users can complete published lessons"
on public.lesson_progress
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.lessons
    join public.modules
      on modules.id = lessons.module_id
    join public.courses
      on courses.id = modules.course_id
    where lessons.id = lesson_progress.lesson_id
      and lessons.is_published
      and courses.is_published
  )
);
