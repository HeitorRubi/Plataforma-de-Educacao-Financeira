# Protocolo de Colaboração — 2 desenvolvedores + 2 Codex

## Objetivo

Permitir que dois desenvolvedores usem Codex em máquinas/conversas distintas sem depender da memória do chat do outro.

A sincronização ocorre por:

1. Git/GitHub;
2. `AGENTS.md`;
3. `STATUS.md`;
4. `WORKBOARD.md`;
5. decisões e contratos versionados.

## Regra central

**Chat não é sincronização. Repositório é sincronização.**

O Codex A não deve “imaginar” o que o Codex B fez. Ele só pode considerar:

- código presente na branch/base local;
- commits existentes;
- documentos versionados;
- contratos explicitamente registrados.

## Fluxo antes de iniciar uma tarefa

No computador do desenvolvedor:

```bash
git switch main
git pull origin main
```

Depois criar manualmente a branch da tarefa, por exemplo:

```bash
git switch -c feature/courses
```

Atualizar `WORKBOARD.md` com:

- responsável;
- etapa/tarefa;
- branch;
- status;
- arquivos/áreas reservadas;
- dependências;
- contrato, quando necessário.

Depois abrir o Codex e usar o prompt de bootstrap.

## Branches

Padrão recomendado:

```text
feature/courses
feature/modules
feature/lessons
feature/progress
feature/admin
feature/chatbot
fix/<assunto>
docs/<assunto>
```

Evitar trabalhar diretamente em `main`.

## Reserva de área

Cada tarefa ativa deve declarar as áreas esperadas.

Exemplo:

```text
Responsável A:
- src/app/admin/cursos/**
- src/lib/courses/**
- migration X

Responsável B:
- src/components/alguma-area/**
```

Se ambos precisarem do mesmo arquivo, registrar previamente quem faz a alteração compartilhada.

## Contrato de integração

Quando duas tarefas independentes precisam conversar, registre um contrato antes de codificar.

Exemplo:

```text
CONTRATO C-001
Course:
- id: uuid
- title: text
- description: text | null
- is_published: boolean

Funções/rotas esperadas:
- listar cursos publicados
- carregar curso por id
```

O contrato não autoriza implementar a etapa do colega; apenas estabiliza a interface entre trabalhos.

## Supabase e migrations

Antes de criar migration:

1. `git fetch origin`;
2. verificar migrations existentes;
3. verificar o `WORKBOARD.md`;
4. garantir nome/timestamp único;
5. registrar quem é o responsável.

Se duas tarefas precisarem mudar a mesma tabela, combinar ordem de merge.

Depois que uma migration for aplicada ao banco compartilhado, preferir migration corretiva nova em vez de editar o histórico.

## Sincronização durante o trabalho

Se o colega mesclou algo em `main` e sua branch precisa disso:

```bash
git fetch origin
git switch main
git pull origin main
git switch <sua-branch>
git merge main
```

Resolver conflitos conscientemente e executar testes novamente.

Não fazer merge só para “sumir com o conflito”.

## Pull Request / integração

Antes de integrar:

- lint executado;
- build executado, quando possível;
- testes específicos executados;
- `STATUS.md` atualizado;
- `WORKBOARD.md` atualizado;
- migrations documentadas;
- nenhum `.env`/segredo incluído;
- escopo do diff revisado;
- pendências declaradas.

## Handoff obrigatório

Ao encerrar uma tarefa ou passar trabalho para o outro desenvolvedor, registrar:

```text
HANDOFF
Responsável:
Tarefa:
Branch:
Commit/PR:
Status:
Arquivos principais:
Migration:
Testes executados:
Resultado:
Pendências:
Dependências para a próxima tarefa:
Observações:
```

## Conflitos

Quando houver conflito de código ou de decisão:

1. parar a implementação afetada;
2. comparar intenção das duas branches;
3. preservar regra de negócio correta;
4. escolher uma versão conscientemente;
5. testar novamente;
6. registrar decisão se ela for arquitetural.

## O que os agentes não podem fazer

Sem autorização explícita:

- trabalhar na área reservada do colega;
- alterar o roadmap;
- iniciar etapa futura bloqueada;
- apagar migrations;
- alterar role/políticas por conveniência;
- fazer push ou merge para `main`;
- inventar estado do Supabase remoto;
- considerar teste não executado como aprovado.
