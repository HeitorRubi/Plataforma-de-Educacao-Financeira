do $$
declare
  policy_count integer;
  rls_table_count integer;
  function_count integer;
  security_definer_count integer;
  unique_constraint_count integer;
  publication_constraint_count integer;
  source_constraint_count integer;
begin
  select count(*)
  into rls_table_count
  from pg_catalog.pg_class
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_class.relnamespace
  where pg_namespace.nspname = 'public'
    and pg_class.relname in ('lessons', 'lesson_sources')
    and pg_class.relrowsecurity;

  if rls_table_count <> 2 then
    raise exception 'RLS deveria estar ativa em lessons e lesson_sources.';
  end if;

  select count(*)
  into policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and (
      (tablename = 'lessons' and policyname in (
        'Authenticated users can read published lessons',
        'Admins can read all lessons',
        'Admins can create lessons',
        'Admins can update lessons'
      ))
      or
      (tablename = 'lesson_sources' and policyname in (
        'Authenticated users can read published lesson sources',
        'Admins can read all lesson sources',
        'Admins can create lesson sources',
        'Admins can update lesson sources'
      ))
    );

  if policy_count <> 8 then
    raise exception 'Esperadas 8 políticas de aulas/fontes, encontradas %.', policy_count;
  end if;

  if not has_table_privilege('authenticated', 'public.lessons', 'SELECT')
    or not has_table_privilege('authenticated', 'public.lessons', 'INSERT')
    or not has_table_privilege('authenticated', 'public.lessons', 'UPDATE') then
    raise exception 'authenticated deveria possuir SELECT, INSERT e UPDATE em lessons.';
  end if;

  if not has_table_privilege('authenticated', 'public.lesson_sources', 'SELECT')
    or not has_table_privilege('authenticated', 'public.lesson_sources', 'INSERT')
    or not has_table_privilege('authenticated', 'public.lesson_sources', 'UPDATE') then
    raise exception 'authenticated deveria possuir SELECT, INSERT e UPDATE em lesson_sources.';
  end if;

  if has_table_privilege('authenticated', 'public.lessons', 'DELETE')
    or has_table_privilege('authenticated', 'public.lesson_sources', 'DELETE') then
    raise exception 'authenticated não pode excluir aulas ou fontes.';
  end if;

  if has_table_privilege('anon', 'public.lessons', 'SELECT')
    or has_table_privilege('anon', 'public.lesson_sources', 'SELECT') then
    raise exception 'anon não pode consultar aulas ou fontes.';
  end if;

  if has_table_privilege('authenticated', 'public.lesson_progress', 'SELECT')
    or has_table_privilege('authenticated', 'public.lesson_progress', 'INSERT')
    or has_table_privilege('authenticated', 'public.lesson_progress', 'UPDATE')
    or has_table_privilege('authenticated', 'public.lesson_progress', 'DELETE') then
    raise exception 'lesson_progress não deve ser liberada na ETAPA 6.';
  end if;

  select count(*)
  into function_count
  from pg_catalog.pg_proc
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_proc.pronamespace
  where pg_namespace.nspname = 'public'
    and pg_proc.proname in (
      'create_module_lesson',
      'move_module_lesson',
      'create_lesson_source',
      'move_lesson_source'
    );

  if function_count <> 4 then
    raise exception 'Esperadas 4 funções de aulas/fontes, encontradas %.', function_count;
  end if;

  select count(*)
  into security_definer_count
  from pg_catalog.pg_proc
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_proc.pronamespace
  where pg_namespace.nspname = 'public'
    and pg_proc.proname in (
      'create_module_lesson',
      'move_module_lesson',
      'create_lesson_source',
      'move_lesson_source'
    )
    and pg_proc.prosecdef;

  if security_definer_count <> 0 then
    raise exception 'As funções de aulas/fontes devem usar SECURITY INVOKER.';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.create_module_lesson(uuid,uuid,text,text)',
    'EXECUTE'
  ) or not has_function_privilege(
    'authenticated',
    'public.move_module_lesson(uuid,uuid,uuid,integer)',
    'EXECUTE'
  ) or not has_function_privilege(
    'authenticated',
    'public.create_lesson_source(uuid,uuid,uuid,text,text,text,integer)',
    'EXECUTE'
  ) or not has_function_privilege(
    'authenticated',
    'public.move_lesson_source(uuid,uuid,uuid,uuid,integer)',
    'EXECUTE'
  ) then
    raise exception 'authenticated deveria executar as funções de aulas/fontes.';
  end if;

  if has_function_privilege(
    'anon',
    'public.create_module_lesson(uuid,uuid,text,text)',
    'EXECUTE'
  ) or has_function_privilege(
    'anon',
    'public.move_module_lesson(uuid,uuid,uuid,integer)',
    'EXECUTE'
  ) or has_function_privilege(
    'anon',
    'public.create_lesson_source(uuid,uuid,uuid,text,text,text,integer)',
    'EXECUTE'
  ) or has_function_privilege(
    'anon',
    'public.move_lesson_source(uuid,uuid,uuid,uuid,integer)',
    'EXECUTE'
  ) then
    raise exception 'anon não pode executar as funções de aulas/fontes.';
  end if;

  select count(*)
  into unique_constraint_count
  from pg_catalog.pg_constraint
  where conname in (
    'lessons_module_position_unique',
    'lesson_sources_lesson_position_unique'
  )
    and contype = 'u';

  if unique_constraint_count <> 2 then
    raise exception 'As posições devem permanecer únicas no respectivo pai.';
  end if;

  select count(*)
  into publication_constraint_count
  from pg_catalog.pg_constraint
  where conname = 'lessons_published_content_not_blank'
    and contype = 'c';

  if publication_constraint_count <> 1 then
    raise exception 'Aulas publicadas não podem possuir conteúdo vazio.';
  end if;

  select count(*)
  into source_constraint_count
  from pg_catalog.pg_constraint
  where conname in (
    'lesson_sources_url_http',
    'lesson_sources_publication_year_four_digits'
  )
    and contype = 'c';

  if source_constraint_count <> 2 then
    raise exception 'URL e ano das fontes devem possuir validação no banco.';
  end if;

  raise notice 'Acesso, publicação e ordenação de aulas validados com sucesso.';
end;
$$;
