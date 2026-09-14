# Deploy na Vercel

## Ambiente publicado

- provedor: Vercel;
- repositório: GitHub;
- branch de produção: `main`;
- domínio principal: `https://pla-financeiro.vercel.app`;
- banco e autenticação: Supabase;
- geração das respostas do chatbot: Groq.

O projeto Vercel já existe. Não é necessário criar outro projeto: cada merge na
`main` inicia um novo deployment de produção pela integração com o GitHub.

## Variáveis de ambiente

Configure as variáveis para `Production`. Use também `Preview` quando a branch
precisar ser validada antes do merge.

| Variável | Tipo na Vercel | Exposição |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Config | pública e incorporada no build |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Config | pública e limitada por RLS |
| `GROQ_MODEL` | Config | privada por padrão, sem segredo |
| `GROQ_API_KEY` | Secret | somente servidor |

Os valores reais não devem aparecer no Git, em documentação, prints ou logs. A
aplicação não utiliza `service_role`. Depois de alterar uma variável
`NEXT_PUBLIC_`, faça um novo deployment porque o Next.js incorpora seu valor no
build.

## Supabase Auth

Em **Authentication > URL Configuration**:

- use `https://pla-financeiro.vercel.app` como Site URL;
- mantenha somente os endereços necessários em Redirect URLs;
- inclua `https://pla-financeiro.vercel.app/**` para produção;
- mantenha `http://localhost:3000/**` apenas enquanto o ambiente local for usado.

Em **Authentication > Providers > Email**, confira a política de senha e a
decisão acadêmica sobre confirmação de e-mail descrita em
[`authentication.md`](authentication.md).

## Segurança HTTP

A aplicação envia:

- CSP completa com nonce novo por requisição;
- HSTS no domínio HTTPS;
- bloqueio de frames, MIME sniffing e permissões desnecessárias;
- política de referência restrita;
- ausência de `X-Powered-By`.

O nonce exige renderização dinâmica. Por isso o layout raiz chama
`connection()` e não deve voltar a ser estático sem revisar a CSP.

## Publicação

1. Execute `npm.cmd run test:all`, `npm.cmd run lint` e `npm.cmd run build`.
2. Envie a branch e aguarde o Preview Deployment da Vercel.
3. Confira os logs do build sem registrar valores de variáveis.
4. Execute o smoke HTTP contra a URL de preview.
5. Integre a branch aprovada na `main`.
6. Aguarde o Production Deployment e execute o smoke no domínio principal.

Exemplo:

```powershell
npm.cmd run test:http -- https://pla-financeiro.vercel.app
```

Depois confirme manualmente login, curso, progresso, chatbot e reabertura do
histórico. O teste HTTP não cria usuários nem armazena credenciais.

## Checklist da ETAPA 15

- [x] Projeto Vercel vinculado ao GitHub e à branch `main`.
- [x] Domínio principal definido.
- [x] Variáveis públicas e secretas classificadas sem valores no Git.
- [x] Build local aprovado com todas as rotas dinâmicas.
- [x] CSP com nonce validada no servidor local de produção.
- [x] Smoke HTTP local aprovado.
- [ ] Chave Groq anteriormente exposta confirmada como revogada e substituída.
- [ ] Preview ou produção desta branch publicado pela Vercel.
- [ ] Smoke HTTP aprovado após esse deployment.
- [ ] Fluxos autenticados essenciais confirmados após esse deployment.

## Rollback

Se o deployment falhar, preserve os logs, promova na Vercel o último deployment
aprovado e corrija o código em uma nova branch. No Git, reverta o commit por PR;
não reescreva o histórico compartilhado nem altere migrations já aplicadas.
