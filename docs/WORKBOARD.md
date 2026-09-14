# Workboard Compartilhado — Desenvolvedor principal + segundo desenvolvedor

Este arquivo é o quadro operacional compartilhado dos dois desenvolvedores e dos dois Codex.

**Regra:** o que não estiver registrado aqui não deve ser presumido pelo agente.

## 1. Baseline observado

```text
branch integrada: main
base funcional integrada observada: f2240e4
última etapa integrada: ETAPA 13 — REVISÃO DE SEGURANÇA E RLS
tarefa oficial atual: ETAPA 14 — TESTES FINAIS
branch de trabalho atual: test/stage-14
```

Antes de confiar nesse baseline, cada Codex deve comparar com o Git real.

Em 14/09/2026, o Git confirmou a ETAPA 13 integrada em `origin/main` no commit
`f2240e4`. A branch `test/stage-14` foi criada dessa base com autorização
explícita do desenvolvedor principal.

## 2. Estratégia da ETAPA 14

A ETAPA 14 será executada pelo desenvolvedor principal para validar a plataforma
e o chatbot integrados. O segundo desenvolvedor não possui tarefa ativa nesta
área.

```text
VALIDAÇÕES DETERMINÍSTICAS
        ↓
SMOKE HTTP + TESTE SQL
        ↓
FLUXOS REAIS DE ADMIN E USER
        ↓
CHATBOT + HISTÓRICO + ISOLAMENTO
```

Esta tarefa não autoriza funcionalidades novas, mudanças de schema, deploy
formal, armazenamento de credenciais ou mudança de provedor.

---

# DESENVOLVEDOR PRINCIPAL

## Tarefa P-14 — Testes finais

**Responsável:** Desenvolvedor principal
**Status:** PRONTO PARA REVISÃO
**Branch:** `test/stage-14`

### Objetivo

Comprovar o funcionamento integrado do MVP e do chatbot depois da revisão de
segurança, com resultados automatizados, SQL e manuais reproduzíveis.

### Áreas reservadas ao desenvolvedor principal

```text
scripts/validate-platform.mjs
scripts/validate-http.mjs
supabase/tests/final_checkpoint_validation.sql
docs/checkpoint-2.md
package.json
docs/DECISIONS.md
docs/ROADMAP.md
docs/STATUS.md
docs/WORKBOARD.md
```

### Regras

- não adicionar funcionalidades nem migration;
- não registrar credenciais ou dados privados;
- distinguir teste automatizado, SQL e manual;
- não marcar como aprovado o que ainda não foi executado;
- testar bloqueio sem sessão e isolamento entre contas;
- testar resposta fundamentada, contexto insuficiente e solicitação limitada.

### Dependências

- ETAPA 13 integrada na `main` em `f2240e4`;
- migrations até `20260911000000_harden_security_boundaries.sql` aplicadas;
- ambiente local e deployment com Supabase e Groq configurados.

### Implementação local atual

- validações determinísticas de autenticação, conteúdo e chunking;
- smoke HTTP para ambiente local ou URL publicada;
- teste SQL cumulativo do schema, RLS, policies, view e RPCs;
- roteiro manual do CHECKPOINT 2.

### Validações executadas

- `npm.cmd run test:platform` aprovado;
- `npm.cmd run test:rag` aprovado;
- `npm.cmd run lint` aprovado;
- `npm.cmd run build` aprovado;
- `git diff --check` aprovado, somente com avisos LF/CRLF;
- smoke HTTP aprovado no build local de produção;
- smoke HTTP aprovado em `https://pla-financeiro.vercel.app`;
- `npm.cmd audit --json` sem vulnerabilidades nas 528 dependências.
- `supabase/tests/final_checkpoint_validation.sql` aprovado no Supabase com
  `Success. No rows returned`.
- fluxos administrativos, publicação e ordenação aprovados;
- fluxo `USER`, progresso persistente e bloqueio administrativo aprovados;
- chatbot fundamentado, estados de recusa e histórico aprovados;
- isolamento de progresso e conversas entre duas contas aprovado;
- CHECKPOINT 2 aprovado pelo desenvolvedor principal em 14/09/2026.

### Pendente

- versionar e integrar a ETAPA 14 na `main`.

---

## Tarefa P-13 — Revisão de segurança e RLS

