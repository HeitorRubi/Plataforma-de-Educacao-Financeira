do $$
declare
  policy_count integer;
  rls_enabled boolean;
begin
  select relrowsecurity
  into rls_enabled
  from pg_catalog.pg_class
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_class.relnamespace
  where pg_namespace.nspname = 'public'
    and pg_class.relname = 'courses';

  if rls_enabled is not true then
    raise exception 'RLS deveria estar ativa em public.courses.';
  end if;

  select count(*)
  into policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename = 'courses'
    and policyname in (
      'Authenticated users can read published courses',
      'Admins can read all courses',
      'Admins can create courses',
      'Admins can update courses'
    );

  if policy_count <> 4 then
    raise exception 'Esperadas 4 políticas de courses, encontradas %.', policy_count;
  end if;

  if not has_table_privilege('authenticated', 'public.courses', 'SELECT') then
    raise exception 'authenticated deveria possuir SELECT em courses.';
  end if;

  if not has_table_privilege('authenticated', 'public.courses', 'INSERT') then
    raise exception 'authenticated deveria possuir INSERT em courses.';
  end if;

  if not has_table_privilege('authenticated', 'public.courses', 'UPDATE') then
    raise exception 'authenticated deveria possuir UPDATE em courses.';
  end if;

  if has_table_privilege('authenticated', 'public.courses', 'DELETE') then
    raise exception 'authenticated não pode possuir DELETE em courses.';
  end if;

  if has_table_privilege('anon', 'public.courses', 'SELECT') then
    raise exception 'anon não pode possuir SELECT em courses nesta etapa.';
  end if;

  raise notice 'Acesso de cursos validado com sucesso.';
end;
$$;
