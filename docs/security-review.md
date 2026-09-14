# Revisão de segurança e RLS

Este documento registra a ETAPA 13. A revisão cobre autenticação, autorização,
RLS, dados privados, segredos, validação de entrada e configuração HTTP. Ela não
substitui os testes funcionais amplos reservados à ETAPA 14.

## Controles revisados

- a identidade é validada no servidor com `supabase.auth.getClaims()`;
- páginas e Server Actions administrativas executam `requireAdmin()`;
- as oito tabelas da aplicação possuem RLS;
- histórico, progresso e perfil são isolados por `auth.uid()`;
- a aplicação usa somente a publishable key do Supabase e não usa
  `service_role`;
- `GROQ_API_KEY` é lida somente no servidor e `.env.local` permanece ignorado;
- o endpoint do chat exige sessão, JSON e corpo limitado, além de responder com
  `Cache-Control: no-store`;
- o Markdown é renderizado sem habilitar HTML bruto;
- links externos aceitam somente HTTP/HTTPS e usam `rel="noreferrer"`.

## Endurecimento aplicado

A migration `20260911000000_harden_security_boundaries.sql`:

- replica no PostgreSQL os limites de nome, cursos, módulos, aulas e fontes já
  usados nos formulários;
- valida perguntas pelo tamanho do texto sem espaços laterais;
- limita respostas fundamentadas a quatro referências e exige referência
  vazia nos estados sem contexto ou limitados;
- remove `CREATE` dos papéis da API no schema `public`;
- revoga execução pública de todas as funções e concede apenas os sete RPCs da
  aplicação a `authenticated`;
- preserva `handle_new_user` somente para `supabase_auth_admin`;
- revoga por padrão a execução pública de futuras funções criadas pelo mesmo
  papel que aplicar a migration.

A aplicação também passa a:

- limitar nome completo a 100 caracteres e e-mail a 254 caracteres no cliente
  e no servidor;
- omitir o cabeçalho `X-Powered-By`;
- enviar políticas de enquadramento, MIME sniffing, referrer, permissões do
  navegador e um CSP restrito a `base-uri`, formulários, frames e objetos.

## Validação no Supabase

Execute, nesta ordem, no SQL Editor:

1. `supabase/migrations/20260911000000_harden_security_boundaries.sql`;
2. `supabase/tests/security_review_validation.sql`.

O teste deve encerrar com:

```text
Revisão estrutural de segurança validada com sucesso.
```

Depois, valide com duas contas:

1. `USER` não acessa `/admin` nem executa ações administrativas;
2. cada conta vê somente seu perfil, progresso e conversas;
3. sem sessão, `/chat` redireciona ao login e as APIs do chat retornam `401`;
4. `ADMIN` ainda cria e ordena módulos, aulas e fontes após a revogação global
   de execução de funções;
5. cadastro, login, edição de perfil e uma nova conversa continuam funcionando.

## Configuração externa obrigatória

No painel do Supabase Auth, confira antes de exposição pública:

- senha mínima de pelo menos 8 caracteres;
- requisitos de letras e números coerentes com a validação da aplicação;
- proteção contra senhas vazadas, se disponível no plano;
- confirmação de e-mail habilitada fora da demonstração acadêmica;
- URLs de redirecionamento restritas aos endereços usados pela aplicação.

No console da Groq, revogue qualquer chave compartilhada fora do arquivo
`.env.local`, crie uma nova chave e reinicie a aplicação depois da troca.

## Riscos residuais

- não há limitador distribuído próprio para requisições à Groq; o controle de
  abuso depende dos limites do provedor até existir infraestrutura apropriada;
- `authenticated` insere o próprio histórico sob RLS porque o projeto não usa
  `service_role`; isso protege o isolamento, mas não comprova que toda mensagem
  própria foi gerada pela interface oficial;
- HSTS e a CSP completa com nonce foram validados localmente e nos fluxos do
  Preview da ETAPA 15; o smoke público será repetido após a integração na `main`.

Esses itens não permitem leitura cruzada nem expõem segredos, mas devem constar
na avaliação de produção.