**Responsável:** Desenvolvedor principal
**Status:** INTEGRADO
**Branch:** `security/review`

### Objetivo

Revisar autenticação, autorização, RLS, dados privados, segredos e validações,
corrigindo lacunas sem alterar os fluxos funcionais aprovados.

### Áreas reservadas ao desenvolvedor principal

```text
src/app/auth/actions.ts
src/components/auth/**
src/lib/auth/**
next.config.ts
.env.example
supabase/migrations/*harden_security*.sql
supabase/tests/security_review_validation.sql
docs/security-review.md
docs/authentication.md
docs/database.md
docs/DECISIONS.md
docs/ROADMAP.md
docs/STATUS.md
docs/WORKBOARD.md
```

### Regras

- manter `service_role` fora da aplicação e do Git;
- preservar `SECURITY INVOKER` nos RPCs da aplicação;
- não reescrever migrations já aplicadas;
- manter acesso privado por `auth.uid()` e administração por role persistida;
- aplicar privilégio mínimo a tabelas, schema e funções;
- validar entradas no servidor e no banco, não apenas na interface;
- registrar controles externos e riscos residuais sem inventar aprovação.

### Dependências

- ETAPA 12 integrada na `main` em `fcba907`;
- migration mais recente anterior:
  `20260910000000_create_chat_history.sql`.

### Implementação local atual

- limites de nome e e-mail centralizados;
- cabeçalhos HTTP defensivos e remoção de `X-Powered-By`;
- nova migration de constraints e grants de função explícitos;
- teste SQL cumulativo de RLS, policies, constraints e privilégios;
- documentação dos controles e dos riscos que dependem de configuração externa.

### Validações locais executadas

- `git diff --check` aprovado, somente com avisos LF/CRLF;
- `npm.cmd run test:rag` aprovado;
- `npm.cmd run lint` aprovado;
- `npm.cmd run build` aprovado;
- `npm.cmd audit --json` sem vulnerabilidades nas 528 dependências;
- cabeçalhos HTTP observados em `/login` e nas rotas protegidas;
- `/chat` sem sessão redirecionou para `/login`;
- APIs do chat sem sessão responderam HTTP 401 sem cache.
- migration aplicada no Supabase compartilhado;
- `supabase/tests/security_review_validation.sql` aprovado com `Success. No
  rows returned` no SQL Editor.
- cadastro, login, perfil, chat e operações administrativas aprovados após a
  migration;
- bloqueio sem sessão e isolamento entre contas confirmados pelo desenvolvedor
  principal.

### Pendente

- nenhuma pendência funcional da ETAPA 13.

---

## Tarefa P-12 — Histórico do chat

**Responsável:** Desenvolvedor principal
**Status:** INTEGRADO
**Branch:** `feature/chat-history`

### Objetivo

Persistir sessões e mensagens do assistente por usuário, permitir continuar e
reabrir conversas e manter o isolamento no PostgreSQL por RLS.

### Áreas reservadas ao desenvolvedor principal

```text
src/app/chat/**
src/app/api/chat/**
src/components/chat/**
src/lib/chat-history/**
src/lib/rag/response-validation.ts
scripts/validate-rag.mjs
supabase/migrations/*chat_history*.sql
supabase/tests/*chat_history*.sql
docs/chat-history.md
docs/chatbot-ui.md
docs/rag.md
docs/database.md
docs/DECISIONS.md
docs/ROADMAP.md
docs/STATUS.md
docs/WORKBOARD.md
```

### Regras

- exigir sessão autenticada em toda leitura e gravação;
- permitir acesso somente às conversas do próprio usuário;
- gravar pergunta e resposta de forma atômica e ordenada;
- preservar status e referências retornadas pelo RAG;
- manter a chave da Groq exclusivamente no servidor;
- não usar `service_role` na aplicação;
- não permitir atualização ou exclusão de mensagens;
- não enviar mensagens anteriores à Groq nesta etapa.

### Dependências

- ETAPA 11 integrada na `main` em `3e9136d`;
- autenticação SSR, RLS, base publicada e endpoint RAG disponíveis;
- migration mais recente anterior: `20260908000000_create_knowledge_documents_view.sql`.

### Implementação local atual

