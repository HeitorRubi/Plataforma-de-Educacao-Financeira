# Workboard Compartilhado — Desenvolvedor principal + segundo desenvolvedor

Este arquivo é o quadro operacional compartilhado dos dois desenvolvedores e dos dois Codex.

**Regra:** o que não estiver registrado aqui não deve ser presumido pelo agente.

## 1. Baseline observado

```text
branch integrada: main
base funcional local utilizada: 195bebf
última etapa integrada informada: ETAPA 7 — PROGRESSO
etapa oficial atual: ETAPA 8 — PAINEL ADMINISTRATIVO
branch de trabalho atual: feature/admin
```

Antes de confiar nesse baseline, cada Codex deve comparar com o Git real.

Em 04/09/2026, o desenvolvedor principal confirmou a integração da ETAPA 7.
O `git fetch origin` não pôde autenticar no terminal automatizado; por isso,
`feature/admin` foi criada diretamente do commit local validado `195bebf`, que
contém a implementação completa e validada da ETAPA 7.

## 2. Estratégia da ETAPA 8

A ETAPA 8 será implementada integralmente pelo desenvolvedor principal. O
segundo desenvolvedor não possui uma trilha paralela administrativa e atuará
somente em melhorias pequenas de etapas já implementadas, registradas
separadamente neste quadro.

```text
DESENVOLVEDOR PRINCIPAL
          ↓
PAINEL ADMINISTRATIVO
          ↓
CURSOS E PUBLICAÇÃO
          ↓
MÓDULOS E ORDEM
          ↓
AULAS, FONTES E ORDEM
          ↓
VALIDAÇÃO DE BLOQUEIO PARA USER
```

Esta tarefa não autoriza iniciar funcionalidades de IA ou o CHECKPOINT 1.

---

# DESENVOLVEDOR PRINCIPAL

## Tarefa P-8 — Painel administrativo

**Responsável:** Desenvolvedor principal
**Status:** PRONTO PARA REVISÃO
**Branch:** `feature/admin`

### Objetivo

Implementar a ETAPA 8 completa:

- consolidar cursos, módulos, aulas e fontes em uma entrada administrativa;
- apresentar totais e a estrutura de conteúdo por curso;
- manter acesso às operações de edição, publicação e ordenação;
- proteger todo o segmento administrativo no servidor;
- garantir no RLS que `USER` não execute operações administrativas;
- manter a ausência de exclusão física no MVP.

### Áreas reservadas ao desenvolvedor principal

```text
src/app/admin/**
src/components/admin/**
src/components/courses/admin/admin-courses-nav.tsx
src/components/auth/authenticated-header.tsx
src/app/area-autenticada/page.tsx
src/lib/admin/**
supabase/tests/*admin*.sql
docs/administration.md
docs/database.md
docs/DECISIONS.md
```

### Regras

- não usar `service_role`;
- manter `requireAdmin()` nas Server Actions e consultas;
- não implementar gestão de usuários ou relatórios de progresso;
- não criar migration sem alteração real de banco;
- não iniciar as etapas de IA.

---

## Tarefa P-7 — Progresso de aulas

**Responsável:** Desenvolvedor principal
**Status:** INTEGRADO
**Branch:** `feature/progress`

### Objetivo

Implementar a ETAPA 7 completa:

- permitir que o usuário conclua uma aula publicada;
- persistir a conclusão em `lesson_progress`;
- impedir leitura ou escrita do progresso de outro usuário;
- exibir aulas concluídas e pendentes no curso;
- calcular quantidade concluída, total publicado e percentual;
- manter o progresso após logout e novo login.

### Áreas reservadas ao desenvolvedor principal

```text
src/app/cursos/[id]/page.tsx
src/app/cursos/[id]/modulos/[moduleId]/aulas/[lessonId]/**
src/components/progress/**
src/components/modules/course-module-outline.tsx
src/lib/progress/**
supabase/migrations/*progress*.sql
supabase/tests/*progress*.sql
docs/progress.md
docs/database.md
docs/DECISIONS.md
```

