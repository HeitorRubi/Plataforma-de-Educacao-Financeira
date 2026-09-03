# Status Atual do Projeto

Atualizado a partir do repositório e dos testes executados em 03/09/2026.

## Baseline Git observado

```text
branch integrada: main
base funcional integrada observada: 65712a2
última etapa integrada: ETAPA 5 — MÓDULOS
branch ativa: feature/lessons
tarefa pronta para revisão: ETAPA 6 — AULAS
```

Histórico principal observado:

```text
65712a2  Adicionado gerenciamento de módulos
94e7a2f  Gerenciamento e catálogo de cursos integrado à main
610560d  Contexto compartilhado entre Codex
562a4e2  Autenticação de usuários com Supabase
90bc3ee  Banco criado no Supabase, relacionamentos validados e documentação
84a9895  Projeto Next.js base configurado e funcionando localmente
9a1f980  Initial commit
```

Há também o commit de resolução `6d9917f` relacionado ao README.

## Stack observada

- Next.js `16.3.3`
- React `19.2.8`
- TypeScript `^5`
- Tailwind CSS `^4`
- `@supabase/supabase-js`
- `@supabase/ssr`
- ESLint

## Etapas observadas

### ETAPA 1 — concluída no histórico Git

Projeto Next.js base configurado.

### ETAPA 2 — concluída no histórico Git

Estrutura de persistência presente:

- `profiles`
- `courses`
- `modules`
- `lessons`
- `lesson_progress`
- `lesson_sources`

Arquivos principais:

- `supabase/migrations/20260828000000_create_learning_schema.sql`
- `supabase/tests/learning_schema_validation.sql`
- `docs/database.md`

### ETAPA 3 — concluída no histórico Git

Implementação observada:

- cadastro;
- login;
- logout;
- sessão via Supabase SSR;
- área autenticada;
- perfil;
- roles `USER` / `ADMIN`;
- criação automática de `profiles`;
- RLS de perfil;
- atualização apenas de `full_name`.

Arquivos principais:

- `src/app/auth/actions.ts`
- `src/lib/auth/session.ts`
- `src/lib/supabase/*`
- `src/proxy.ts`
- `src/app/login/`
- `src/app/cadastro/`
- `src/app/perfil/`
- `src/app/area-autenticada/`
- `supabase/migrations/20260828010000_configure_auth_profiles.sql`
- `supabase/tests/auth_profiles_validation.sql`
- `docs/authentication.md`

### ETAPA 4 — concluída no histórico Git

Implementação observada:

- criação, listagem, consulta e edição administrativa de cursos;
- publicação e despublicação sem exclusão física;
- listagem e consulta de cursos publicados pelo usuário;
- verificação `ADMIN` nas páginas e Server Actions;
- grants mínimos e policies RLS em `public.courses`;
- estados vazio, carregamento, erro e retorno de formulário.

Arquivos principais:

- `src/app/admin/cursos/`;
- `src/app/cursos/`;
- `src/components/courses/`;
- `src/lib/courses/`;
- `supabase/migrations/20260829000000_configure_course_access.sql`;
- `supabase/tests/course_access_validation.sql`;
- `docs/courses.md`.

Validações reais registradas:

- migration aplicada no Supabase;
- teste SQL executado sem exceção;
- `ADMIN` criou, editou, publicou e despublicou curso;
- `USER` visualizou somente o curso publicado;
- curso rascunho não apareceu no catálogo;
- `USER` não recebeu acesso à administração;
- lint e build aprovados.

### ETAPA 5 — integrada na `main`

Implementação observada:

- criação e edição de módulos vinculados a cursos;
- posição automática ao final do curso;
- listagem ordenada na administração;
- movimentação para cima e para baixo;
- visualização dos módulos em cursos publicados;
- verificação `ADMIN` nas Server Actions;
- grants mínimos e policies RLS em `public.modules`;
- funções PostgreSQL transacionais com `SECURITY INVOKER`;
- ausência de exclusão física e de funcionalidades de aulas.

Arquivos principais:

- `src/app/admin/cursos/[id]/modulos/`;
- `src/components/modules/`;
- `src/lib/modules/`;
- `supabase/migrations/20260902000000_configure_module_access.sql`;
- `supabase/tests/module_access_validation.sql`;
- `docs/modules.md`.

Validações reais registradas:

- migration e teste SQL informados pelo usuário como aprovados no Supabase;
- `ADMIN` criou dois módulos de teste, editou e reordenou;
- ações de criação, edição e ordenação executadas sem erro no servidor;
- `USER` visualizou os dois módulos na ordem persistida;
- controles administrativos não apareceram para o usuário comum;
- lint e build aprovados.

### ETAPA 6 — concluída na branch `feature/lessons`

Implementação observada:

- criação, consulta e edição de aulas textuais vinculadas aos módulos;
- conteúdo em Markdown com visualização segura, sem HTML bruto;
- publicação e despublicação, exigindo conteúdo para publicar;
- ordenação de aulas dentro do módulo;
- criação, edição e ordenação de fontes estruturadas;
- catálogo exibindo somente aulas publicadas;
- leitura com fontes e navegação para a aula anterior e a próxima;
- verificação `ADMIN` nas Server Actions;
- grants mínimos e policies RLS em `public.lessons` e `public.lesson_sources`;
- ausência de vídeos, progresso e exclusão física.

Arquivos principais:

- `src/app/admin/cursos/[id]/modulos/[moduleId]/`;
- `src/app/cursos/[id]/modulos/[moduleId]/aulas/`;
- `src/components/lessons/`;
- `src/lib/lessons/`;
- `supabase/migrations/20260903000000_configure_lesson_access.sql`;
- `supabase/tests/lesson_access_validation.sql`;
- `docs/lessons.md`.

Validações reais registradas:

- migration e teste SQL informados pelo usuário como aprovados no Supabase;
- `ADMIN` criou e publicou duas aulas de teste;
- `ADMIN` criou e reordenou duas fontes de teste;
- ações de criação, publicação e ordenação executadas sem erro no servidor;
- `USER` visualizou o conteúdo Markdown e as fontes da aula publicada;
- aula não publicada não apareceu para `USER`;
- navegação entre Aula 1 e Aula 2 validada nos dois sentidos;
- lint e build aprovados.

## Próxima ação

Revisar, criar o commit e integrar a branch `feature/lessons` na `main`.

A ETAPA 7 — PROGRESSO não deve ser iniciada antes dessa integração e de
autorização explícita do desenvolvedor principal.

## Pontos que não foram verificados externamente nesta análise

O agente não consulta diretamente o painel do Supabase. O estado remoto das
ETAPAS 4, 5 e 6 foi confirmado pelas execuções e imagens fornecidas pelo usuário.

Alterações externas futuras ainda precisam ser registradas e testadas; não se
deve presumir que o painel permaneceu igual apenas com base neste documento.

## Dívida de documentação observada

O `README.md` ainda descreve a versão como contendo apenas o ambiente base, embora o histórico já contenha banco e autenticação.

Atualizar o README em uma tarefa de documentação apropriada, sem misturar essa correção a uma funcionalidade não relacionada.

## Próxima sincronização recomendada

Antes de qualquer alteração:

```bash
git fetch origin
git status --short --branch
git log --oneline --decorate -10
```

Depois confirmar que a base local corresponde ao `origin/main` esperado.