- tabelas `chat_sessions` e `chat_messages` com constraints e índices;
- policies próprias e grants mínimos para `authenticated`;
- função `append_chat_exchange` transacional com `SECURITY INVOKER`;
- consulta server-only para listar, abrir e acrescentar conversas;
- API de detalhe e extensão do `POST /api/chat` com `sessionId` opcional;
- interface responsiva com lista, nova conversa e mensagens persistidas;
- documentação e teste SQL estrutural.

### Validações locais executadas

- `npm.cmd run test:rag` aprovado;
- `npm.cmd run lint` aprovado;
- `npm.cmd run build` aprovado, incluindo `/api/chat/sessions/[id]`;
- migration aplicada e teste SQL aprovado no Supabase compartilhado;
- criação, troca e reabertura de conversas aprovadas no navegador;
- conta diferente não visualizou o histórico da primeira conta;
- endpoints autenticados responderam HTTP 200 sem erro no servidor;
- acesso sem sessão foi bloqueado na página e nas APIs.

### Pendente

- nenhuma pendência funcional da ETAPA 12.

---

## Tarefa P-11 — Interface do chatbot

**Responsável:** Desenvolvedor principal
**Status:** INTEGRADO
**Branch:** `feature/chatbot-ui`

### Objetivo

Permitir que o usuário autenticado consulte o assistente educacional e visualize
a resposta e suas referências sem expor a Groq ou persistir a conversa.

### Áreas reservadas ao desenvolvedor principal

```text
src/app/chat/**
src/components/chat/**
src/components/auth/authenticated-header.tsx
src/app/area-autenticada/page.tsx
src/app/globals.css
docs/chatbot-ui.md
docs/rag.md
docs/DECISIONS.md
docs/ROADMAP.md
docs/STATUS.md
docs/WORKBOARD.md
```

### Regras

- exigir sessão pela página e manter a autenticação do endpoint;
- enviar somente a pergunta ao backend existente;
- limitar a pergunta a 500 caracteres também na interface;
- exibir estados de carregamento, erro e resposta;
- diferenciar resposta fundamentada, contexto insuficiente e bloqueio;
- exibir somente referências recebidas do servidor;
- preservar os vínculos internos das aulas e externos das fontes;
- não expor `GROQ_API_KEY` nem importar módulos server-only no cliente;
- não persistir perguntas, respostas ou sessões nesta etapa.

### Dependências

- ETAPA 10 integrada na `main` em `3b99cac`;
- rota autenticada `POST /api/chat` disponível;
- base de conhecimento publicada e Groq configurada no servidor.

### Implementação local atual

- rota protegida `/chat` com cabeçalho autenticado;
- componente cliente isolado para formulário e resultado;
- resposta Markdown com estado semântico do RAG;
- referências agrupadas por trecho, aula e fontes;
- navegação para o assistente no cabeçalho e na área autenticada;
- estado transitório limitado à consulta atual.

### Validações locais executadas

- `npm.cmd run lint` aprovado;
- `npm.cmd run build` aprovado, incluindo `/chat`;
- login e carregamento autenticado de `/chat` aprovados;
- resposta fundamentada com duas referências aprovada;
- contexto insuficiente e solicitação limitada aprovados;
- requisições da interface responderam HTTP 200 sem erro no servidor.
- `Abrir aula` e os vínculos externos das fontes aprovados;
- atualização da página removeu a consulta anterior.

### Pendente

- nenhuma pendência funcional da ETAPA 11.

---

## Tarefa P-10 — RAG e Groq

**Responsável:** Desenvolvedor principal
**Status:** INTEGRADO
**Branch:** `feature/rag`

### Objetivo

Implementar o backend autenticado que recupera trechos publicados relevantes e
gera uma resposta educacional pela Groq, preservando as referências às aulas e
fontes da plataforma.

### Áreas reservadas ao desenvolvedor principal

```text
src/app/api/chat/**
src/lib/rag/**
.env.example
package.json
package-lock.json
docs/rag.md
docs/DECISIONS.md
docs/ROADMAP.md
docs/STATUS.md
docs/WORKBOARD.md
```

### Regras