### Regras

- identidade deve ser derivada da sessão, nunca recebida do formulário;
- usuário consulta e insere somente o próprio progresso;
- conclusão é idempotente e não possui exclusão nesta etapa;
- o percentual considera somente aulas publicadas do curso publicado;
- não implementar relatórios administrativos ou gamificação;
- alterações de banco devem usar uma migration nova.

---

## Tarefa P-6 — Aulas completas

**Responsável:** Desenvolvedor principal
**Status:** INTEGRADO
**Branch:** `feature/lessons`

### Objetivo

Implementar a ETAPA 6 completa:

- criar, listar e editar aulas textuais vinculadas a módulos;
- publicar e despublicar aulas;
- ordenar aulas dentro do módulo;
- armazenar e renderizar conteúdo em Markdown;
- criar, editar, listar e ordenar fontes de cada aula;
- exibir somente aulas publicadas de cursos publicados;
- navegar para a aula anterior e a próxima na ordem do curso;
- manter autorização administrativa no servidor e no RLS.

### Áreas reservadas ao desenvolvedor principal

```text
src/app/admin/cursos/[id]/modulos/[moduleId]/aulas/**
src/app/cursos/[id]/modulos/[moduleId]/aulas/**
src/components/lessons/**
src/lib/lessons/**
src/components/modules/admin/admin-module-list.tsx
src/components/modules/course-module-outline.tsx
supabase/migrations/*lesson*.sql
supabase/tests/*lesson*.sql
docs/lessons.md
package.json
package-lock.json
```

### Regras

- não iniciar progresso;
- não implementar vídeos;
- não inserir conteúdo financeiro definitivo ou referências inventadas;
- não oferecer exclusão física de aulas nesta etapa;
- validar a relação curso → módulo → aula em consultas e mutações;
- alterações de banco devem usar uma migration nova.

---

## Tarefa P-5 — Módulos completos

**Responsável:** Desenvolvedor principal
**Status:** INTEGRADO
**Branch:** `feature/modules`

### Objetivo

Implementar a ETAPA 5 completa:

- criar módulos vinculados a um curso;
- listar módulos na ordem definida;
- consultar e editar módulos;
- mover módulos para cima ou para baixo;
- garantir que somente `ADMIN` execute operações administrativas;
- exibir os módulos dos cursos publicados para usuários autenticados;
- tratar estados vazios e erros quando aplicável.

### Áreas reservadas ao desenvolvedor principal

```text
src/app/admin/cursos/[id]/modulos/**
src/components/modules/**
src/lib/modules/**
src/app/admin/cursos/[id]/page.tsx
src/app/cursos/[id]/page.tsx
supabase/migrations/*module*.sql
supabase/tests/*module*.sql
docs/modules.md
```

### Regras

- não iniciar aulas;
- não permitir exclusão física de módulos pela aplicação nesta etapa;
- manter a ordem positiva e única dentro de cada curso;
- validar autorização nas Server Actions e no RLS;
- alterações de banco devem usar uma migration nova.

---

## Tarefa P-4 — Cursos completos

**Responsável:** Desenvolvedor principal
**Status:** INTEGRADO
**Branch:** `feature/courses`

### Objetivo

Implementar a ETAPA 4 completa:

- criar curso;
- listar cursos para administração;
- consultar curso;
- editar curso;
- publicar/despublicar curso;
- garantir que somente `ADMIN` execute operações administrativas;
- listar cursos publicados para o usuário;
- impedir que cursos não publicados apareçam ao usuário comum;
- permitir consultar os dados de um curso publicado;
- tratar estados vazio, carregamento e erro quando aplicável.

### Áreas reservadas ao desenvolvedor principal

Durante a ETAPA 4, o desenvolvedor principal pode propor/usar:

```text
src/app/admin/cursos/**
src/app/cursos/**
src/components/courses/admin/**
src/components/courses/public/**
src/lib/courses/**
supabase/migrations/*course*.sql
supabase/tests/*course*.sql
```

