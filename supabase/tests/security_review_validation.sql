do $$
declare
  application_table text;
  constraint_count integer;
  private_policy_count integer;
  rls_table_count integer;
  security_definer_count integer;
  function_signature text;
begin
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

  foreach application_table in array array[
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
    if has_table_privilege('anon', format('public.%I', application_table), 'SELECT')
      or has_table_privilege('anon', format('public.%I', application_table), 'INSERT')
      or has_table_privilege('anon', format('public.%I', application_table), 'UPDATE')
      or has_table_privilege('anon', format('public.%I', application_table), 'DELETE') then
      raise exception 'anon não pode acessar %.', application_table;
    end if;
  end loop;

  select count(*)
  into private_policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename in (
      'profiles',
      'lesson_progress',
      'chat_sessions',
      'chat_messages'
    )
    and 'authenticated' = any(roles)
    and (
      coalesce(qual, '') like '%auth.uid()%'
      or coalesce(with_check, '') like '%auth.uid()%'
    );

  if private_policy_count <> 9 then
    raise exception 'Esperadas 9 policies privadas por auth.uid(), encontradas %.', private_policy_count;
  end if;

  if has_schema_privilege('anon', 'public', 'CREATE')
    or has_schema_privilege('authenticated', 'public', 'CREATE') then
    raise exception 'Papéis da API não podem criar objetos no schema public.';
  end if;

  select count(*)
  into constraint_count
  from pg_catalog.pg_constraint
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_constraint.connamespace
  where pg_namespace.nspname = 'public'
    and pg_constraint.convalidated
    and pg_constraint.conname in (
      'profiles_full_name_length',
      'courses_title_length',
      'courses_description_length',
      'modules_title_length',
      'modules_description_length',
      'lessons_title_length',
      'lessons_content_length',
      'lesson_sources_title_length',
      'lesson_sources_author_length',
      'lesson_sources_url_length',
      'chat_messages_user_question_trimmed_length',
      'chat_messages_citations_match_status'
    );

  if constraint_count <> 12 then
    raise exception 'Esperadas 12 constraints de entrada validadas, encontradas %.', constraint_count;
  end if;

  select count(*)
  into security_definer_count
  from pg_catalog.pg_proc
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_proc.pronamespace
  where pg_namespace.nspname = 'public'
    and pg_proc.prosecdef;

  if security_definer_count <> 1
    or not (
      select pg_proc.prosecdef
      from pg_catalog.pg_proc
      where pg_proc.oid = 'public.handle_new_user()'::regprocedure
    ) then
    raise exception 'Somente handle_new_user deve usar SECURITY DEFINER.';
  end if;

  foreach function_signature in array array[
    'public.set_updated_at()',
    'public.handle_new_user()',
    'public.create_course_module(uuid, text, text)',
    'public.move_course_module(uuid, uuid, integer)',
    'public.create_module_lesson(uuid, uuid, text, text)',
    'public.move_module_lesson(uuid, uuid, uuid, integer)',
    'public.create_lesson_source(uuid, uuid, uuid, text, text, text, integer)',
    'public.move_lesson_source(uuid, uuid, uuid, uuid, integer)',
    'public.append_chat_exchange(uuid, text, text, text, text, jsonb)'
  ]
  loop
    if has_function_privilege('anon', function_signature, 'EXECUTE') then
      raise exception 'anon não pode executar a função %.', function_signature;
    end if;
  end loop;

  if has_function_privilege(
    'authenticated',
    'public.set_updated_at()',
    'EXECUTE'
  ) or has_function_privilege(
    'authenticated',
    'public.handle_new_user()',
    'EXECUTE'
  ) then
    raise exception 'authenticated não pode executar funções internas de trigger.';
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
    if not has_function_privilege(
      'authenticated',
      function_signature,
      'EXECUTE'
    ) then
      raise exception 'authenticated deveria executar a função %.', function_signature;
    end if;
  end loop;

  if not has_function_privilege(
    'supabase_auth_admin',
    'public.handle_new_user()',
    'EXECUTE'
  ) then
    raise exception 'supabase_auth_admin deveria executar handle_new_user.';
  end if;

  raise notice 'Revisão estrutural de segurança validada com sucesso.';
end;
$$;
