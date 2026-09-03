# Modelagem do banco de dados

Esta documentação descreve somente a estrutura de persistência prevista para o
MVP educacional. Autenticação, políticas de acesso e interfaces administrativas
serão implementadas nas etapas correspondentes.

## Relacionamentos

```text
auth.users (1) ─── (1) profiles
profiles   (1) ─── (N) lesson_progress
lessons    (1) ─── (N) lesson_progress

courses        (1) ─── (N) modules
modules        (1) ─── (N) lessons
lessons        (1) ─── (N) lesson_sources
```

## Tabelas

### profiles

Complementa o usuário mantido pelo Supabase Auth.

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `id` | `uuid` | sim | PK e FK para `auth.users.id` |
| `full_name` | `text` | não | Nome informado pelo usuário |
| `role` | `user_role` | sim | `USER` ou `ADMIN`; padrão `USER` |
| `created_at` | `timestamptz` | sim | Preenchido pelo banco |
| `updated_at` | `timestamptz` | sim | Atualizado por trigger |

### courses

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `id` | `uuid` | sim | PK gerada pelo banco |
| `title` | `text` | sim | Não pode ser vazio |
| `description` | `text` | não | Descrição do curso |
| `is_published` | `boolean` | sim | Padrão `false` |
| `created_at` | `timestamptz` | sim | Preenchido pelo banco |
| `updated_at` | `timestamptz` | sim | Atualizado por trigger |

### modules

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `id` | `uuid` | sim | PK gerada pelo banco |
| `course_id` | `uuid` | sim | FK para `courses.id` |
| `title` | `text` | sim | Não pode ser vazio |
| `description` | `text` | não | Descrição do módulo |
| `position` | `integer` | sim | Positiva e única no curso |
| `created_at` | `timestamptz` | sim | Preenchido pelo banco |
| `updated_at` | `timestamptz` | sim | Atualizado por trigger |

### lessons

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `id` | `uuid` | sim | PK gerada pelo banco |
| `module_id` | `uuid` | sim | FK para `modules.id` |
| `title` | `text` | sim | Não pode ser vazio |
| `content` | `text` | sim | Começa vazio para permitir rascunho |
| `position` | `integer` | sim | Positiva e única no módulo |
| `is_published` | `boolean` | sim | Padrão `false` |
| `created_at` | `timestamptz` | sim | Preenchido pelo banco |
| `updated_at` | `timestamptz` | sim | Atualizado por trigger |

### lesson_progress

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `user_id` | `uuid` | sim | PK composta e FK para `profiles.id` |
| `lesson_id` | `uuid` | sim | PK composta e FK para `lessons.id` |
| `completed_at` | `timestamptz` | sim | Data de conclusão |

### lesson_sources

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `id` | `uuid` | sim | PK gerada pelo banco |
| `lesson_id` | `uuid` | sim | FK para `lessons.id` |
| `title` | `text` | sim | Não pode ser vazio |
| `author` | `text` | não | Não deve ser preenchido por suposição |
| `url` | `text` | não | Endereço da fonte, quando existir |
| `publication_year` | `integer` | não | Ano informado pela própria fonte |
| `position` | `integer` | sim | Positiva e única na aula |
| `created_at` | `timestamptz` | sim | Preenchido pelo banco |
| `updated_at` | `timestamptz` | sim | Atualizado por trigger |

## Exclusões relacionadas

- Excluir um usuário remove seu perfil e seu progresso.
- Excluir um curso remove seus módulos, aulas, progresso e fontes.
- A aplicação deverá preferir despublicar cursos e aulas em vez de excluí-los.

## Row Level Security

RLS é habilitada nas seis tabelas pela migration inicial. Na criação do schema,
os privilégios de `anon` e `authenticated` foram revogados para que cada etapa
posterior libere somente as operações necessárias.

As evoluções de acesso são feitas por migrations novas:

- autenticação: leitura e atualização controlada do próprio `profile`;
- cursos: leitura de publicados para usuários autenticados e administração
  somente para perfis `ADMIN`;
- módulos: leitura quando o curso está publicado e administração somente para
  perfis `ADMIN`;
- aulas: leitura de aulas publicadas quando o curso está publicado e
  administração somente para perfis `ADMIN`;
- fontes: leitura vinculada à visibilidade da aula e administração somente para
  perfis `ADMIN`.

A criação e a ordenação de módulos, aulas e fontes usam funções PostgreSQL
transacionais com `SECURITY INVOKER`. Assim, a posição permanece única dentro
do respectivo pai e as funções continuam sujeitas aos grants e às policies RLS
da sessão.

`service_role` mantém acesso administrativo no Supabase e nunca deverá ser
exposta no navegador.

## Aplicação no Supabase

1. Abra o projeto no painel do Supabase.
2. Acesse **SQL Editor** e crie uma nova consulta.
3. Cole o conteúdo de
   `supabase/migrations/20260828000000_create_learning_schema.sql`.
4. Execute a consulta uma única vez.
5. Em outra consulta, execute
   `supabase/tests/learning_schema_validation.sql`.
6. Confirme a mensagem `Estrutura educacional validada com sucesso.`.

As migrations e os testes de acesso adicionados pelas etapas posteriores estão
documentados em `docs/authentication.md`, `docs/courses.md`, `docs/modules.md` e
`docs/lessons.md`.

A migration ainda não aplicada não deve ser marcada como executada apenas por
existir no repositório.