Os nomes exatos podem variar após inspeção, mas o escopo deve permanecer restrito
a cursos.

### Regras

- não iniciar módulos;
- não alterar autenticação existente sem necessidade comprovada;
- alterações de autorização/RLS devem ser mínimas e testadas;
- alterações de banco devem usar uma migration nova;
- políticas devem respeitar o contrato compartilhado abaixo.

---

# SEGUNDO DESENVOLVEDOR

## Melhorias em etapas anteriores

**Responsável:** Segundo desenvolvedor
**Status:** NENHUMA TAREFA ATIVA REGISTRADA

### Objetivo

Executar apenas melhorias pequenas em funcionalidades já implementadas. Cada
melhoria deve possuir tarefa, branch, arquivos previstos e status registrados
neste documento antes da alteração.

### Não tocar durante a ETAPA 8 sem reatribuição explícita

```text
src/app/admin/**
src/components/admin/**
src/components/courses/admin/admin-courses-nav.tsx
src/lib/admin/**
supabase/tests/*admin*.sql
docs/administration.md
```

Se uma melhoria precisar alterar arquivo compartilhado ou código administrativo, o
segundo desenvolvedor deve registrar a necessidade e aguardar coordenação.

---

# 3. Contrato compartilhado C-COURSE-001

Este contrato existe para reduzir acoplamento entre as duas branches.

A tabela `public.courses` já foi observada com:

```text
id             uuid
title          text
description    text | null
is_published   boolean
created_at     timestamptz
updated_at     timestamptz
```

## Regras funcionais

### Usuário comum

Pode visualizar somente:

```text
is_published = true
```

Não pode criar, editar, publicar ou despublicar cursos.

### ADMIN

Pode executar as operações administrativas autorizadas da ETAPA 4.

### Representação mínima de leitura

Quando uma camada TypeScript precisar de uma representação mínima, manter semanticamente:

```ts
type Course = {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};
```

Isso é um contrato de integração, não uma ordem para criar esse tipo em um arquivo específico.

## Responsabilidade por mudanças do contrato

Se um dos desenvolvedores precisar alterar esse contrato:

1. parar a parte dependente;
2. registrar a proposta neste arquivo;
3. comunicar o outro desenvolvedor;
4. integrar a decisão em `main`;
5. só então os dois lados passam a depender da nova forma.

---

# 3.1. Contrato compartilhado C-MODULE-001

A tabela `public.modules` já existe e deve manter semanticamente:

```text
id             uuid
course_id      uuid
title          text
description    text | null
position       integer positivo e único no curso
created_at     timestamptz
updated_at     timestamptz
```

Regras de acesso da ETAPA 5:

- `ADMIN` pode criar, consultar, editar e ordenar módulos;
- usuário autenticado pode consultar módulos de cursos publicados;
- `anon` não possui acesso;
- a aplicação não oferece exclusão física;
- aulas não fazem parte desta tarefa.

Representação mínima de leitura:

```ts
type CourseModule = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};
```

---

# 3.2. Contratos compartilhados C-LESSON-001 e C-SOURCE-001

A tabela `public.lessons` mantém semanticamente:

```text
id             uuid
module_id      uuid
title          text
content        text em Markdown
position       integer positivo e único no módulo
is_published   boolean
created_at     timestamptz
updated_at     timestamptz
```

A tabela `public.lesson_sources` mantém semanticamente:

```text
id                 uuid
lesson_id          uuid
title              text
author             text | null
url                text | null
publication_year   integer | null
position           integer positivo e único na aula
created_at         timestamptz
updated_at         timestamptz
```

Regras de acesso da ETAPA 6:

- `ADMIN` administra aulas, publicação, ordem e fontes;
- usuário autenticado lê somente aulas publicadas de cursos publicados;
- fontes herdam a visibilidade da aula;
- `anon` não possui acesso;
- a aplicação não oferece exclusão física;
- a navegação pública considera somente aulas publicadas e segue a ordem de
  módulos e aulas do curso.

---

