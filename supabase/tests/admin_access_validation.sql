do $$
declare
  content_table text;
  function_signature text;
  rls_table_count integer;
  admin_policy_count integer;
  non_admin_write_policy_count integer;
  security_definer_function_count integer;
begin
  select count(*)
  into rls_table_count
  from pg_catalog.pg_class
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_class.relnamespace
  where pg_namespace.nspname = 'public'
    and pg_class.relname in (
      'courses',
      'modules',
      'lessons',
      'lesson_sources'
    )
    and pg_class.relrowsecurity;

  if rls_table_count <> 4 then
    raise exception 'RLS deveria estar ativa nas 4 tabelas administrativas.';
  end if;

  select count(*)
  into admin_policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename in ('courses', 'modules', 'lessons', 'lesson_sources')
    and policyname in (
      'Admins can read all courses',
      'Admins can create courses',
      'Admins can update courses',
      'Admins can read all modules',
      'Admins can create modules',
      'Admins can update modules',
      'Admins can read all lessons',
      'Admins can create lessons',
      'Admins can update lessons',
      'Admins can read all lesson sources',
      'Admins can create lesson sources',
      'Admins can update lesson sources'
    );

  if admin_policy_count <> 12 then
    raise exception 'Esperadas 12 políticas administrativas, encontradas %.', admin_policy_count;
  end if;

  select count(*)
  into non_admin_write_policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename in ('courses', 'modules', 'lessons', 'lesson_sources')
    and cmd in ('INSERT', 'UPDATE', 'DELETE')
    and policyname not like 'Admins can %';

  if non_admin_write_policy_count <> 0 then
    raise exception 'Encontradas % políticas de escrita não administrativas.', non_admin_write_policy_count;
  end if;

  foreach content_table in array array[
    'courses',
    'modules',
    'lessons',
    'lesson_sources'
  ]
  loop
    if not has_table_privilege('authenticated', format('public.%I', content_table), 'SELECT')
      or not has_table_privilege('authenticated', format('public.%I', content_table), 'INSERT')
      or not has_table_privilege('authenticated', format('public.%I', content_table), 'UPDATE')
    then
      raise exception 'authenticated não possui os privilégios esperados em %.', content_table;
    end if;

    if has_table_privilege(
      'authenticated',
      format('public.%I', content_table),
      'DELETE'
    ) then
      raise exception 'authenticated não pode excluir registros de %.', content_table;
    end if;

    if has_table_privilege('anon', format('public.%I', content_table), 'SELECT')
      or has_table_privilege('anon', format('public.%I', content_table), 'INSERT')
      or has_table_privilege('anon', format('public.%I', content_table), 'UPDATE')
      or has_table_privilege('anon', format('public.%I', content_table), 'DELETE')
    then
      raise exception 'anon não pode acessar a tabela %.', content_table;
    end if;
  end loop;

  select count(*)
  into security_definer_function_count
  from pg_catalog.pg_proc
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_proc.pronamespace
  where pg_namespace.nspname = 'public'
    and pg_proc.proname in (
      'create_course_module',
      'move_course_module',
      'create_module_lesson',
      'move_module_lesson',
      'create_lesson_source',
      'move_lesson_source'
    )
    and pg_proc.prosecdef;

  if security_definer_function_count <> 0 then
    raise exception 'As funções administrativas devem usar SECURITY INVOKER.';
  end if;

  foreach function_signature in array array[
    'public.create_course_module(uuid, text, text)',
    'public.move_course_module(uuid, uuid, integer)',
    'public.create_module_lesson(uuid, uuid, text, text)',
    'public.move_module_lesson(uuid, uuid, uuid, integer)',
    'public.create_lesson_source(uuid, uuid, uuid, text, text, text, integer)',
    'public.move_lesson_source(uuid, uuid, uuid, uuid, integer)'
  ]
  loop
    if has_function_privilege('anon', function_signature, 'EXECUTE') then
      raise exception 'anon não pode executar a função %.', function_signature;
    end if;

    if not has_function_privilege('authenticated', function_signature, 'EXECUTE') then
      raise exception 'authenticated deveria executar a função %.', function_signature;
    end if;
  end loop;

  raise notice 'Acesso administrativo validado com sucesso.';
end;
$$;