- exigir sessão autenticada antes da recuperação e da chamada externa;
- validar e limitar a pergunta recebida;
- usar somente conteúdo publicado retornado pela base da ETAPA 9;
- executar a Groq exclusivamente em módulo `server-only`;
- nunca expor nem versionar `GROQ_API_KEY`;
- retornar referências rastreáveis sem inventar dados ausentes;
- reconhecer contexto insuficiente sem chamar o modelo;
- não oferecer recomendação individualizada de compra ou venda;
- não persistir perguntas ou respostas;
- não implementar interface de chatbot nesta etapa.

### Dependências

- ETAPA 9 integrada na `main` em `95ee7f8`;
- view `public.knowledge_documents` aplicada no Supabase compartilhado;
- sessão Supabase SSR e RLS existentes;
- `GROQ_API_KEY` nova configurada localmente e mantida fora do Git.

### Implementação local atual

- recuperação lexical determinística de até quatro trechos;
- guardrails para contexto insuficiente e aconselhamento personalizado;
- Groq Chat Completions API em módulo `server-only`;
- rota autenticada `POST /api/chat` com validação e respostas sem cache;
- referências numeradas com vínculo a aula e fontes;
- SDK oficial `groq-sdk` e configuração privada por ambiente;
- validador reproduzível em `npm.cmd run test:rag`.

### Validações locais executadas

- preflight Git confirmou `feature/rag` limpa sobre `origin/main` em `95ee7f8`.
- `npm.cmd run test:rag` aprovado;
- `npm.cmd run lint` aprovado;
- `npm.cmd run build` aprovado, incluindo `/api/chat`;
- requisição sem sessão retornou HTTP 401 em JSON e `Cache-Control: no-store`.
- OpenAI retornou HTTP 429 com saldo esgotado no teste real;
- troca para Groq autorizada explicitamente pelo desenvolvedor principal;
- SDK e configuração foram migrados sem usar a chave exposta na conversa.
- variável antiga da OpenAI removida do ambiente local;
- pergunta coberta retornou HTTP 200, `answered` e duas referências pela Groq;
- pergunta fora da base retornou `insufficient_context`;
- pedido personalizado retornou `restricted`.

### Pendente

- nenhuma pendência funcional da ETAPA 10.

---

## Tarefa P-9 — Base de conhecimento

**Responsável:** Desenvolvedor principal
**Status:** INTEGRADO
**Branch:** `feature/knowledge-base`

### Objetivo

Preparar o conteúdo publicado da plataforma para a recuperação da ETAPA 10,
mantendo vínculo rastreável com curso, módulo, aula e fontes.

### Áreas reservadas ao desenvolvedor principal

```text
src/app/admin/base-conhecimento/**
src/lib/knowledge/**
src/components/courses/admin/admin-courses-nav.tsx
supabase/migrations/*knowledge*.sql
supabase/tests/*knowledge*.sql
docs/knowledge-base.md
docs/database.md
docs/DECISIONS.md
docs/ROADMAP.md
docs/STATUS.md
docs/WORKBOARD.md
```

### Regras

- incluir somente aulas publicadas de cursos publicados;
- preservar fontes estruturadas sem completar dados ausentes por suposição;
- manter a consulta sob a sessão e o RLS existentes;
- não usar `service_role`;
- não chamar OpenAI nem gerar embeddings;
- não implementar busca por pergunta, resposta ou interface de chatbot;
- alterações de banco devem usar uma migration nova.

### Dependências

- CHECKPOINT 1 integrado na `main` em `eb1e008`;
- conteúdo editorial e fontes das ETAPAS 4 a 6;
- autenticação e proteção administrativa existentes.

### Implementação local atual

- view `knowledge_documents` baseada em conteúdo publicado;
- consulta server-only e DTOs mínimos para documentos e fontes;
- particionamento Markdown de até 1.200 caracteres;
- inspeção em `/admin/base-conhecimento`;
- migration e teste SQL próprios da etapa.

### Validações locais executadas

- `npm.cmd run lint` aprovado;
- `npm.cmd run build` aprovado;
- particionamento validado com conteúdo acima do limite;
- `git diff --check` sem erros;
- migration aplicada no Supabase compartilhado;
- teste SQL aprovado sem exceção;
- painel administrativo exibiu 1 curso, 2 aulas, 2 trechos e 2 fontes;
- rascunhos permaneceram fora da base;
- `USER` foi redirecionado de `/admin/base-conhecimento` para
  `/area-autenticada`.

### Integração