# 3.3. Contrato compartilhado C-PROGRESS-001

A tabela `public.lesson_progress` mantém semanticamente:

```text
user_id       uuid, PK composta e FK para profiles.id
lesson_id     uuid, PK composta e FK para lessons.id
completed_at  timestamptz preenchido pelo banco
```

Regras de acesso da ETAPA 7:

- cada usuário autenticado consulta somente as próprias conclusões;
- cada usuário insere somente o próprio `user_id`;
- somente aulas publicadas de cursos publicados podem ser concluídas;
- a mesma aula é concluída no máximo uma vez por usuário;
- `anon` não possui acesso;
- não há `UPDATE` nem `DELETE` nesta etapa;
- o percentual usa aulas publicadas como total e conclusões do usuário como parte.

---

# 4. Arquivos compartilhados de alto risco

Os seguintes arquivos não têm dono exclusivo e exigem coordenação:

```text
src/lib/auth/**
src/lib/supabase/**
src/proxy.ts
src/app/layout.tsx
src/app/globals.css
package.json
package-lock.json
.env.example
README.md
AGENTS.md
docs/STATUS.md
docs/WORKBOARD.md
docs/DECISIONS.md
```

Regra:

- evite editar esses arquivos durante a tarefa funcional;
- se realmente necessário, informe antes;
- faça alteração pequena;
- registre no handoff;
- espere maior chance de conflito ao sincronizar.

`STATUS.md` e `WORKBOARD.md` são exceções operacionais: podem ser atualizados no encerramento, mas o merge deve preservar as informações das duas trilhas.

---

# 5. Ordem de trabalho

## Passo 0 — antes de cada tarefa

Cada um:

```bash
git fetch origin
git switch main
git pull origin main
git status --short --branch
git log --oneline --decorate -10
```

Confirmar que o projeto está sincronizado.

## Passo 1 — criar a branch da tarefa

ETAPA 8:

```bash
git switch -c feature/admin
```

A criação/troca de branch deve ser feita pelo humano ou com autorização explícita ao agente.

Melhorias do segundo desenvolvedor devem usar branches próprias, com nomes
compatíveis com a tarefa registrada.

## Passo 2 — autorizar a tarefa

```text
INICIAR ETAPA 8
```

## Passo 3 — trabalhar sem cruzar responsabilidades

Cada Codex deve permanecer na tarefa e nos arquivos registrados.

## Passo 4 — integração

A ETAPA 8 deve ser revisada e integrada por Pull Request/merge consciente. Uma
melhoria paralela só deve ser integrada depois de verificar conflitos e repetir
os testes afetados.

## Passo 5 — teste integrado da ETAPA 8

A ETAPA 8 só pode ser marcada como concluída quando:

```text
ADMIN abre o painel → gerencia conteúdo → painel reflete a alteração
```

e também for validado que:

```text
USER tenta abrir /admin → servidor redireciona → RLS bloqueia escrita
```

Somente depois o CHECKPOINT 1 pode ser considerado elegível.

---

# 6. Tarefas ativas

```text
P-4: INTEGRADO — main 94e7a2f
P-5: INTEGRADO — main 65712a2
P-6: INTEGRADO — commit funcional 1eb21ae; merge confirmado pelo usuário
P-7: INTEGRADO — commit funcional 195bebf; merge confirmado pelo usuário
P-8: PRONTO PARA REVISÃO — feature/admin
Segundo desenvolvedor: NENHUMA TAREFA ATIVA REGISTRADA
```

Ao iniciar uma nova tarefa, o responsável deve registrar o status:

```text
EM ANDAMENTO
```

Ao terminar:

```text
PRONTO PARA REVISÃO
```

Depois do merge:

```text
INTEGRADO
```

---

# 7. Handoff obrigatório

Cada tarefa deve registrar no encerramento:

```text
HANDOFF

Responsável:
Tarefa:
Branch:
Commit/PR:
Status:

Arquivos principais alterados:
-

Banco/migrations:
-

Testes executados:
-

Resultados reais:
-

Pendências:
-

Dependências para integração:
-

Arquivos compartilhados tocados:
-

Observações para o outro desenvolvedor:
-
```

