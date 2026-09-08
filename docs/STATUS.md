# Status Atual do Projeto

Atualizado a partir do repositório e dos testes executados em 08/09/2026.

## Baseline Git observado

```text
branch integrada: main
base funcional integrada observada: eb1e008
última validação integrada: CHECKPOINT 1 — PLATAFORMA EDUCACIONAL
branch ativa: feature/knowledge-base
tarefa atual: ETAPA 9 — BASE DE CONHECIMENTO
```

Histórico principal observado:

```text
eb1e008  Documentação e aprovação do CHECKPOINT 1 integradas à main
149068b  Painel administrativo integrado à main
2c143d1  Progresso de aulas integrado à main
99c9495  Implementação do painel administrativo
195bebf  Implementação do progresso de aulas
1eb21ae  Aulas textuais e fontes
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

### ETAPA 6 — integração na `main` confirmada pelo usuário

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

### ETAPA 7 — integração na `main` confirmada pelo usuário

Implementação local atual:

- conclusão de aula publicada por Server Action autenticada;
- persistência em `lesson_progress` sem duplicidade;
- RLS de leitura e inserção restritas ao próprio usuário;
- quantidade, percentual e barra de progresso no curso;
- estados `Concluída` e `Pendente` na lista de aulas;
- ausência de `UPDATE`, `DELETE`, progresso administrativo ou gamificação.

Validações reais registradas:

- `npm.cmd run lint` aprovado;
- `npm.cmd run build` aprovado;
- `git diff --check` aprovado, com avisos de conversão LF/CRLF;
- migration aplicada e teste SQL aprovado no Supabase;
- `USER` concluiu duas aulas, passando de `0%` para `50%` e `100%`;
- progresso permaneceu salvo após logout e novo login;
- conta `ADMIN` iniciou com `0%`, confirmando isolamento entre usuários;
- Server Actions de conclusão executadas sem erro nos logs.

### ETAPA 8 — integrada na `main`

Implementação local atual:

- painel central em `/admin` com totais de cursos, módulos, aulas e fontes;
- visão consolidada da estrutura de cada curso;
- acesso direto ao gerenciamento hierárquico já existente;
- proteção de todo o segmento `/admin` por layout com `requireAdmin()`;
- proteção mantida também nas consultas, Server Actions e policies RLS;
- atualização do painel após mutações administrativas;
- teste SQL cumulativo de autorização administrativa;
- ausência de migration nova e de exclusão física.

Validações locais registradas:

- `npm.cmd run lint` aprovado;
- `npm.cmd run build` aprovado, incluindo a rota dinâmica `/admin`;
- `git diff --check` aprovado, com avisos de conversão LF/CRLF;
- acesso a `/admin` sem sessão retornou redirecionamento HTTP 307 para `/login`;
- teste SQL remoto aprovado no Supabase, conforme confirmação do usuário;
- painel aprovado como `ADMIN`, exibindo 2 cursos, 1 publicado, 2 módulos,
  2 de 2 aulas publicadas e 2 fontes;
- navegação administrativa e bloqueio das rotas para `USER` aprovados.

### CHECKPOINT 1 — integrado na `main`

Validações locais registradas:

- roteiro integrado criado em `docs/checkpoint-1.md`;
- `npm.cmd run lint` aprovado;
- `npm.cmd run build` aprovado para todas as rotas das etapas 1 a 8;
- `/`, `/login` e `/cadastro` responderam HTTP 200;
- `/admin` sem sessão respondeu HTTP 307 para `/login`;
- `/cursos` sem sessão não exibiu dados e enviou `NEXT_REDIRECT` para `/login`
  pelo fluxo de streaming do Next.js;
- fluxo administrativo completo aprovado pelo desenvolvedor principal;
- painel confirmou 2 cursos, 1 publicado, 2 módulos, 2 de 2 aulas publicadas e
  2 fontes;
- fluxo `USER` confirmou catálogo, conteúdo Markdown, fonte e ordem das aulas;
- progresso parcial e conclusão em `100%` foram confirmados;
- progresso em `100%` permaneceu salvo após logout e novo login;
- acesso direto de `USER` a `/admin` e `/admin/cursos` foi bloqueado;
- outra conta iniciou o curso em `0%`, confirmando o isolamento do progresso.

### ETAPA 9 — concluída na branch `feature/knowledge-base`

Implementação local atual:

- view `knowledge_documents` derivada somente de aulas e cursos publicados;
- fontes estruturadas agregadas e ordenadas em cada documento;
- `security_invoker`, `security_barrier` e acesso somente de leitura;
- preparação server-only de trechos Markdown de até 1.200 caracteres;
- rota administrativa `/admin/base-conhecimento` com cobertura, documentos,
  trechos e fontes;
- teste SQL estrutural e de privilégios;
- ausência de embeddings, OpenAI, busca por pergunta e chatbot.

Validações locais registradas:

- `npm.cmd run lint` aprovado;
- `npm.cmd run build` aprovado, incluindo `/admin/base-conhecimento`;
- particionamento validado com blocos longos, sem trechos vazios ou acima do
  limite configurado;
- migration aplicada no Supabase compartilhado;
- `supabase/tests/knowledge_base_validation.sql` aprovado sem exceção;
- painel confirmou 1 curso coberto, 2 aulas disponíveis, 2 trechos preparados e
  2 fontes associadas;
- somente o curso e as aulas publicados apareceram na base;
- vínculo para abrir a aula respondeu corretamente;
- acesso como `USER` recebeu HTTP 307 e redirecionou para
  `/area-autenticada`.

## Próxima ação

Revisar, versionar e integrar a ETAPA 9 na `main`. A ETAPA 10 não deve ser
iniciada antes da integração e de autorização explícita do desenvolvedor
principal.

## Pontos que não foram verificados externamente nesta análise

O agente não consulta diretamente o painel do Supabase. O estado remoto das
ETAPAS 4, 5, 6 e 7 foi confirmado pelas execuções e imagens fornecidas pelo usuário.

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
