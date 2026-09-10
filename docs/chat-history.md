# Histórico do chatbot

## Escopo da ETAPA 12

A ETAPA 12 persiste as conversas do assistente para cada usuário autenticado.
Uma conversa contém pares ordenados de pergunta e resposta, incluindo o estado
do RAG e as referências exibidas no momento da resposta.

O histórico é privado. Não existe listagem administrativa global, exclusão,
edição, renomeação, exportação ou compartilhamento de conversas nesta etapa.
As perguntas continuam independentes para recuperação: mensagens anteriores não
são enviadas à Groq como contexto adicional.

## Modelo persistido

```text
profiles (1) ─── (N) chat_sessions
chat_sessions (1) ─── (N) chat_messages
```

`chat_sessions` mantém o proprietário, um título derivado da primeira pergunta
e as datas de criação e atividade. `chat_messages` mantém o papel `USER` ou
`ASSISTANT`, conteúdo, posição e data. Mensagens do assistente também guardam o
estado `answered`, `insufficient_context` ou `restricted` e uma cópia JSON das
referências retornadas pelo RAG.

A função `append_chat_exchange` grava a pergunta e a resposta na mesma
transação. Ela usa `SECURITY INVOKER`, valida `auth.uid()`, bloqueia a sessão
durante o cálculo das próximas posições e retorna `null` quando a sessão
informada não pertence ao usuário atual.

## Autorização

- `anon` não possui acesso às tabelas nem à função;
- `authenticated` consulta e cria somente as próprias sessões;
- `authenticated` consulta e insere mensagens somente em sessões próprias;
- apenas `updated_at` pode ser atualizado em uma sessão;
- mensagens não possuem `UPDATE` ou `DELETE` para `authenticated`;
- todas as consultas da aplicação usam o cliente SSR e a sessão do usuário;
- a aplicação não usa nem expõe `service_role`.

O endpoint verifica a sessão solicitada antes de chamar a Groq. O RLS e a RPC
repetem a verificação no banco, portanto conhecer o UUID de outra conversa não
concede leitura nem escrita.

## Contratos HTTP

Para criar uma conversa:

```json
{
  "question": "O que a aula explica sobre ações?",
  "sessionId": null
}
```

Para continuar uma conversa, `sessionId` recebe o UUID retornado anteriormente.
Uma resposta bem-sucedida mantém `answer`, `status` e `references` e acrescenta
`session`, com o resumo e todas as mensagens ordenadas da conversa.

O histórico de uma conversa é carregado por:

```http
GET /api/chat/sessions/{id}
```

O endpoint retorna `401` sem autenticação, `400` para UUID inválido, `404` para
uma sessão inexistente ou pertencente a outro usuário e `500` para falha de
persistência. Todas as respostas usam `Cache-Control: no-store`.

## Aplicação e teste SQL

No SQL Editor do Supabase compartilhado, execute nesta ordem:

1. `supabase/migrations/20260910000000_create_chat_history.sql`;
2. `supabase/tests/chat_history_validation.sql`.

O teste estrutural deve terminar com:

```text
Estrutura, privilégios e RLS do histórico validados com sucesso.
```

A migration deve ser executada uma única vez. O arquivo de teste pode ser
executado novamente e não cria dados.

## Validação manual

1. Entre com o usuário A e acesse `/chat`.
2. Crie uma conversa com uma pergunta coberta e envie uma segunda pergunta na
   mesma conversa.
3. Atualize a página, reabra a conversa e confira quatro mensagens na ordem.
4. Saia, entre novamente com o usuário A e confirme que a conversa permanece.
5. Entre com o usuário B e confirme que a conversa do usuário A não aparece.
6. Volte ao usuário A e valide respostas `insufficient_context` e `restricted`.
7. Confirme que referências e vínculos continuam funcionando após reabrir o
   histórico.

Validações locais da aplicação:

```powershell
npm.cmd run test:rag
npm.cmd run lint
npm.cmd run build
git diff --check
```

## Validação registrada

Em 10/09/2026, o desenvolvedor principal confirmou a aplicação da migration e a
aprovação do teste SQL. No navegador, criação, troca e reabertura de conversas
preservaram as mensagens. Uma segunda conta não visualizou o histórico da
primeira. Os endpoints autenticados responderam HTTP 200 sem erro no servidor,
enquanto os acessos sem sessão foram bloqueados.
