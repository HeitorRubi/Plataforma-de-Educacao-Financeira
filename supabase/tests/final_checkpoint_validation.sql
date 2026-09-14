do $$
declare
  anon_relation text;
  function_signature text;
  policy_count integer;
  required_relation_count integer;
  rls_table_count integer;
  view_options text[];
begin
  select count(*)
  into required_relation_count
  from pg_catalog.pg_class
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_class.relnamespace
  where pg_namespace.nspname = 'public'
    and pg_class.relname in (
      'profiles',
      'courses',
      'modules',
      'lessons',
      'lesson_progress',
      'lesson_sources',
      'chat_sessions',
      'chat_messages',
      'knowledge_documents'
    )
    and pg_class.relkind in ('r', 'v');

  if required_relation_count <> 9 then
    raise exception 'Esperadas 9 relações da aplicação, encontradas %.', required_relation_count;
  end if;

  select count(*)
  into rls_table_count
  from pg_catalog.pg_class
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_class.relnamespace
  where pg_namespace.nspname = 'public'
    and pg_class.relname in (
      'profiles',
      'courses',
      'modules',
      'lessons',
      'lesson_progress',
      'lesson_sources',
      'chat_sessions',
      'chat_messages'
    )
    and pg_class.relrowsecurity;

  if rls_table_count <> 8 then
    raise exception 'RLS deveria estar ativa nas 8 tabelas da aplicação.';
  end if;

  select count(*)
  into policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename in (
      'profiles',
      'courses',
      'modules',
      'lessons',
      'lesson_progress',
      'lesson_sources',
      'chat_sessions',
      'chat_messages'
    );

  if policy_count <> 25 then
    raise exception 'Esperadas 25 policies RLS, encontradas %.', policy_count;
  end if;

  foreach anon_relation in array array[
    'profiles',
    'courses',
    'modules',
    'lessons',
    'lesson_progress',
    'lesson_sources',
    'chat_sessions',
    'chat_messages',
    'knowledge_documents'
  ]
  loop
    if has_table_privilege('anon', format('public.%I', anon_relation), 'SELECT')
      or has_table_privilege('anon', format('public.%I', anon_relation), 'INSERT')
      or has_table_privilege('anon', format('public.%I', anon_relation), 'UPDATE')
      or has_table_privilege('anon', format('public.%I', anon_relation), 'DELETE') then
      raise exception 'anon não pode acessar %.', anon_relation;
    end if;
  end loop;

  if has_schema_privilege('anon', 'public', 'CREATE')
    or has_schema_privilege('authenticated', 'public', 'CREATE') then
    raise exception 'Papéis da API não podem criar objetos no schema public.';
  end if;

  select pg_class.reloptions
  into view_options
  from pg_catalog.pg_class
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_class.relnamespace
  where pg_namespace.nspname = 'public'
    and pg_class.relname = 'knowledge_documents'
    and pg_class.relkind = 'v';

  if view_options is null
    or not ('security_invoker=true' = any(view_options))
    or not ('security_barrier=true' = any(view_options)) then
    raise exception 'knowledge_documents deve preservar security_invoker e security_barrier.';
  end if;

  foreach function_signature in array array[
    'public.create_course_module(uuid, text, text)',
    'public.move_course_module(uuid, uuid, integer)',
    'public.create_module_lesson(uuid, uuid, text, text)',
    'public.move_module_lesson(uuid, uuid, uuid, integer)',
    'public.create_lesson_source(uuid, uuid, uuid, text, text, text, integer)',
    'public.move_lesson_source(uuid, uuid, uuid, uuid, integer)',
    'public.append_chat_exchange(uuid, text, text, text, text, jsonb)'
  ]
  loop
    if has_function_privilege('anon', function_signature, 'EXECUTE')
      or not has_function_privilege('authenticated', function_signature, 'EXECUTE') then
      raise exception 'Privilégio inesperado na função %.', function_signature;
    end if;
  end loop;

  if has_function_privilege('authenticated', 'public.handle_new_user()', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.set_updated_at()', 'EXECUTE') then
    raise exception 'Funções internas de trigger não podem ser RPCs autenticados.';
  end if;

  if not has_function_privilege(
    'supabase_auth_admin',
    'public.handle_new_user()',
    'EXECUTE'
  ) then
    raise exception 'supabase_auth_admin deveria executar handle_new_user.';
  end if;

  raise notice 'Checkpoint final do banco validado com sucesso.';
end;
$$;
