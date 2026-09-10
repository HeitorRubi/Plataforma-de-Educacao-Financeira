# Autenticação

Esta etapa usa Supabase Auth com e-mail e senha. O Next.js mantém a sessão em
cookies por meio de `@supabase/ssr`, e `src/proxy.ts` renova tokens expirados.

## Fluxo

```text
CADASTRO
   ↓
SESSÃO CRIADA
   ↓
ÁREA AUTENTICADA
   ↓
PERFIL / LOGOUT
   ↓
LOGIN
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha a URL e a chave publicável do
projeto. A chave `service_role` nunca deve usar o prefixo `NEXT_PUBLIC_` nem ser
incluída no navegador.

## Configuração do Supabase

### Migration

Execute uma única vez no SQL Editor:

```text
supabase/migrations/20260828010000_configure_auth_profiles.sql
```

Depois execute o conteúdo de:

```text
supabase/tests/auth_profiles_validation.sql
```

### Confirmação de e-mail

Em **Authentication > Providers > Email**, a opção **Confirm email** deve ficar
desativada para simplificar a demonstração acadêmica. Assim, o cadastro cria
uma sessão imediatamente, sem envio de mensagem.

Essa configuração deve ser revista antes de um eventual uso em produção, pois
a confirmação ajuda a comprovar que o usuário controla o endereço cadastrado.

## Segurança

- As páginas protegidas validam o JWT com `getClaims()`.
- Cada usuário lê e altera somente seu próprio perfil por RLS.
- Usuários autenticados atualizam apenas `full_name`; `role` não possui
  privilégio de atualização.
- O perfil é criado automaticamente quando o Supabase cria o usuário.
- Nome completo é limitado a 100 caracteres no formulário, na Server Action e
  no PostgreSQL; o e-mail é limitado a 254 caracteres antes da chamada ao Auth.
- A configuração de senha mínima, proteção contra senhas vazadas e confirmação
  de e-mail deve ser conferida no painel do Supabase antes da publicação.

## Tratamento de indisponibilidade

Falhas de conexão com o Supabase são informadas como indisponibilidade do
serviço. Somente erros de autenticação retornados pelo Supabase são apresentados
como e-mail ou senha inválidos. Isso evita atribuir incorretamente um problema de
rede às credenciais do usuário.

## Decisão técnica

```text
DECISÃO:
Utilizar autenticação SSR do Supabase com cookies e Server Actions, sem
confirmação de e-mail no ambiente acadêmico.

MOTIVO:
Mantém credenciais fora do JavaScript da página e integra sessão ao Next.js.

ALTERNATIVAS CONSIDERADAS:
Autenticação apenas no navegador ou gerenciamento próprio de senhas.

JUSTIFICATIVA:
O Supabase Auth reduz código sensível próprio e integra autenticação ao banco.
A confirmação foi desativada somente para tornar a demonstração local direta.
```