- integrada na `main` em `95ee7f8`;
- ETAPA 10 autorizada explicitamente pelo desenvolvedor principal.

---

## Tarefa CP-1 — Validação da plataforma educacional

**Responsável:** Desenvolvedor principal
**Status:** INTEGRADO
**Branch:** `test/checkpoint-1`

### Objetivo

Executar e documentar os fluxos integrados definidos em
`docs/checkpoint-1.md`, sem adicionar funcionalidades ou alterar o banco.

### Áreas reservadas ao desenvolvedor principal

```text
docs/checkpoint-1.md
docs/STATUS.md
docs/WORKBOARD.md
docs/ROADMAP.md
```

### Regras

- não iniciar a ETAPA 9;
- não criar migration;
- não alterar funcionalidades durante o checkpoint sem registrar um defeito;
- não inventar resultados de testes;
- não compartilhar credenciais nas evidências.

### Validações locais executadas

- `npm.cmd run lint` aprovado;
- `npm.cmd run build` aprovado;
- rotas `/`, `/login` e `/cadastro` responderam HTTP 200;
- `/admin` sem sessão redirecionou por HTTP 307 para `/login`;
- `/cursos` sem sessão enviou redirecionamento por streaming para `/login` sem
  exibir o catálogo.

### Validações manuais confirmadas

- fluxo administrativo completo aprovado;
- painel confirmou 2 cursos, 1 publicado, 2 módulos, 2 de 2 aulas publicadas e
  2 fontes;
- catálogo, conteúdo Markdown, fonte e ordenação aprovados como `USER`;
- progresso parcial e conclusão em `100%` aprovados;
- persistência após logout e novo login aprovada;
- bloqueio de `/admin` e `/admin/cursos` para `USER` aprovado;
- outra conta iniciou com `0%`, confirmando o isolamento do progresso.

### Integração

- documentação integrada na `main` em `eb1e008`;
- ETAPA 9 autorizada explicitamente pelo desenvolvedor principal.

---

## Tarefa P-8 — Painel administrativo

**Responsável:** Desenvolvedor principal
**Status:** INTEGRADO
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

### Não tocar durante o CHECKPOINT 1 sem reatribuição explícita

```text
docs/checkpoint-1.md
docs/STATUS.md
docs/WORKBOARD.md
docs/ROADMAP.md
```

Se uma melhoria precisar alterar a documentação do checkpoint, o
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

CHECKPOINT 1:

```bash
git switch -c test/checkpoint-1
```

A criação/troca de branch deve ser feita pelo humano ou com autorização explícita ao agente.

Melhorias do segundo desenvolvedor devem usar branches próprias, com nomes
compatíveis com a tarefa registrada.

## Passo 2 — autorizar a tarefa

```text
INICIAR CHECKPOINT 1
```

## Passo 3 — trabalhar sem cruzar responsabilidades

Cada Codex deve permanecer na tarefa e nos arquivos registrados.

## Passo 4 — integração

O CHECKPOINT 1 deve ser revisado e integrado por Pull Request/merge consciente. Uma
melhoria paralela só deve ser integrada depois de verificar conflitos e repetir
os testes afetados.

## Passo 5 — teste integrado do CHECKPOINT 1

O CHECKPOINT 1 só pode ser marcado como concluído quando:

```text
ADMIN cria e publica curso, módulo e aula → USER visualiza
```

e também for validado que:

```text
USER conclui aulas → logout/login → progresso permanece salvo
```

Somente depois a ETAPA 9 pode ser considerada elegível.

---

# 6. Tarefas ativas

```text
P-4: INTEGRADO — main 94e7a2f
P-5: INTEGRADO — main 65712a2
P-6: INTEGRADO — commit funcional 1eb21ae; merge confirmado pelo usuário
P-7: INTEGRADO — commit funcional 195bebf; merge confirmado pelo usuário
P-8: INTEGRADO — main 149068b
CP-1: INTEGRADO — main eb1e008
P-9: PRONTO PARA REVISÃO — feature/knowledge-base
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
Commit/PR: 99c9495 / integrado na main em 149068b
Status: INTEGRADO

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
- integração concluída na main em 149068b

Arquivos compartilhados tocados:
- src/components/auth/authenticated-header.tsx
- src/app/area-autenticada/page.tsx
- docs/database.md
- docs/DECISIONS.md
- docs/ROADMAP.md
- docs/STATUS.md
- docs/WORKBOARD.md

Observações para o outro desenvolvedor:
- painel administrativo disponível na main como base do CHECKPOINT 1
- nenhuma migration foi criada na ETAPA 8
- relatórios de progresso e gestão de usuários permanecem fora do escopo
```

