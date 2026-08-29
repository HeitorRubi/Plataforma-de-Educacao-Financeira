# Workboard Compartilhado — Desenvolvedor A + Desenvolvedor B

Este arquivo é o quadro operacional compartilhado dos dois desenvolvedores e dos dois Codex.

**Regra:** o que não estiver registrado aqui não deve ser presumido pelo agente.

## 1. Baseline observado

```text
branch integrada: main
HEAD observado na análise: 562a4e2
última etapa integrada observada: ETAPA 3 — AUTENTICAÇÃO
próxima etapa oficial: ETAPA 4 — CURSOS
```

Antes de confiar nesse baseline, cada Codex deve comparar com o Git real.

## 2. Estratégia da ETAPA 4

A ETAPA 4 será dividida em duas trilhas para permitir paralelismo sem pular para a ETAPA 5.

```text
                       ETAPA 4 — CURSOS
                              │
                 ┌────────────┴────────────┐
                 │                         │
          4A — ADMIN                 4B — USUÁRIO
        Desenvolvedor A             Desenvolvedor B
                 │                         │
      CRUD/publicação            leitura de publicados
                 │                         │
                 └────────────┬────────────┘
                              │
                         integração
                              │
                        ETAPA 4 concluída
```

Nenhuma das trilhas autoriza iniciar módulos.

---

# DESENVOLVEDOR A

## Tarefa A-4A — Cursos: administração

**Responsável:** Desenvolvedor A  
**Status inicial:** AGUARDANDO AUTORIZAÇÃO  
**Branch recomendada:** `feature/courses-admin`

### Objetivo

Implementar o lado administrativo da ETAPA 4:

- criar curso;
- listar cursos para administração;
- consultar curso;
- editar curso;
- publicar/despublicar curso;
- garantir que somente `ADMIN` execute operações administrativas.

### Áreas reservadas ao Desenvolvedor A

Após autorização, o Desenvolvedor A pode propor/usar principalmente:

```text
src/app/admin/cursos/**
src/components/courses/admin/**
src/lib/courses/admin*
supabase/migrations/*course*_admin*.sql
supabase/tests/*course*_admin*.sql
```

Os nomes exatos podem variar após inspeção, mas a separação de responsabilidade deve ser preservada.

### Não tocar sem coordenação

```text
src/app/cursos/**
src/components/courses/public/**
src/lib/courses/public*
```

Essas áreas pertencem ao Desenvolvedor B durante a ETAPA 4.

### Regras

- não iniciar módulos;
- não alterar autenticação existente sem necessidade comprovada;
- alterações de autorização/RLS devem ser mínimas e testadas;
- migrations são responsabilidade primária desta trilha quando necessárias para o CRUD administrativo;
- qualquer política que também afete leitura pública/autenticada deve ser registrada no contrato compartilhado abaixo.

---

# DESENVOLVEDOR B

## Tarefa B-4B — Cursos: experiência do usuário

**Responsável:** Desenvolvedor B  
**Status inicial:** AGUARDANDO AUTORIZAÇÃO  
**Branch recomendada:** `feature/courses-public`

### Objetivo

Implementar o lado do usuário da ETAPA 4:

- listar cursos publicados;
- impedir que cursos não publicados apareçam ao usuário comum;
- permitir consultar os dados do curso necessários nesta etapa;
- criar a interface de visualização dos cursos publicados;
- tratar vazio, carregamento/erro quando aplicável.

### Áreas reservadas ao Desenvolvedor B

Após autorização, o Desenvolvedor B pode propor/usar principalmente:

```text
src/app/cursos/**
src/components/courses/public/**
src/lib/courses/public*
```

Se testes específicos de leitura forem necessários, propor arquivos próprios sem editar os testes da trilha A.

### Não tocar sem coordenação

```text
src/app/admin/cursos/**
src/components/courses/admin/**
src/lib/courses/admin*
supabase/migrations/**
```

Por padrão, migrations da ETAPA 4 ficam com o Desenvolvedor A para evitar colisão.

Se a trilha B descobrir necessidade de nova política/migration, deve:
1. registrar a necessidade;
2. informar o Desenvolvedor A;
3. aguardar integração da migration;
4. não criar migration concorrente sem reatribuição explícita.

### Regra de teste

A trilha B pode implementar código antes da política de leitura estar integrada, mas não pode declarar o fluxo remoto aprovado enquanto depender da migration/política da trilha A.

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

## Passo 0 — ambos

Cada um:

```bash
git fetch origin
git switch main
git pull origin main
git status --short --branch
git log --oneline --decorate -10
```

Confirmar que o projeto está sincronizado.

## Passo 1 — criar branches separadas

Desenvolvedor A:

```bash
git switch -c feature/courses-admin
```

Desenvolvedor B:

```bash
git switch -c feature/courses-public
```

A criação/troca de branch deve ser feita pelo humano ou com autorização explícita ao agente.

## Passo 2 — autorizar os Codex

Para A:

```text
INICIAR TAREFA A-4A
```

Para B:

```text
INICIAR TAREFA B-4B
```

## Passo 3 — trabalhar sem cruzar ownership

Cada Codex deve permanecer em sua área.

## Passo 4 — integração

A ordem de merge pode variar.

Se a trilha B depender de RLS/política criada pela trilha A para testar o fluxo real, integrar A primeiro é preferível.

Depois que uma trilha entrar na `main`, a outra sincroniza antes do teste final.

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

Inicialmente:

```text
A-4A: AGUARDANDO AUTORIZAÇÃO
B-4B: AGUARDANDO AUTORIZAÇÃO
```

Após iniciar, cada responsável deve alterar seu status para:

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

Cada trilha deve registrar no encerramento:

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
