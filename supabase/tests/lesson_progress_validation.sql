do $$
declare
  rls_enabled boolean;
  policy_count integer;
  select_policy_count integer;
  insert_policy_count integer;
  forbidden_policy_count integer;
  progress_pk_column_count integer;
  completed_at_has_default boolean;
begin
  select pg_class.relrowsecurity
  into rls_enabled
  from pg_catalog.pg_class
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_class.relnamespace
  where pg_namespace.nspname = 'public'
    and pg_class.relname = 'lesson_progress';

  if rls_enabled is distinct from true then
    raise exception 'RLS deveria estar ativa em lesson_progress.';
  end if;

  select count(*)
  into policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename = 'lesson_progress';

  if policy_count <> 2 then
    raise exception 'Esperadas 2 políticas em lesson_progress, encontradas %.', policy_count;
  end if;

  select count(*)
  into select_policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename = 'lesson_progress'
    and policyname = 'Users can read their own lesson progress'
    and cmd = 'SELECT'
    and 'authenticated' = any(roles)
    and qual like '%auth.uid()%'
    and qual like '%user_id%';

  if select_policy_count <> 1 then
    raise exception 'A política de leitura do próprio progresso não está configurada corretamente.';
  end if;

  select count(*)
  into insert_policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename = 'lesson_progress'
    and policyname = 'Users can complete published lessons'
    and cmd = 'INSERT'
    and 'authenticated' = any(roles)
    and with_check like '%auth.uid()%'
    and with_check like '%user_id%'
    and with_check like '%is_published%';

  if insert_policy_count <> 1 then
    raise exception 'A política de conclusão de aulas publicadas não está configurada corretamente.';
  end if;

  select count(*)
  into forbidden_policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename = 'lesson_progress'
    and cmd in ('UPDATE', 'DELETE');

  if forbidden_policy_count <> 0 then
    raise exception 'lesson_progress não deve possuir políticas de UPDATE ou DELETE nesta etapa.';
  end if;

  if not has_table_privilege('authenticated', 'public.lesson_progress', 'SELECT') then
    raise exception 'authenticated deveria possuir SELECT em lesson_progress.';
  end if;

  if not has_table_privilege('authenticated', 'public.lesson_progress', 'INSERT') then
    raise exception 'authenticated deveria possuir INSERT em lesson_progress.';
  end if;

  if has_table_privilege('authenticated', 'public.lesson_progress', 'UPDATE') then
    raise exception 'authenticated não pode possuir UPDATE em lesson_progress.';
  end if;

  if has_table_privilege('authenticated', 'public.lesson_progress', 'DELETE') then
    raise exception 'authenticated não pode possuir DELETE em lesson_progress.';
  end if;

  if has_table_privilege('anon', 'public.lesson_progress', 'SELECT')
    or has_table_privilege('anon', 'public.lesson_progress', 'INSERT') then
    raise exception 'anon não pode acessar lesson_progress.';
  end if;

  select count(*)
  into progress_pk_column_count
  from information_schema.table_constraints
  join information_schema.key_column_usage
    on key_column_usage.constraint_name = table_constraints.constraint_name
    and key_column_usage.constraint_schema = table_constraints.constraint_schema
  where table_constraints.constraint_schema = 'public'
    and table_constraints.table_name = 'lesson_progress'
    and table_constraints.constraint_type = 'PRIMARY KEY'
    and key_column_usage.column_name in ('user_id', 'lesson_id');

  if progress_pk_column_count <> 2 then
    raise exception 'A PK de lesson_progress deve conter user_id e lesson_id.';
  end if;

  select column_default is not null
  into completed_at_has_default
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'lesson_progress'
    and column_name = 'completed_at';

  if completed_at_has_default is distinct from true then
    raise exception 'lesson_progress.completed_at deveria possuir valor padrão.';
  end if;

  raise notice 'Acesso e estrutura de progresso validados com sucesso.';
end;
$$;
