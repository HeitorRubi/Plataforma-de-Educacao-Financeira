# Roadmap e Dependências

Este roadmap mantém o desenvolvimento incremental do projeto. Uma etapa não deve ser iniciada quando depende de outra ainda não integrada.

## Estado de alto nível

- [x] ETAPA 0 — Diagnóstico inicial
- [x] ETAPA 1 — Ambiente e projeto base
- [x] ETAPA 2 — Supabase e banco de dados
- [x] ETAPA 3 — Autenticação
- [x] ETAPA 4 — Cursos
- [x] ETAPA 5 — Módulos
- [x] ETAPA 6 — Aulas
- [x] ETAPA 7 — Progresso
- [x] ETAPA 8 — Painel administrativo
- [x] CHECKPOINT 1 — Plataforma educacional
- [x] ETAPA 9 — Base de conhecimento
- [x] ETAPA 10 — RAG e Groq
- [x] ETAPA 11 — Interface do chatbot
- [x] ETAPA 12 — Histórico do chat
- [x] ETAPA 13 — Revisão de segurança e RLS
- [ ] ETAPA 14 — Testes
- [ ] ETAPA 15 — Deploy
- [ ] ETAPA 16 — Congelamento do MVP

O status observado detalhado está em `STATUS.md`.

## Dependências principais

```text
0 Diagnóstico
    ↓
1 Projeto base
    ↓
2 Banco
    ↓
3 Autenticação
    ↓
4 Cursos
    ↓
5 Módulos
    ↓
6 Aulas
    ↓
7 Progresso
    ↓
8 Consolidação administrativa
    ↓
CHECKPOINT 1
    ↓
9 Base de conhecimento
    ↓
10 RAG/Groq
    ↓
11 Interface do chatbot
    ↓
12 Histórico do chat
    ↓
13 Segurança
    ↓
14 Testes
    ↓
15 Deploy
    ↓
16 Freeze do MVP
```

## ETAPA 4 — Cursos

Objetivo:

- CRUD administrativo de cursos;
- criar;
- listar;
- consultar;
- editar;
- publicar/despublicar;
- usuário comum visualiza apenas cursos publicados.

Preferir despublicação a exclusão física.

Critério:

```text
ADMIN cria curso
      ↓
publica
      ↓
USER visualiza
```

Não implementar módulos nesta etapa.

## ETAPA 5 — Módulos

Objetivo:

- criar e editar módulos;
- listar;
- ordenar;
- relacionar ao curso.

Depende do contrato e das rotas/serviços de cursos estabilizados.

Não implementar aulas.

## ETAPA 6 — Aulas

Objetivo:

- aulas textuais;
- criação/edição;
- publicação;
- ordenação;
- conteúdo;
- fontes/referências;
- navegação anterior/próxima.

Não implementar vídeos.

## ETAPA 7 — Progresso

Objetivo:

- concluir aula;
- persistir em `lesson_progress`;
- manter progresso após logout/login;
- calcular progresso do usuário.

## ETAPA 8 — Painel administrativo

Consolidar gerenciamento de cursos, módulos, aulas, fontes, publicação e ordem.

`USER` não pode executar operações administrativas.

## CHECKPOINT 1

Antes da IA, provar o fluxo:

```text
Cadastro → Login → Cursos → Módulos → Aulas
→ Concluir aula → Progresso → Logout → Login
→ Progresso continua salvo
```

E:

```text
ADMIN → cria curso → módulo → aula → publica
→ USER visualiza
```

IA permanece bloqueada até este checkpoint ser aprovado.

## ETAPAS 9–12 — IA

9. Preparar conteúdo aprovado como base de conhecimento.
10. Recuperação de conteúdo + Groq no servidor.
11. Interface básica do chatbot.
12. Persistência de sessões e mensagens.

## ETAPAS 13–16 — Fechamento

13. Revisão de autenticação, autorização, RLS, dados privados, segredos e validações.
14. Testes reais da plataforma e do chatbot.
15. Deploy somente com MVP funcional localmente.
16. Congelamento: somente bugs, estabilidade, segurança, interface e documentação.

## Paralelização permitida

O projeto pode ter dois desenvolvedores em paralelo, mas o paralelismo é por **tarefas independentes**, não por ignorar dependências.

Pode ocorrer em paralelo:
- documentação de uma funcionalidade já implementada;
- testes de uma área já estabilizada;
- componentes isolados com contrato previamente registrado;
- tarefas em arquivos e responsabilidades distintas.

Não deve ocorrer em paralelo sem contrato:
- duas migrations alterando a mesma estrutura;
- duas pessoas editando a mesma rota/componente central;
- etapa dependente de interface/contrato ainda indefinido;
- implementação futura que viole o bloqueio de escopo.

A tarefa ativa e seus contratos devem constar em `WORKBOARD.md`.