## Handoff CP-1 — CHECKPOINT 1

```text
HANDOFF

Responsável: Desenvolvedor principal
Tarefa: CP-1 — Validação da plataforma educacional
Branch: test/checkpoint-1
Commit/PR: ccb5e35 / integrado na main em eb1e008
Status: INTEGRADO

Arquivos principais alterados:
- docs/checkpoint-1.md
- docs/STATUS.md
- docs/WORKBOARD.md
- docs/ROADMAP.md

Banco/migrations:
- nenhuma alteração de banco
- nenhuma migration criada ou modificada

Testes executados:
- npm.cmd run lint
- npm.cmd run build
- git diff --check
- requisições sem sessão para rotas públicas e protegidas
- fluxo administrativo completo
- cadastro e fluxo autenticado de USER
- conclusão e persistência do progresso
- bloqueio de rotas administrativas para USER
- isolamento do progresso entre contas

Resultados reais:
- lint e build aprovados
- rotas públicas responderam sem erro
- rotas protegidas não exibiram dados sem autenticação
- gerenciamento e publicação de cursos, módulos, aulas e fontes aprovados
- USER visualizou apenas conteúdo publicado na ordem configurada
- progresso parcial, conclusão em 100% e persistência após novo login aprovados
- USER não acessou /admin nem /admin/cursos
- outra conta iniciou em 0% e não recebeu o progresso da primeira conta

Pendências:
- nenhuma pendência do CHECKPOINT 1

Dependências para integração:
- integração concluída na main em eb1e008

Arquivos compartilhados tocados:
- docs/STATUS.md
- docs/WORKBOARD.md
- docs/ROADMAP.md

Observações para o outro desenvolvedor:
- CHECKPOINT 1 aprovado funcionalmente em 08/09/2026
- nenhuma funcionalidade ou estrutura de banco foi alterada
- ETAPA 9 autorizada na branch feature/knowledge-base
```

## Handoff P-9 — ETAPA 9

```text
HANDOFF

Responsável: Desenvolvedor principal
Tarefa: P-9 — Base de conhecimento
Branch: feature/knowledge-base
Commit/PR: aguardando versionamento e integração
Status: PRONTO PARA REVISÃO

Arquivos principais alterados:
- src/app/admin/base-conhecimento/**
- src/lib/knowledge/**
- src/components/courses/admin/admin-courses-nav.tsx
- supabase/migrations/20260908000000_create_knowledge_documents_view.sql
- supabase/tests/knowledge_base_validation.sql
- docs/knowledge-base.md
- docs/database.md
- docs/DECISIONS.md
- docs/ROADMAP.md
- docs/STATUS.md
- docs/WORKBOARD.md

Banco/migrations:
- nova view public.knowledge_documents
- view security_invoker e security_barrier
- authenticated com apenas SELECT e anon sem acesso
- migration aplicada no Supabase compartilhado

Testes executados:
- npm.cmd run lint
- npm.cmd run build
- git diff --check
- teste local do particionamento Markdown
- supabase/tests/knowledge_base_validation.sql
- acesso à base como ADMIN
- acesso direto à rota como USER

Resultados reais:
- lint e build aprovados
- particionamento não gerou trechos vazios ou acima de 1.200 caracteres
- teste SQL concluído sem exceção
- painel exibiu 1 curso, 2 aulas, 2 trechos e 2 fontes
- conteúdo em rascunho permaneceu fora da base
- vínculo para a aula funcionou
- USER recebeu HTTP 307 e foi redirecionado para /area-autenticada

Pendências:
- versionar e integrar a ETAPA 9 na main
- obter autorização explícita antes de iniciar a ETAPA 10

Dependências para integração:
- revisar migration, teste SQL, camada server-only e rota administrativa

Arquivos compartilhados tocados:
- src/components/courses/admin/admin-courses-nav.tsx
- docs/database.md
- docs/DECISIONS.md
- docs/ROADMAP.md
- docs/STATUS.md
- docs/WORKBOARD.md

Observações para o outro desenvolvedor:
- a base deriva diretamente do conteúdo publicado e não exige sincronização
- nenhuma chamada OpenAI, embedding, busca ou interface de chat foi criada
- não criar migration concorrente para public.knowledge_documents
```

