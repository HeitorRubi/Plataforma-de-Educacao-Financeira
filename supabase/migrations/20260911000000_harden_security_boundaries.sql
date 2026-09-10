alter table public.profiles
add constraint profiles_full_name_length
check (
  full_name is null
  or char_length(btrim(full_name)) between 2 and 100
) not valid;

alter table public.courses
add constraint courses_title_length
check (char_length(btrim(title)) between 3 and 120) not valid,
add constraint courses_description_length
check (description is null or char_length(description) <= 1000) not valid;

alter table public.modules
add constraint modules_title_length
check (char_length(btrim(title)) between 3 and 120) not valid,
add constraint modules_description_length
check (description is null or char_length(description) <= 1000) not valid;

alter table public.lessons
add constraint lessons_title_length
check (char_length(btrim(title)) between 3 and 120) not valid,
add constraint lessons_content_length
check (char_length(content) <= 100000) not valid;

alter table public.lesson_sources
add constraint lesson_sources_title_length
check (char_length(btrim(title)) between 3 and 200) not valid,
add constraint lesson_sources_author_length
check (author is null or char_length(author) <= 200) not valid,
add constraint lesson_sources_url_length
check (url is null or char_length(url) <= 2000) not valid;

alter table public.chat_messages
add constraint chat_messages_user_question_trimmed_length
check (
  role <> 'USER'
  or char_length(btrim(content)) between 3 and 500
) not valid,
add constraint chat_messages_citations_match_status
check (
  case
    when jsonb_typeof(citations) is distinct from 'array' then false
    when role = 'USER' then status is null and citations = '[]'::jsonb
    when role = 'ASSISTANT' and status = 'answered'
      then jsonb_array_length(citations) between 1 and 4
    when role = 'ASSISTANT'
      and status in ('insufficient_context', 'restricted')
      then citations = '[]'::jsonb
    else false
  end
) not valid;

alter table public.profiles
validate constraint profiles_full_name_length;

alter table public.courses
validate constraint courses_title_length,
validate constraint courses_description_length;

alter table public.modules
validate constraint modules_title_length,
validate constraint modules_description_length;

alter table public.lessons
validate constraint lessons_title_length,
validate constraint lessons_content_length;

alter table public.lesson_sources
validate constraint lesson_sources_title_length,
validate constraint lesson_sources_author_length,
validate constraint lesson_sources_url_length;

alter table public.chat_messages
validate constraint chat_messages_user_question_trimmed_length,
validate constraint chat_messages_citations_match_status;

revoke create on schema public from public, anon, authenticated;
grant usage on schema public to anon, authenticated;

revoke execute on all functions in schema public
from public, anon, authenticated;

grant execute on function public.create_course_module(uuid, text, text)
to authenticated, service_role;
grant execute on function public.move_course_module(uuid, uuid, integer)
to authenticated, service_role;
grant execute on function public.create_module_lesson(uuid, uuid, text, text)
to authenticated, service_role;
grant execute on function public.move_module_lesson(uuid, uuid, uuid, integer)
to authenticated, service_role;
grant execute on function public.create_lesson_source(
  uuid,
  uuid,
  uuid,
  text,
  text,
  text,
  integer
)
to authenticated, service_role;
grant execute on function public.move_lesson_source(
  uuid,
  uuid,
  uuid,
  uuid,
  integer
)
to authenticated, service_role;
grant execute on function public.append_chat_exchange(
  uuid,
  text,
  text,
  text,
  text,
  jsonb
)
to authenticated, service_role;
grant execute on function public.handle_new_user()
to supabase_auth_admin;

alter default privileges in schema public
revoke execute on functions from public, anon, authenticated;
