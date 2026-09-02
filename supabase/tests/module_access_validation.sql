do $$
declare
  policy_count integer;
  rls_enabled boolean;
  unique_constraint_count integer;
  security_definer_count integer;
begin
  select relrowsecurity
  into rls_enabled
  from pg_catalog.pg_class
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_class.relnamespace
  where pg_namespace.nspname = 'public'
    and pg_class.relname = 'modules';

  if rls_enabled is not true then
    raise exception 'RLS deveria estar ativa em public.modules.';
  end if;

  select count(*)
  into policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename = 'modules'
    and policyname in (
      'Authenticated users can read published course modules',
      'Admins can read all modules',
      'Admins can create modules',
      'Admins can update modules'
    );

  if policy_count <> 4 then
    raise exception 'Esperadas 4 políticas de modules, encontradas %.', policy_count;
  end if;

  if not has_table_privilege('authenticated', 'public.modules', 'SELECT') then
    raise exception 'authenticated deveria possuir SELECT em modules.';
  end if;

  if not has_table_privilege('authenticated', 'public.modules', 'INSERT') then
    raise exception 'authenticated deveria possuir INSERT em modules.';
  end if;

  if not has_table_privilege('authenticated', 'public.modules', 'UPDATE') then
    raise exception 'authenticated deveria possuir UPDATE em modules.';
  end if;

  if has_table_privilege('authenticated', 'public.modules', 'DELETE') then
    raise exception 'authenticated não pode possuir DELETE em modules.';
  end if;

  if has_table_privilege('anon', 'public.modules', 'SELECT') then
    raise exception 'anon não pode possuir SELECT em modules nesta etapa.';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.create_course_module(uuid,text,text)',
    'EXECUTE'
  ) then
    raise exception 'authenticated deveria executar create_course_module.';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.move_course_module(uuid,uuid,integer)',
    'EXECUTE'
  ) then
    raise exception 'authenticated deveria executar move_course_module.';
  end if;

  if has_function_privilege(
    'anon',
    'public.create_course_module(uuid,text,text)',
    'EXECUTE'
  ) or has_function_privilege(
    'anon',
    'public.move_course_module(uuid,uuid,integer)',
    'EXECUTE'
  ) then
    raise exception 'anon não pode executar as funções de módulos.';
  end if;

  select count(*)
  into security_definer_count
  from pg_catalog.pg_proc
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_proc.pronamespace
  where pg_namespace.nspname = 'public'
    and pg_proc.proname in (
      'create_course_module',
      'move_course_module'
    )
    and pg_proc.prosecdef;

  if security_definer_count <> 0 then
    raise exception 'As funções de módulos devem usar SECURITY INVOKER.';
  end if;

  select count(*)
  into unique_constraint_count
  from pg_catalog.pg_constraint
  join pg_catalog.pg_class
    on pg_class.oid = pg_constraint.conrelid
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_class.relnamespace
  where pg_namespace.nspname = 'public'
    and pg_class.relname = 'modules'
    and pg_constraint.conname = 'modules_course_position_unique'
    and pg_constraint.contype = 'u';

  if unique_constraint_count <> 1 then
    raise exception 'A posição deve permanecer única dentro de cada curso.';
  end if;

  raise notice 'Acesso e ordenação de módulos validados com sucesso.';
end;
$$;
