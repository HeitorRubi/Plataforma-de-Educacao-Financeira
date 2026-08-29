do $$
declare
  table_count integer;
  foreign_key_count integer;
  rls_table_count integer;
  exposed_grant_count integer;
  progress_pk_column_count integer;
begin
  select count(*)
  into table_count
  from information_schema.tables
  where table_schema = 'public'
    and table_name in (
      'profiles',
      'courses',
      'modules',
      'lessons',
      'lesson_progress',
      'lesson_sources'
    );

  if table_count <> 6 then
    raise exception 'Esperadas 6 tabelas do MVP, encontradas %.', table_count;
  end if;

  select count(*)
  into foreign_key_count
  from information_schema.table_constraints
  where constraint_schema = 'public'
    and constraint_type = 'FOREIGN KEY'
    and table_name in (
      'profiles',
      'modules',
      'lessons',
      'lesson_progress',
      'lesson_sources'
    );

  if foreign_key_count <> 6 then
    raise exception 'Esperadas 6 chaves estrangeiras, encontradas %.', foreign_key_count;
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
      'lesson_sources'
    )
    and pg_class.relrowsecurity;

  if rls_table_count <> 6 then
    raise exception 'RLS deveria estar ativa em 6 tabelas, mas está ativa em %.', rls_table_count;
  end if;

  select count(*)
  into exposed_grant_count
  from information_schema.role_table_grants
  where table_schema = 'public'
    and table_name in (
      'profiles',
      'courses',
      'modules',
      'lessons',
      'lesson_progress',
      'lesson_sources'
    )
    and grantee in ('anon', 'authenticated');

  if exposed_grant_count <> 0 then
    raise exception 'Encontrados % privilégios prematuros para anon/authenticated.', exposed_grant_count;
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

  raise notice 'Estrutura educacional validada com sucesso.';
end;
$$;
