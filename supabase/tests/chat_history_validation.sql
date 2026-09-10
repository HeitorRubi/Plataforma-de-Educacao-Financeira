do $$
declare
  sessions_rls_enabled boolean;
  messages_rls_enabled boolean;
  session_policy_count integer;
  message_policy_count integer;
  session_fk_count integer;
  message_fk_count integer;
  session_trigger_count integer;
  function_is_security_definer boolean;
begin
  select relrowsecurity
  into sessions_rls_enabled
  from pg_catalog.pg_class
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_class.relnamespace
  where pg_namespace.nspname = 'public'
    and pg_class.relname = 'chat_sessions';

  select relrowsecurity
  into messages_rls_enabled
  from pg_catalog.pg_class
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_class.relnamespace
  where pg_namespace.nspname = 'public'
    and pg_class.relname = 'chat_messages';

  if sessions_rls_enabled is distinct from true
    or messages_rls_enabled is distinct from true then
    raise exception 'RLS deveria estar ativa nas tabelas de histórico.';
  end if;

  select count(*)
  into session_policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename = 'chat_sessions'
    and 'authenticated' = any(roles)
    and (qual is not null or with_check is not null);

  if session_policy_count <> 3 then
    raise exception 'Esperadas 3 políticas em chat_sessions, encontradas %.', session_policy_count;
  end if;

  select count(*)
  into message_policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename = 'chat_messages'
    and 'authenticated' = any(roles)
    and (
      coalesce(qual, '') like '%auth.uid()%'
      or coalesce(with_check, '') like '%auth.uid()%'
    );

  if message_policy_count <> 2 then
    raise exception 'Esperadas 2 políticas próprias em chat_messages, encontradas %.', message_policy_count;
  end if;

  if not has_table_privilege('authenticated', 'public.chat_sessions', 'SELECT')
    or not has_table_privilege('authenticated', 'public.chat_sessions', 'INSERT') then
    raise exception 'authenticated deveria consultar e criar chat_sessions.';
  end if;

  if not has_column_privilege(
    'authenticated',
    'public.chat_sessions',
    'updated_at',
    'UPDATE'
  ) then
    raise exception 'authenticated deveria atualizar somente a atividade da sessão.';
  end if;

  if has_column_privilege('authenticated', 'public.chat_sessions', 'user_id', 'UPDATE')
    or has_column_privilege('authenticated', 'public.chat_sessions', 'title', 'UPDATE')
    or has_table_privilege('authenticated', 'public.chat_sessions', 'DELETE') then
    raise exception 'authenticated não pode alterar proprietário/título nem excluir sessões.';
  end if;

  if not has_table_privilege('authenticated', 'public.chat_messages', 'SELECT')
    or not has_table_privilege('authenticated', 'public.chat_messages', 'INSERT') then
    raise exception 'authenticated deveria consultar e criar chat_messages.';
  end if;

  if has_table_privilege('authenticated', 'public.chat_messages', 'UPDATE')
    or has_table_privilege('authenticated', 'public.chat_messages', 'DELETE') then
    raise exception 'authenticated não pode alterar nem excluir mensagens.';
  end if;

  if has_table_privilege('anon', 'public.chat_sessions', 'SELECT')
    or has_table_privilege('anon', 'public.chat_sessions', 'INSERT')
    or has_table_privilege('anon', 'public.chat_sessions', 'UPDATE')
    or has_table_privilege('anon', 'public.chat_sessions', 'DELETE')
    or has_table_privilege('anon', 'public.chat_messages', 'SELECT')
    or has_table_privilege('anon', 'public.chat_messages', 'INSERT')
    or has_table_privilege('anon', 'public.chat_messages', 'UPDATE')
    or has_table_privilege('anon', 'public.chat_messages', 'DELETE') then
    raise exception 'anon não pode acessar o histórico.';
  end if;

  select count(*)
  into session_fk_count
  from information_schema.table_constraints
  where constraint_schema = 'public'
    and table_name = 'chat_sessions'
    and constraint_type = 'FOREIGN KEY';

  select count(*)
  into message_fk_count
  from information_schema.table_constraints
  where constraint_schema = 'public'
    and table_name = 'chat_messages'
    and constraint_type = 'FOREIGN KEY';

  if session_fk_count <> 1 or message_fk_count <> 1 then
    raise exception 'Relacionamentos do histórico não estão configurados corretamente.';
  end if;

  select count(*)
  into session_trigger_count
  from information_schema.triggers
  where event_object_schema = 'public'
    and event_object_table = 'chat_sessions'
    and trigger_name = 'chat_sessions_set_updated_at';

  if session_trigger_count <> 1 then
    raise exception 'Trigger de atualização da sessão não encontrado.';
  end if;

  select prosecdef
  into function_is_security_definer
  from pg_catalog.pg_proc
  where pg_proc.oid =
    'public.append_chat_exchange(uuid, text, text, text, text, jsonb)'::regprocedure;

  if function_is_security_definer is distinct from false then
    raise exception 'append_chat_exchange deve usar SECURITY INVOKER.';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.append_chat_exchange(uuid, text, text, text, text, jsonb)',
    'EXECUTE'
  ) then
    raise exception 'authenticated deveria executar append_chat_exchange.';
  end if;

  if has_function_privilege(
    'anon',
    'public.append_chat_exchange(uuid, text, text, text, text, jsonb)',
    'EXECUTE'
  ) then
    raise exception 'anon não pode executar append_chat_exchange.';
  end if;

  raise notice 'Estrutura, privilégios e RLS do histórico validados com sucesso.';
end;
$$;