Nunca substituir o handoff do outro desenvolvedor; manter os dois registros quando existirem.

## Handoff P-4 — ETAPA 4

```text
HANDOFF

Responsável: Desenvolvedor principal
Tarefa: P-4 — Cursos completos
Branch: feature/courses
Commit/PR: 483fc77 / integrado na main em 94e7a2f
Status: INTEGRADO

Arquivos principais alterados:
- src/app/admin/cursos/**
- src/app/cursos/**
- src/components/courses/**
- src/lib/courses/**
- src/app/area-autenticada/page.tsx
- src/components/auth/authenticated-header.tsx
- docs/courses.md
- docs/database.md
- docs/DECISIONS.md
- docs/STATUS.md
- docs/WORKBOARD.md

Banco/migrations:
- supabase/migrations/20260829000000_configure_course_access.sql
- migration aplicada no Supabase compartilhado
- supabase/tests/course_access_validation.sql aprovado

Testes executados:
- git diff --check
- npm.cmd run lint
- npm.cmd run build
- proteção de rotas sem sessão
- CRUD administrativo sem exclusão física
- publicação e despublicação
- catálogo e consulta como USER
- bloqueio administrativo e ocultação de rascunho para USER

Resultados reais:
- lint sem erros ou avisos
- build aprovado com todas as rotas de cursos
- ADMIN criou, consultou, editou, publicou e despublicou
- USER visualizou somente Curso Publicado de Teste
- Curso Rascunho de Teste não apareceu para USER
- rota administrativa redirecionou USER

Pendências:
- nenhuma pendência funcional da ETAPA 4

Dependências para integração:
- integração concluída na main em 94e7a2f

Arquivos compartilhados tocados:
- src/components/auth/authenticated-header.tsx
- src/app/area-autenticada/page.tsx
- docs/database.md
- docs/DECISIONS.md
- docs/STATUS.md
- docs/WORKBOARD.md

Observações para o outro desenvolvedor:
- não alterar arquivos de cursos enquanto P-4 não estiver integrada
- não criar migration concorrente para public.courses
- nenhuma funcionalidade de módulos foi iniciada
```

## Handoff P-5 — ETAPA 5

```text
HANDOFF

Responsável: Desenvolvedor principal
Tarefa: P-5 — Módulos completos
Branch: feature/modules
Commit/PR: 2c2681a / integrado na main em 65712a2
Status: INTEGRADO

Arquivos principais alterados:
- src/app/admin/cursos/[id]/modulos/**
- src/app/admin/cursos/[id]/page.tsx
- src/app/cursos/[id]/page.tsx
- src/components/modules/**
- src/lib/modules/**
- docs/modules.md
- docs/database.md
- docs/DECISIONS.md
- docs/ROADMAP.md
- docs/STATUS.md
- docs/WORKBOARD.md

Banco/migrations:
- supabase/migrations/20260902000000_configure_module_access.sql
- migration aplicada no Supabase compartilhado, conforme confirmação do usuário
- supabase/tests/module_access_validation.sql informado como aprovado

Testes executados:
- git diff --check
- npm.cmd run lint
- npm.cmd run build
- inicialização do servidor Next.js
- proteção de rotas sem sessão
- criação e edição de módulos como ADMIN
- ordenação de módulos como ADMIN
- visualização ordenada no curso publicado como USER

Resultados reais:
- lint sem erros ou avisos
- build aprovado com as novas rotas de módulos
- servidor iniciado em http://localhost:3000
- createModuleAction, updateModuleAction e moveModuleAction executadas sem erro
- ADMIN criou dois módulos de teste, editou e alterou sua ordem
- USER visualizou os dois módulos na mesma ordem no curso publicado
- interface USER não exibiu controles administrativos

Pendências:
- nenhuma pendência funcional da ETAPA 5

Dependências para integração:
- integração concluída na main em 65712a2

Arquivos compartilhados tocados:
- src/app/admin/cursos/[id]/page.tsx
- src/app/cursos/[id]/page.tsx
- docs/database.md
- docs/DECISIONS.md
- docs/ROADMAP.md
- docs/STATUS.md
- docs/WORKBOARD.md

Observações para o outro desenvolvedor:
- ETAPA 5 integrada e disponível como base para aulas
- não criar migration concorrente para public.modules
- nenhuma funcionalidade de aulas foi iniciada
```

