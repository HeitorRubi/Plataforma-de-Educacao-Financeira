<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Projeto TCC — instruções permanentes para agentes

Este repositório contém uma Plataforma Gratuita de Educação Financeira desenvolvida como Trabalho de Graduação.

## 1. Fonte de verdade

Antes de modificar código, leia somente o necessário nesta ordem:

1. `docs/STATUS.md` — estado observado atual do repositório.
2. `docs/WORKBOARD.md` — tarefa ativa, responsável, branch e bloqueios.
3. `docs/ROADMAP.md` — dependências e ordem das etapas.
4. `docs/PROJECT_SPEC.md` — escopo e restrições funcionais.
5. `docs/DECISIONS.md` — decisões técnicas já tomadas.
6. `docs/COLLABORATION.md` — regras para dois desenvolvedores/agentes.
7. Documentação específica da área alterada, por exemplo:
   - `docs/database.md`
   - `docs/authentication.md`

Não trate uma conversa antiga do Codex como fonte de verdade se ela divergir do repositório.

Quando houver conflito:
- código + histórico Git definem o que existe;
- `docs/PROJECT_SPEC.md` define o comportamento pretendido;
- `docs/WORKBOARD.md` define quem pode trabalhar em quê;
- reporte a divergência antes de alterar código.

## 2. Regra de escopo

Não desenvolva o projeto inteiro de uma vez.

Trabalhe apenas na tarefa explicitamente autorizada e atribuída ao desenvolvedor atual no `docs/WORKBOARD.md`.

É proibido:
- antecipar etapas dependentes;
- alterar arquivos pertencentes a uma tarefa ativa do outro desenvolvedor sem autorização;
- fazer refatoração não relacionada;
- trocar tecnologias definidas sem autorização;
- criar funcionalidades futuras “aproveitando” uma alteração;
- inventar resultados de testes;
- inventar dados, fontes ou conteúdo financeiro como se fossem reais.

## 3. Preflight obrigatório

Antes de editar:

1. Execute `git status --short --branch`.
2. Execute `git log --oneline --decorate -10`.
3. Confirme a branch atual.
4. Leia `docs/STATUS.md` e `docs/WORKBOARD.md`.
5. Identifique dependências da tarefa.
6. Liste os arquivos que provavelmente serão tocados.
7. Informe bloqueios ou conflitos.

Se estiver em `main` e a tarefa exigir alterações, NÃO comece a editar. Avise que é necessário trabalhar em uma branch de funcionalidade, salvo autorização explícita diferente do usuário.

Não crie, troque, apague, faça merge ou push de branches por conta própria sem solicitação explícita.

## 4. Colaboração

O `main` remoto é o ponto de integração compartilhado.

Considere trabalho do colega disponível somente quando:
- estiver mesclado na base que você possui; ou
- existir um contrato explícito registrado em `docs/WORKBOARD.md`.

Antes de tocar um arquivo listado como pertencente ao outro desenvolvedor, pare e reporte o conflito.

Se sua tarefa depender de trabalho ainda não mesclado:
- não copie implementação imaginada;
- registre o bloqueio;
- proponha o contrato mínimo necessário;
- espere decisão humana.

## 5. Banco e Supabase

- Banco: PostgreSQL via Supabase.
- Auth: Supabase Auth.
- Nunca exponha `service_role`, secret keys, senha do banco ou chaves privadas no cliente, Git ou documentação.
- `.env.local` e demais segredos não devem ser versionados.
- Alterações de banco devem ser feitas por nova migration.
- Não reescreva migration já aplicada em ambiente compartilhado sem autorização e plano explícitos.
- Antes de criar migration, verifique os nomes/timestamps já existentes para evitar colisão com o colega.
- RLS e autorização devem existir no banco/servidor, não apenas na interface.

## 6. Tecnologias fixadas

- TypeScript
- Next.js
- React
- Tailwind CSS
- PostgreSQL
- Supabase
- Groq API somente nas etapas de IA
- Git/GitHub

Não adicionar microserviços, filas, containers ou outra infraestrutura sem necessidade comprovada e autorização.

## 7. Qualidade

Priorize:
- simplicidade;
- legibilidade;
- tipagem;
- menor alteração suficiente;
- separação de responsabilidades;
- tratamento de erros;
- segurança;
- capacidade de explicar o código durante a apresentação do TG.

Evite:
- overengineering;
- abstrações prematuras;
- `any` sem necessidade;
- arquivos/funções gigantes;
- duplicação excessiva;
- comentários óbvios;
- alterações cosméticas em arquivos fora do escopo.

## 8. Verificação

Depois das alterações, execute quando aplicável e disponível:

```powershell
npm.cmd run lint
npm.cmd run build
```

Em ambientes onde `npm` funciona normalmente, os equivalentes `npm run lint` e `npm run build` são aceitáveis.

Execute também testes específicos da tarefa quando existirem.

Nunca declare um teste como aprovado se ele não foi realmente executado. Se uma dependência externa impedir o teste (por exemplo, Supabase remoto), declare a limitação.

## 9. Encerramento da tarefa

Ao concluir uma unidade autorizada, informe:

- objetivo executado;
- arquivos alterados;
- banco/migrations alterados;
- testes realmente executados e resultados;
- pendências;
- riscos ou bloqueios;
- sugestão de commit;
- atualização necessária em `docs/STATUS.md` e `docs/WORKBOARD.md`.

Pare ao terminar a tarefa autorizada. Não comece a próxima automaticamente.
