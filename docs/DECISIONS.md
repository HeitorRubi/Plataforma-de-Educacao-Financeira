# Decisões Técnicas Registradas

Este arquivo registra decisões já observadas no projeto e decisões de colaboração necessárias para manter dois desenvolvedores sincronizados.

## D-001 — Stack principal

**DECISÃO:** usar TypeScript, Next.js, React, Tailwind CSS, PostgreSQL e Supabase.

**MOTIVO:** manter uma arquitetura simples para o MVP acadêmico.

**ALTERNATIVAS CONSIDERADAS:** outras stacks não fazem parte do escopo atual.

**JUSTIFICATIVA:** reduzir complexidade e manter o grupo capaz de explicar o projeto.

## D-002 — Supabase Auth

**DECISÃO:** usar Supabase Auth com e-mail/senha e integração SSR via cookies.

**MOTIVO:** reduzir implementação própria de gerenciamento de credenciais.

**ALTERNATIVAS CONSIDERADAS:** autenticação somente no navegador ou gerenciamento próprio de senhas.

**JUSTIFICATIVA:** integração direta com o banco e menor quantidade de código sensível próprio.

## D-003 — Confirmação de e-mail no ambiente acadêmico

**DECISÃO:** manter confirmação de e-mail desativada durante a demonstração acadêmica atual.

**MOTIVO:** simplificar o fluxo cadastro → sessão → área autenticada.

**RISCO:** essa é uma decisão de ambiente acadêmico, não uma recomendação automática para produção.

**AÇÃO FUTURA:** revisar antes do deploy público.

## D-004 — Perfil associado a `auth.users`

**DECISÃO:** `public.profiles.id` referencia `auth.users.id` e o perfil é criado automaticamente após o cadastro.

**MOTIVO:** separar identidade gerenciada pelo Supabase dos dados públicos da aplicação.

## D-005 — Roles

**DECISÃO:** roles iniciais `USER` e `ADMIN`.

**SEGURANÇA:** usuário autenticado comum não deve poder alterar o próprio `role`.

## D-006 — RLS

**DECISÃO:** utilizar Row Level Security como parte da autorização.

**REGRA:** segurança não pode depender somente de esconder elementos na interface.

## D-007 — Migrations

**DECISÃO:** alterações de schema devem gerar novas migrations.

**REGRA:** migration aplicada em banco compartilhado não deve ser reescrita silenciosamente.

**COLABORAÇÃO:** antes de criar uma migration, conferir migrations do remoto e o `WORKBOARD.md`.

## D-008 — Segredos

**DECISÃO:** nenhum segredo privado deve ser versionado ou exposto ao frontend.

Permitidas no cliente apenas variáveis explicitamente públicas, como a URL do Supabase e a publishable key.

## D-009 — Desenvolvimento incremental

**DECISÃO:** manter etapas e tarefas limitadas.

**MOTIVO:** facilitar aprendizado, testes e explicação no Trabalho de Graduação.

**ADAPTAÇÃO PARA DUPLA:** o bloqueio é aplicado à tarefa e às dependências. Tarefas independentes podem ocorrer em paralelo se houver responsáveis, branches e contratos registrados.

## D-010 — Git como ponto de sincronização

**DECISÃO:** `main` remoto representa a base integrada do grupo.

**REGRA:** cada desenvolvedor trabalha em branch própria de tarefa e integra por Pull Request/merge revisado.

**REGRA:** nenhum Codex deve pressupor que a conversa do outro agente está disponível.

## D-011 — Repositório como memória compartilhada dos agentes

**DECISÃO:** contexto estável fica versionado em `AGENTS.md` e `docs/`.

**MOTIVO:** chats são locais/transitórios e podem divergir; arquivos versionados acompanham o código.

**REGRA:** fatos transitórios, responsáveis e bloqueios ficam em `STATUS.md`/`WORKBOARD.md`, não em instruções permanentes.

## D-012 — Autorização de cursos pela sessão e pelo RLS

**DECISÃO:** executar consultas e mutações de cursos com o cliente SSR associado
à sessão do usuário, combinando verificação `ADMIN` no servidor com grants
mínimos e policies RLS no PostgreSQL.

**MOTIVO:** proteger as operações mesmo quando uma Server Action ou a API do
Supabase for chamada fora da interface prevista.

**ALTERNATIVAS CONSIDERADAS:** esconder controles somente na interface ou usar
`service_role` nas ações administrativas.

**JUSTIFICATIVA:** a interface não é uma barreira de segurança e `service_role`
ignoraria o RLS. A sessão autenticada mantém a decisão de acesso no banco e no
servidor.

**REGRA:** cursos não são excluídos fisicamente nesta etapa; publicação e
despublicação atendem ao ciclo de vida necessário do MVP.
