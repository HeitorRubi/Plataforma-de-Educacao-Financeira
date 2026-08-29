do $$
declare
  trigger_count integer;
  policy_count integer;
begin
  select count(*)
  into trigger_count
  from information_schema.triggers
  where event_object_schema = 'auth'
    and event_object_table = 'users'
    and trigger_name = 'on_auth_user_created';

  if trigger_count <> 1 then
    raise exception 'O trigger on_auth_user_created não foi encontrado.';
  end if;

  select count(*)
  into policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename = 'profiles'
    and policyname in (
      'Users can read their own profile',
      'Users can update their own profile'
    );

  if policy_count <> 2 then
    raise exception 'Esperadas 2 políticas de profiles, encontradas %.', policy_count;
  end if;

  if not has_table_privilege('authenticated', 'public.profiles', 'SELECT') then
    raise exception 'authenticated deveria possuir SELECT em profiles.';
  end if;

  if not has_column_privilege('authenticated', 'public.profiles', 'full_name', 'UPDATE') then
    raise exception 'authenticated deveria atualizar profiles.full_name.';
  end if;

  if has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE') then
    raise exception 'authenticated não pode atualizar profiles.role.';
  end if;

  if has_function_privilege('anon', 'public.handle_new_user()', 'EXECUTE') then
    raise exception 'anon não pode executar handle_new_user diretamente.';
  end if;

  raise notice 'Estrutura de autenticação validada com sucesso.';
end;
$$;
