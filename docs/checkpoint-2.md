# CHECKPOINT 2 — Plataforma e chatbot

## Objetivo

Validar a `main` integrada após a revisão de segurança, cobrindo domínio,
interface HTTP, banco, autenticação, administração, progresso, RAG e histórico.
A etapa não adiciona funcionalidades nem altera o schema.

## Verificações automatizadas

Execute:

```powershell
npm.cmd run test:platform
npm.cmd run test:rag
npm.cmd run lint
npm.cmd run build
git diff --check
```

Para o smoke HTTP local, inicie o build de produção em outro terminal:

```powershell
npm.cmd run start
```

Então execute:

```powershell
npm.cmd run test:http
```

O mesmo teste pode validar a URL publicada:

```powershell
npm.cmd run test:http -- https://seu-projeto.vercel.app
```

O smoke confirma rotas públicas, bloqueio das rotas protegidas, APIs sem sessão,
ausência de cache nas respostas privadas e cabeçalhos defensivos.

Resultados automatizados registrados em 14/09/2026:

- `npm.cmd run test:platform` aprovado;
- `npm.cmd run test:rag` aprovado;
- `npm.cmd run lint` aprovado;
- `npm.cmd run build` aprovado;
- `git diff --check` aprovado, somente com avisos de normalização LF/CRLF;
- `npm.cmd run test:http` aprovado no build local de produção;
- `npm.cmd run test:http -- https://pla-financeiro.vercel.app` aprovado;
- `npm.cmd audit --json` sem vulnerabilidades nas 528 dependências analisadas.

## Banco

No SQL Editor do Supabase, execute:

```text
supabase/tests/final_checkpoint_validation.sql
```

O resultado esperado é `Success. No rows returned`, acompanhado do notice
`Checkpoint final do banco validado com sucesso.` quando o painel exibi-lo.

Resultado registrado em 14/09/2026:

- `supabase/tests/final_checkpoint_validation.sql` aprovado no Supabase com
  `Success. No rows returned`.

## Fluxo administrativo

- [x] Entrar com uma conta `ADMIN` e abrir `/admin`.
- [x] Criar um curso identificado como dado de teste.
- [x] Criar dois módulos e confirmar a reordenação persistida.
- [x] Criar duas aulas em Markdown e confirmar a reordenação persistida.
- [x] Criar e reordenar uma fonte sem inventar dados bibliográficos.
- [x] Publicar aulas e curso e conferir os totais do painel.
- [x] Confirmar que a base de conhecimento contém apenas o conteúdo publicado.

## Fluxo do usuário

- [x] Criar uma conta de teste e confirmar login, logout e novo login.
- [x] Localizar somente o curso publicado e conferir a ordem do conteúdo.
- [x] Ler Markdown, abrir a fonte e navegar entre as aulas.
- [x] Concluir uma aula e confirmar o progresso parcial.
- [x] Concluir a segunda aula e confirmar `100%`.
- [x] Entrar novamente e confirmar que o progresso foi preservado.
- [x] Confirmar que `/admin` e `/admin/cursos` permanecem bloqueados.

## Chatbot e histórico

- [x] Pergunta coberta retorna resposta fundamentada e referências válidas.
- [x] Pergunta fora da base retorna contexto insuficiente.
- [x] Pedido de recomendação financeira personalizada é limitado.
- [x] Atualizar a página preserva a conversa.
- [x] Criar outra conversa e alternar entre os dois históricos.
- [x] Links de aula e fontes das referências abrem corretamente.

## Isolamento

- [x] Uma segunda conta inicia o curso sem o progresso da primeira.
- [x] A segunda conta não visualiza as conversas da primeira.
- [x] Sem sessão, rotas protegidas redirecionam e APIs retornam HTTP 401.

## Critério de aprovação

O CHECKPOINT 2 foi aprovado em 14/09/2026. Os comandos automatizados, o teste
SQL e os fluxos de `ADMIN`, `USER`, chatbot, persistência e isolamento foram
confirmados pelo desenvolvedor principal. Nenhuma credencial, chave ou dado
privado foi incluído nas evidências ou no Git.
