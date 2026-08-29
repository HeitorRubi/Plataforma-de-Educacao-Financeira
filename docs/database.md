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

RLS é habilitada nas seis tabelas pela migration. Nenhuma política é criada
nesta etapa, e os privilégios de `anon` e `authenticated` são revogados. Assim,
esses clientes não acessam as tabelas pela API até que privilégios e políticas
específicos sejam implementados. `service_role` mantém acesso administrativo e
nunca deverá ser exposta no navegador.

## Aplicação no Supabase

1. Abra o projeto no painel do Supabase.
2. Acesse **SQL Editor** e crie uma nova consulta.
3. Cole o conteúdo de
   `supabase/migrations/20260828000000_create_learning_schema.sql`.
4. Execute a consulta uma única vez.
5. Em outra consulta, execute
   `supabase/tests/learning_schema_validation.sql`.
6. Confirme a mensagem `Estrutura educacional validada com sucesso.`.

A migration ainda não aplicada não deve ser marcada como executada apenas por
existir no repositório.