## Handoff P-10 — ETAPA 10

```text
HANDOFF

Responsável: Desenvolvedor principal
Tarefa: P-10 — RAG e Groq
Branch: feature/rag
Commit/PR: integrado na main em 3b99cac
Status: INTEGRADO

Arquivos principais alterados:
- src/app/api/chat/route.ts
- src/lib/rag/**
- scripts/validate-rag.mjs
- .env.example
- package.json
- package-lock.json
- AGENTS.md
- docs/rag.md
- docs/PROJECT_SPEC.md
- docs/DECISIONS.md
- docs/ROADMAP.md
- docs/STATUS.md
- docs/WORKBOARD.md

Banco/migrations:
- nenhuma alteração de banco
- nenhuma migration criada ou modificada

Testes executados:
- npm.cmd run test:rag
- npm.cmd run lint
- npm.cmd run build
- POST /api/chat sem sessão
- pergunta autenticada coberta pela base
- pergunta autenticada fora da base
- pedido de recomendação personalizada

Resultados reais:
- recuperação, guardrails e validação de entrada aprovados
- lint e build aprovados com a rota dinâmica /api/chat
- requisição sem sessão retornou HTTP 401 e Cache-Control: no-store
- pergunta coberta retornou HTTP 200, answered e duas referências pela Groq
- pergunta fora da base retornou insufficient_context
- recomendação personalizada retornou restricted
- chave da Groq permaneceu somente no .env.local ignorado pelo Git

Pendências:
- nenhuma pendência funcional da ETAPA 10

Dependências para integração:
- revisar backend RAG, contrato HTTP, SDK e documentação

Arquivos compartilhados tocados:
- AGENTS.md
- .env.example
- package.json
- package-lock.json
- docs/PROJECT_SPEC.md
- docs/DECISIONS.md
- docs/ROADMAP.md
- docs/STATUS.md
- docs/WORKBOARD.md

Observações para o outro desenvolvedor:
- o provedor autorizado é Groq, não OpenAI
- a interface foi iniciada separadamente na ETAPA 11
- o histórico do chatbot ainda não foi iniciado
- não expor GROQ_API_KEY nem adicionar prefixo NEXT_PUBLIC_
```

## Handoff P-11 — ETAPA 11

```text
HANDOFF

Responsável: Desenvolvedor principal
Tarefa: P-11 — Interface do chatbot
Branch: feature/chatbot-ui
Commit/PR: aguardando versionamento e integração
Status: PRONTO PARA REVISÃO

Arquivos principais alterados:
- src/app/chat/page.tsx
- src/components/chat/chat-interface.tsx
- src/components/auth/authenticated-header.tsx
- src/app/area-autenticada/page.tsx
- src/app/globals.css
- docs/chatbot-ui.md
- docs/rag.md
- docs/DECISIONS.md
- docs/STATUS.md
- docs/WORKBOARD.md

Banco/migrations:
- nenhuma alteração de banco
- nenhuma migration criada ou modificada

Testes executados:
- npm.cmd run lint
- npm.cmd run build
- pergunta coberta pela base na interface
- pergunta fora da base na interface
- pedido de recomendação personalizada na interface

Resultados reais:
- lint aprovado
- build aprovado com a rota dinâmica /chat
- resposta fundamentada exibida com duas referências
- contexto insuficiente e solicitação limitada exibidos corretamente
- requisições responderam HTTP 200 sem erro no servidor
- links internos das aulas e externos das fontes funcionaram
- atualização da página removeu a consulta anterior

Pendências:
- versionar e integrar a ETAPA 11 na main

Dependências para integração:
- confirmar resposta fundamentada e referências na interface
- confirmar contexto insuficiente e solicitação limitada
- conferir navegação para aula e fonte

Observações para o outro desenvolvedor:
- a interface mantém somente a consulta atual em memória
- não há histórico, localStorage, tabela ou migration de mensagens
- GROQ_API_KEY continua restrita ao servidor
```