## Handoff P-6 — ETAPA 6

```text
HANDOFF

Responsável: Desenvolvedor principal
Tarefa: P-6 — Aulas completas
Branch: feature/lessons
Commit/PR: 1eb21ae / integração na main confirmada pelo usuário
Status: INTEGRADO

Arquivos principais alterados:
- src/app/admin/cursos/[id]/modulos/[moduleId]/**
- src/app/cursos/[id]/page.tsx
- src/app/cursos/[id]/modulos/[moduleId]/aulas/**
- src/components/lessons/**
- src/components/modules/admin/admin-module-list.tsx
- src/components/modules/course-module-outline.tsx
- src/lib/lessons/**
- docs/lessons.md
- docs/modules.md
- docs/database.md
- docs/DECISIONS.md
- docs/ROADMAP.md
- docs/STATUS.md
- docs/WORKBOARD.md
- package.json
- package-lock.json

Banco/migrations:
- supabase/migrations/20260903000000_configure_lesson_access.sql
- migration aplicada no Supabase compartilhado, conforme confirmação do usuário
- supabase/tests/lesson_access_validation.sql informado como aprovado

Testes executados:
- git diff --check
- npm.cmd run lint
- npm.cmd run build
- proteção de rotas sem sessão
- criação e publicação de duas aulas como ADMIN
- criação e ordenação de duas fontes como ADMIN
- leitura de Markdown e fontes como USER
- ocultação de aula não publicada para USER
- navegação anterior/próxima entre duas aulas publicadas

Resultados reais:
- lint sem erros ou avisos
- build aprovado com as rotas de aulas e fontes
- servidor iniciado em http://localhost:3000
- Server Actions observadas sem erro nos logs do servidor
- USER visualizou somente aulas publicadas do curso publicado
- conteúdo Markdown e fontes foram renderizados
- navegação Aula 1 → Aula 2 e Aula 2 → Aula 1 aprovada pelo usuário

Pendências:
- nenhuma pendência funcional da ETAPA 6

Dependências para integração:
- integração confirmada pelo usuário em 04/09/2026

Arquivos compartilhados tocados:
- src/app/cursos/[id]/page.tsx
- src/components/modules/admin/admin-module-list.tsx
- src/components/modules/course-module-outline.tsx
- package.json
- package-lock.json
- docs/database.md
- docs/modules.md
- docs/DECISIONS.md
- docs/ROADMAP.md
- docs/STATUS.md
- docs/WORKBOARD.md

Observações para o outro desenvolvedor:
- não alterar arquivos reservados de aulas antes da integração
- não criar migration concorrente para public.lessons ou public.lesson_sources
- lesson_progress permaneceu fora do escopo e sem novos privilégios
```

## Handoff P-7 — ETAPA 7

