do $$
declare
  view_count integer;
  view_option_count integer;
  column_count integer;
  expected_document_count integer;
  actual_document_count integer;
begin
  select count(*)
  into view_count
  from pg_catalog.pg_class
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_class.relnamespace
  where pg_namespace.nspname = 'public'
    and pg_class.relname = 'knowledge_documents'
    and pg_class.relkind = 'v';

  if view_count <> 1 then
    raise exception 'A view knowledge_documents não foi encontrada.';
  end if;

  select count(*)
  into view_option_count
  from pg_catalog.pg_class
  join pg_catalog.pg_namespace
    on pg_namespace.oid = pg_class.relnamespace
  cross join lateral unnest(
    coalesce(pg_class.reloptions, array[]::text[])
  ) as view_options(option_name)
  where pg_namespace.nspname = 'public'
    and pg_class.relname = 'knowledge_documents'
    and option_name in ('security_invoker=true', 'security_barrier=true');

  if view_option_count <> 2 then
    raise exception 'knowledge_documents deve usar security_invoker e security_barrier.';
  end if;

  select count(*)
  into column_count
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'knowledge_documents'
    and column_name in (
      'course_id',
      'course_title',
      'module_id',
      'module_title',
      'module_position',
      'lesson_id',
      'lesson_title',
      'lesson_position',
      'content',
      'lesson_updated_at',
      'sources'
    );

  if column_count <> 11 then
    raise exception 'Esperadas 11 colunas na view, encontradas %.', column_count;
  end if;

  if not has_table_privilege(
    'authenticated',
    'public.knowledge_documents',
    'SELECT'
  ) then
    raise exception 'authenticated deveria consultar knowledge_documents.';
  end if;

  if has_table_privilege('anon', 'public.knowledge_documents', 'SELECT') then
    raise exception 'anon não pode consultar knowledge_documents.';
  end if;

  if has_table_privilege('authenticated', 'public.knowledge_documents', 'INSERT')
    or has_table_privilege('authenticated', 'public.knowledge_documents', 'UPDATE')
    or has_table_privilege('authenticated', 'public.knowledge_documents', 'DELETE')
  then
    raise exception 'knowledge_documents deve ser somente leitura para authenticated.';
  end if;

  if exists (
    select 1
    from public.knowledge_documents
    join public.lessons
      on lessons.id = knowledge_documents.lesson_id
    join public.modules
      on modules.id = lessons.module_id
    join public.courses
      on courses.id = modules.course_id
    where not courses.is_published
      or not lessons.is_published
      or char_length(btrim(lessons.content)) = 0
  ) then
    raise exception 'A base contém conteúdo não publicado ou vazio.';
  end if;

  select count(*)
  into expected_document_count
  from public.lessons
  join public.modules
    on modules.id = lessons.module_id
  join public.courses
    on courses.id = modules.course_id
  where courses.is_published
    and lessons.is_published
    and char_length(btrim(lessons.content)) > 0;

  select count(*)
  into actual_document_count
  from public.knowledge_documents;

  if actual_document_count <> expected_document_count then
    raise exception
      'Esperados % documentos publicados, encontrados %.',
      expected_document_count,
      actual_document_count;
  end if;

  if exists (
    select knowledge_documents.lesson_id
    from public.knowledge_documents
    group by knowledge_documents.lesson_id
    having count(*) <> 1
  ) then
    raise exception 'Cada aula deve gerar exatamente um documento.';
  end if;

  if exists (
    select 1
    from public.knowledge_documents
    where jsonb_typeof(knowledge_documents.sources) <> 'array'
  ) then
    raise exception 'As fontes de cada documento devem formar um array JSON.';
  end if;

  raise notice 'Base de conhecimento validada com sucesso.';
end;
$$;
