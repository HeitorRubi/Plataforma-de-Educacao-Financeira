# Cursos

A ETAPA 4 utiliza a tabela `public.courses` criada na modelagem inicial. Não há
exclusão física no fluxo da aplicação: um curso pode ser publicado ou voltar a
rascunho.

## Fluxos

### Administração

```text
ADMIN
  ↓
CRIA RASCUNHO
  ↓
CONSULTA / EDITA
  ↓
PUBLICA OU DESPUBLICA
```

### Usuário

```text
USER AUTENTICADO
  ↓
LISTA CURSOS PUBLICADOS
  ↓
CONSULTA CURSO PUBLICADO
```

## Rotas

```text
/admin/cursos                 lista administrativa
/admin/cursos/novo            criação de rascunho
/admin/cursos/[id]            consulta e publicação
/admin/cursos/[id]/editar     edição
/cursos                       catálogo publicado
/cursos/[id]                  consulta de curso publicado
```

Nenhuma dessas rotas implementa módulos ou aulas.

## Segurança

- As páginas e Server Actions administrativas chamam `requireAdmin()`.
- As ações validam novamente a autorização, mesmo quando o formulário é exibido
  somente para administradores.
- O cliente usa a sessão do usuário e a chave publicável do Supabase.
- A aplicação não usa `service_role` para administrar cursos.
- O banco concede a `authenticated` somente `SELECT`, `INSERT` e `UPDATE`.
- As policies RLS liberam mutações somente quando o perfil do usuário possui
  `role = 'ADMIN'`.
- Usuários comuns leem somente linhas com `is_published = true`.
- `anon` não recebe acesso e `DELETE` permanece sem privilégio.

Grants e policies são duas verificações diferentes: o grant permite que a role
tente a operação, enquanto o RLS decide quais linhas cada usuário pode acessar.

## Aplicação no Supabase

No SQL Editor, execute uma única vez o conteúdo completo de:

```text
supabase/migrations/20260829000000_configure_course_access.sql
```

Depois execute o conteúdo completo de:

```text
supabase/tests/course_access_validation.sql
```

O teste deve terminar sem exceção e emitir o aviso:

```text
Acesso de cursos validado com sucesso.
```

## Primeiro administrador

O cadastro sempre cria perfis `USER`. Para preparar uma conta administrativa no
ambiente acadêmico, um responsável pelo banco deve promover explicitamente uma
conta existente pelo SQL Editor, substituindo o e-mail do exemplo:

```sql
update public.profiles
set role = 'ADMIN'
where id = (
  select id
  from auth.users
  where email = 'EMAIL_DA_CONTA_ADMIN'
);
```

O e-mail real não deve ser salvo em migrations ou documentação versionada.

## Dados de teste

Para validar publicação sem apresentar conteúdo financeiro fictício como
definitivo, use nomes claramente identificados:

```text
Curso Publicado de Teste
Curso Rascunho de Teste
```
