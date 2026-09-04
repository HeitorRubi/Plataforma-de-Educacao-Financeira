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

## D-013 — Ordenação transacional de módulos

**DECISÃO:** criar e reordenar módulos por funções PostgreSQL transacionais com
`SECURITY INVOKER`, chamadas pelas Server Actions através de RPC.

**MOTIVO:** a restrição `(course_id, position)` não permite que duas linhas
ocupem temporariamente a mesma posição durante uma troca.

**ALTERNATIVAS CONSIDERADAS:** executar várias atualizações independentes no
Next.js ou usar funções `SECURITY DEFINER`.

**JUSTIFICATIVA:** uma função mantém a troca atômica no banco. O modo
`SECURITY INVOKER` conserva os grants e o RLS do usuário autenticado, sem elevar
privilégios ou utilizar `service_role`.

## D-014 — Visibilidade dos módulos pelo curso

**DECISÃO:** módulos herdam a visibilidade do curso ao qual pertencem.

**MOTIVO:** a modelagem atual não possui publicação independente em `modules`.

**ALTERNATIVAS CONSIDERADAS:** adicionar `is_published` aos módulos nesta etapa.

**JUSTIFICATIVA:** a publicação individual não foi solicitada para a ETAPA 5 e
alteraria a modelagem sem necessidade. Usuários comuns veem módulos somente
quando `courses.is_published = true`.

## D-015 — Markdown para o conteúdo das aulas

**DECISÃO:** armazenar `lessons.content` como Markdown e renderizar com
`react-markdown`, sem habilitar HTML bruto.

**MOTIVO:** o formato suporta texto, subtítulos, listas, links e imagens usando o
campo `text` já existente no banco.

**ALTERNATIVAS CONSIDERADAS:** texto sem formatação, HTML armazenado diretamente
ou um editor visual completo.

**JUSTIFICATIVA:** Markdown atende ao MVP com menor complexidade. A biblioteca
evita implementar um parser próprio e não depende de `dangerouslySetInnerHTML`.

## D-016 — Publicação e navegação das aulas

**DECISÃO:** permitir leitura somente de aulas publicadas pertencentes a cursos
publicados e calcular anterior/próxima pela ordem de módulos e aulas.

**MOTIVO:** rascunhos não podem aparecer no catálogo nem participar do percurso
de aprendizagem do usuário.

**ALTERNATIVAS CONSIDERADAS:** navegar somente dentro do módulo ou expor todos
os registros e filtrar apenas na interface.

**JUSTIFICATIVA:** a sequência pelo curso mantém a leitura contínua entre
módulos, enquanto o RLS protege rascunhos mesmo fora da interface.

## D-017 — Fontes como dados estruturados

**DECISÃO:** armazenar título, autor, URL e ano em `lesson_sources`, mantendo
campos incompletos como nulos.

**MOTIVO:** referências precisam ser exibidas e posteriormente associadas ao
chatbot sem inventar informações ausentes.

**ALTERNATIVAS CONSIDERADAS:** salvar todas as referências em um único campo de
texto dentro da aula.

**JUSTIFICATIVA:** campos estruturados permitem validação, ordenação e
rastreabilidade, sem completar dados bibliográficos por suposição.

## D-018 — Conclusão imutável e progresso por aulas publicadas

**DECISÃO:** registrar uma única conclusão por usuário e aula, sem oferecer
remoção na ETAPA 7, e calcular o percentual somente sobre aulas publicadas do
curso publicado.

**MOTIVO:** a chave primária composta de `lesson_progress` já representa uma
conclusão única e o percurso do usuário contém somente o conteúdo disponível.

**ALTERNATIVAS CONSIDERADAS:** permitir marcar/desmarcar, contar rascunhos no
total ou manter o progresso apenas no navegador.

**JUSTIFICATIVA:** inserções imutáveis exigem menos permissões no banco,
persistem entre sessões e evitam que rascunhos administrativos distorçam o
percentual exibido ao usuário.
