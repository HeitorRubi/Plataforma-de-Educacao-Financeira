create view public.knowledge_documents
with (security_invoker = true, security_barrier = true)
as
select
  courses.id as course_id,
  courses.title as course_title,
  modules.id as module_id,
  modules.title as module_title,
  modules.position as module_position,
  lessons.id as lesson_id,
  lessons.title as lesson_title,
  lessons.position as lesson_position,
  lessons.content,
  lessons.updated_at as lesson_updated_at,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', lesson_sources.id,
        'title', lesson_sources.title,
        'author', lesson_sources.author,
        'url', lesson_sources.url,
        'publication_year', lesson_sources.publication_year,
        'position', lesson_sources.position
      )
      order by lesson_sources.position
    ) filter (where lesson_sources.id is not null),
    '[]'::jsonb
  ) as sources
from public.courses
join public.modules
  on modules.course_id = courses.id
join public.lessons
  on lessons.module_id = modules.id
left join public.lesson_sources
  on lesson_sources.lesson_id = lessons.id
where courses.is_published
  and lessons.is_published
  and char_length(btrim(lessons.content)) > 0
group by
  courses.id,
  courses.title,
  modules.id,
  modules.title,
  modules.position,
  lessons.id,
  lessons.title,
  lessons.position,
  lessons.content,
  lessons.updated_at;

comment on view public.knowledge_documents is
  'Published educational content eligible for the platform knowledge base.';

revoke all on table public.knowledge_documents from public, anon, authenticated;
grant select on table public.knowledge_documents to authenticated, service_role;
