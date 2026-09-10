create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_sessions_title_not_blank
    check (char_length(btrim(title)) > 0),
  constraint chat_sessions_title_length
    check (char_length(title) <= 120)
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  role text not null,
  content text not null,
  status text,
  citations jsonb not null default '[]'::jsonb,
  position integer not null,
  created_at timestamptz not null default now(),
  constraint chat_messages_role_valid
    check (role in ('USER', 'ASSISTANT')),
  constraint chat_messages_content_not_blank
    check (char_length(btrim(content)) > 0),
  constraint chat_messages_content_length
    check (char_length(content) <= 20000),
  constraint chat_messages_user_question_length
    check (role <> 'USER' or char_length(content) between 3 and 500),
  constraint chat_messages_status_valid
    check (
      (role = 'USER' and status is null and citations = '[]'::jsonb)
      or (
        role = 'ASSISTANT'
        and status is not null
        and status in ('answered', 'insufficient_context', 'restricted')
        and jsonb_typeof(citations) = 'array'
      )
    ),
  constraint chat_messages_position_positive
    check (position > 0),
  constraint chat_messages_session_position_unique
    unique (session_id, position)
);

create index chat_sessions_user_updated_at_idx
  on public.chat_sessions (user_id, updated_at desc);

create index chat_messages_session_position_idx
  on public.chat_messages (session_id, position);

create trigger chat_sessions_set_updated_at
before update on public.chat_sessions
for each row execute function public.set_updated_at();

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

revoke all on table public.chat_sessions from public, anon, authenticated;
revoke all on table public.chat_messages from public, anon, authenticated;

grant select, insert on table public.chat_sessions to authenticated;
grant update (updated_at) on table public.chat_sessions to authenticated;
grant select, insert on table public.chat_messages to authenticated;

grant all on table public.chat_sessions to service_role;
grant all on table public.chat_messages to service_role;

create policy "Users can read their own chat sessions"
on public.chat_sessions
for select
to authenticated
using (
  user_id = (select auth.uid())
);

create policy "Users can create their own chat sessions"
on public.chat_sessions
for insert
to authenticated
with check (
  user_id = (select auth.uid())
);

create policy "Users can update their own chat session activity"
on public.chat_sessions
for update
to authenticated
using (
  user_id = (select auth.uid())
)
with check (
  user_id = (select auth.uid())
);

create policy "Users can read messages from their own chat sessions"
on public.chat_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.chat_sessions
    where chat_sessions.id = chat_messages.session_id
      and chat_sessions.user_id = (select auth.uid())
  )
);

create policy "Users can add messages to their own chat sessions"
on public.chat_messages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.chat_sessions
    where chat_sessions.id = chat_messages.session_id
      and chat_sessions.user_id = (select auth.uid())
  )
);

create or replace function public.append_chat_exchange(
  p_session_id uuid,
  p_title text,
  p_question text,
  p_answer text,
  p_status text,
  p_citations jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_session_id uuid;
  v_next_position integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if p_question is null
    or char_length(btrim(p_question)) not between 3 and 500 then
    raise exception 'Question length is invalid.' using errcode = '22023';
  end if;

  if p_answer is null
    or char_length(btrim(p_answer)) = 0
    or char_length(p_answer) > 20000 then
    raise exception 'Answer length is invalid.' using errcode = '22023';
  end if;

  if p_status is null
    or p_status not in ('answered', 'insufficient_context', 'restricted') then
    raise exception 'Answer status is invalid.' using errcode = '22023';
  end if;

  if p_citations is null
    or jsonb_typeof(p_citations) is distinct from 'array' then
    raise exception 'Citations must be a JSON array.' using errcode = '22023';
  end if;

  if p_session_id is null then
    if p_title is null
      or char_length(btrim(p_title)) = 0
      or char_length(p_title) > 120 then
      raise exception 'Session title is invalid.' using errcode = '22023';
    end if;

    insert into public.chat_sessions (user_id, title)
    values (v_user_id, btrim(p_title))
    returning id into v_session_id;
  else
    select chat_sessions.id
    into v_session_id
    from public.chat_sessions
    where chat_sessions.id = p_session_id
      and chat_sessions.user_id = v_user_id
    for update;

    if v_session_id is null then
      return null;
    end if;
  end if;

  select coalesce(max(chat_messages.position), 0) + 1
  into v_next_position
  from public.chat_messages
  where chat_messages.session_id = v_session_id;

  insert into public.chat_messages (
    session_id,
    role,
    content,
    status,
    citations,
    position
  )
  values
    (
      v_session_id,
      'USER',
      btrim(p_question),
      null,
      '[]'::jsonb,
      v_next_position
    ),
    (
      v_session_id,
      'ASSISTANT',
      p_answer,
      p_status,
      p_citations,
      v_next_position + 1
    );

  update public.chat_sessions
  set updated_at = now()
  where id = v_session_id;

  return v_session_id;
end;
$$;

revoke execute on function public.append_chat_exchange(
  uuid,
  text,
  text,
  text,
  text,
  jsonb
)
from public, anon;

grant execute on function public.append_chat_exchange(
  uuid,
  text,
  text,
  text,
  text,
  jsonb
)
to authenticated;
