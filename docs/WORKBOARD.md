# Workboard Compartilhado — Desenvolvedor principal + segundo desenvolvedor

Este arquivo é o quadro operacional compartilhado dos dois desenvolvedores e dos dois Codex.

**Regra:** o que não estiver registrado aqui não deve ser presumido pelo agente.

## 1. Baseline observado

```text
branch integrada: main
base funcional integrada observada: 94e7a2f
última etapa integrada observada: ETAPA 4 — CURSOS
próxima etapa oficial: ETAPA 5 — MÓDULOS
branch de trabalho atual: feature/modules
```

Antes de confiar nesse baseline, cada Codex deve comparar com o Git real.

Em 02/09/2026, `git fetch origin` foi tentado pelo agente, mas o terminal
automatizado não conseguiu autenticar no GitHub. A branch `feature/modules` foi
criada a partir da `main` local limpa, alinhada ao `origin/main` conhecido em
`06824fd`.

## 2. Estratégia da ETAPA 5

A ETAPA 5 será implementada integralmente pelo desenvolvedor principal. O
segundo desenvolvedor não possui uma trilha paralela de módulos e atuará somente
em melhorias pequenas de etapas já implementadas, registradas separadamente
neste quadro.

```text
DESENVOLVEDOR PRINCIPAL
          ↓
ADMINISTRAÇÃO DE MÓDULOS
          ↓
VÍNCULO COM O CURSO
          ↓
ORDENAÇÃO
          ↓
VISUALIZAÇÃO NO CURSO
          ↓
TESTE INTEGRADO DA ETAPA 5
```

Esta tarefa não autoriza iniciar aulas.

---

# DESENVOLVEDOR PRINCIPAL

## Tarefa P-5 — Módulos completos

**Responsável:** Desenvolvedor principal
**Status:** PRONTO PARA REVISÃO
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

### Não tocar durante a ETAPA 5 sem reatribuição explícita

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

Se uma melhoria precisar alterar arquivo compartilhado ou código de módulos, o
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

ETAPA 4:

```bash
git switch -c feature/courses
```

A criação/troca de branch deve ser feita pelo humano ou com autorização explícita ao agente.

Melhorias do segundo desenvolvedor devem usar branches próprias, com nomes
compatíveis com a tarefa registrada.

## Passo 2 — autorizar a tarefa

```text
INICIAR ETAPA 4
```

## Passo 3 — trabalhar sem cruzar responsabilidades

Cada Codex deve permanecer na tarefa e nos arquivos registrados.

## Passo 4 — integração

A ETAPA 4 deve ser revisada e integrada por Pull Request/merge consciente. Uma
melhoria paralela só deve ser integrada depois de verificar conflitos e repetir
os testes afetados.

## Passo 5 — teste integrado da ETAPA 4

A ETAPA 4 só pode ser marcada como concluída quando, na base integrada:

```text
ADMIN cria curso
      ↓
publica
      ↓
USER visualiza
```

e também for validado que:

```text
curso não publicado
      ↓
não aparece para USER
```

Somente depois a ETAPA 5 pode ser considerada elegível.

---

# 6. Tarefas ativas

```text
P-4: INTEGRADO — main 94e7a2f
P-5: PRONTO PARA REVISÃO — feature/modules
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
Commit/PR: a criar
Status: PRONTO PARA REVISÃO

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
- criar commit e integrar a branch feature/modules na main

Dependências para integração:
- revisar o diff e criar o commit da ETAPA 5

Arquivos compartilhados tocados:
- src/app/admin/cursos/[id]/page.tsx
- src/app/cursos/[id]/page.tsx
- docs/database.md
- docs/DECISIONS.md
- docs/ROADMAP.md
- docs/STATUS.md
- docs/WORKBOARD.md

Observações para o outro desenvolvedor:
- não alterar arquivos de módulos antes da integração de P-5
- não criar migration concorrente para public.modules
- nenhuma funcionalidade de aulas foi iniciada
```