```text
HANDOFF

Responsável: Desenvolvedor principal
Tarefa: P-7 — Progresso de aulas
Branch: feature/progress
Commit/PR: 195bebf / integração na main confirmada pelo usuário
Status: INTEGRADO

Arquivos principais alterados:
- src/app/cursos/[id]/page.tsx
- src/app/cursos/[id]/modulos/[moduleId]/aulas/[lessonId]/actions.ts
- src/app/cursos/[id]/modulos/[moduleId]/aulas/[lessonId]/page.tsx
- src/components/modules/course-module-outline.tsx
- src/components/progress/**
- src/lib/progress/**
- src/app/auth/actions.ts
- docs/progress.md
- docs/authentication.md
- docs/database.md
- docs/DECISIONS.md
- docs/ROADMAP.md
- docs/STATUS.md
- docs/WORKBOARD.md

Banco/migrations:
- supabase/migrations/20260904000000_configure_lesson_progress.sql
- migration aplicada no Supabase compartilhado, conforme confirmação do usuário
- supabase/tests/lesson_progress_validation.sql aprovado

Testes executados:
- git diff --check
- npm.cmd run lint
- npm.cmd run build
- inicialização do servidor Next.js com acesso ao Supabase
- conclusão de duas aulas como USER
- cálculo de 1/2 = 50% e 2/2 = 100%
- logout e novo login com manutenção do progresso
- login com outra conta e verificação de isolamento

Resultados reais:
- teste SQL concluído sem exceção
- completeLessonAction executada sem erro para as duas aulas
- progresso persistiu após logout e novo login
- conta USER manteve 100% e conta ADMIN iniciou com 0%
- aulas concluídas e pendentes foram identificadas na lista do curso
- falha de rede do Auth passou a ser diferenciada de credenciais inválidas

Pendências:
- nenhuma pendência funcional da ETAPA 7

Dependências para integração:
- integração confirmada pelo usuário em 04/09/2026

Arquivos compartilhados tocados:
- src/app/cursos/[id]/page.tsx
- src/components/modules/course-module-outline.tsx
- src/app/auth/actions.ts
- docs/authentication.md
- docs/database.md
- docs/DECISIONS.md
- docs/ROADMAP.md
- docs/STATUS.md
- docs/WORKBOARD.md

Observações para o outro desenvolvedor:
- não alterar lesson_progress antes da integração desta branch
- não criar migration concorrente para public.lesson_progress
- relatórios administrativos e progresso agregado ficaram fora do escopo
```

## Handoff P-8 — ETAPA 8

```text
HANDOFF

Responsável: Desenvolvedor principal
Tarefa: P-8 — Painel administrativo
Branch: feature/admin
Commit/PR: ainda não criado
Status: PRONTO PARA REVISÃO

Arquivos principais alterados:
- src/app/admin/layout.tsx
- src/app/admin/page.tsx
- src/app/admin/**/actions.ts
- src/components/auth/authenticated-header.tsx
- src/components/courses/admin/admin-courses-nav.tsx
- src/app/area-autenticada/page.tsx
- src/lib/admin/**
- supabase/tests/admin_access_validation.sql
- docs/administration.md
- docs/database.md
- docs/DECISIONS.md
- docs/ROADMAP.md
- docs/STATUS.md
- docs/WORKBOARD.md

Banco/migrations:
- nenhuma migration nova; grants, policies RLS e funções existentes foram preservados
- supabase/tests/admin_access_validation.sql aprovado no Supabase

Testes executados:
- git diff --check
- npm.cmd run lint
- npm.cmd run build
- requisição HTTP para /admin sem sessão
- execução de supabase/tests/admin_access_validation.sql
- painel e navegação com conta ADMIN
- bloqueio das rotas administrativas com conta USER

Resultados reais:
- lint sem erros ou avisos
- build aprovado com a nova rota dinâmica /admin
- diff check aprovado com avisos LF/CRLF
- /admin sem sessão respondeu HTTP 307 com redirecionamento para /login
- painel exibiu os totais esperados e permitiu acessar o gerenciamento do curso
- teste SQL foi concluído sem exceção
- USER não acessou nem executou operações administrativas

Pendências:
- nenhuma pendência funcional da ETAPA 8

Dependências para integração:
- criar commit e integrar feature/admin na main

Arquivos compartilhados tocados:
- src/components/auth/authenticated-header.tsx
- src/app/area-autenticada/page.tsx
- docs/database.md
- docs/DECISIONS.md
- docs/ROADMAP.md
- docs/STATUS.md
- docs/WORKBOARD.md

Observações para o outro desenvolvedor:
- não alterar o segmento /admin antes da integração
- nenhuma migration foi criada na ETAPA 8
- relatórios de progresso e gestão de usuários permanecem fora do escopo
```
