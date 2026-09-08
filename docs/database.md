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

courses + modules + lessons + lesson_sources
                  ↓
         knowledge_documents (view)
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

Na ETAPA 7, `authenticated` recebe apenas `SELECT` e `INSERT`. As policies RLS
permitem consultar somente linhas cujo `user_id` corresponde a `auth.uid()` e
inserir somente o próprio usuário em aulas publicadas de cursos publicados.
Não há `UPDATE` ou `DELETE`; a chave primária composta torna a conclusão
idempotente.

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

## Estruturas derivadas

### knowledge_documents

View somente de leitura criada na ETAPA 9. Cada documento representa uma aula
com conteúdo, publicada dentro de um curso publicado. A view reúne o contexto do
curso, módulo e aula e agrega as fontes da aula em JSON ordenado.

Ela usa `security_invoker` para manter as policies RLS das tabelas de origem e
`security_barrier` para preservar seus filtros. Não existe cópia ou sincronização:
alterações de publicação e conteúdo são refletidas na próxima consulta.

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
- progresso: leitura e inserção somente para o próprio usuário, sem atualização
  ou exclusão.
- base de conhecimento: `SELECT` autenticado na view `knowledge_documents`, com
  `anon` revogado e RLS herdado das tabelas de conteúdo por `security_invoker`.

A criação e a ordenação de módulos, aulas e fontes usam funções PostgreSQL
transacionais com `SECURITY INVOKER`. Assim, a posição permanece única dentro
do respectivo pai e as funções continuam sujeitas aos grants e às policies RLS
da sessão.

Na ETAPA 8 não houve alteração de schema ou de políticas. O arquivo
`supabase/tests/admin_access_validation.sql` consolida a verificação das quatro
tabelas de conteúdo, das doze policies administrativas, da ausência de escrita
para usuários comuns e das funções de criação/ordenação com `SECURITY INVOKER`.

Na ETAPA 9, a view `knowledge_documents` expõe somente aulas publicadas de
cursos publicados com conteúdo não vazio. Os trechos usados pela aplicação são
derivados no servidor e não criam uma tabela adicional. A migration e o teste
SQL foram aplicados e aprovados no Supabase compartilhado em 08/09/2026,
conforme confirmação do desenvolvedor principal.

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
documentados em `docs/authentication.md`, `docs/courses.md`, `docs/modules.md`,
`docs/lessons.md`, `docs/progress.md` e `docs/administration.md`.

A base de conhecimento e seu teste estão documentados em
`docs/knowledge-base.md`.

A migration ainda não aplicada não deve ser marcada como executada apenas por
existir no repositório.
