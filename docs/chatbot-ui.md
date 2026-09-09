# Interface do chatbot

## Escopo da ETAPA 11

A ETAPA 11 disponibiliza a rota autenticada `/chat` para consultar o backend RAG
integrado na ETAPA 10. A página envia a pergunta para `POST /api/chat` e apresenta
a resposta educacional, o estado retornado e as referências rastreáveis.

Não foi criada migration. A interface não salva perguntas, respostas ou sessões
no banco nem no navegador. Somente a consulta atual permanece no estado do
componente enquanto a página estiver aberta.

## Fluxo

```text
USUÁRIO AUTENTICADO
        ↓
FORMULÁRIO EM /CHAT
        ↓
POST /API/CHAT
        ↓
RESPOSTA + ESTADO + REFERÊNCIAS
        ↓
VÍNCULO PARA AULA E FONTE
```

## Componentes

- `src/app/chat/page.tsx`: protege a rota com `requireUser()` e monta a página;
- `src/components/chat/chat-interface.tsx`: controla a pergunta e os estados da
  consulta no navegador;
- `src/components/auth/authenticated-header.tsx`: oferece acesso permanente ao
  assistente para usuários autenticados;
- `src/app/area-autenticada/page.tsx`: oferece acesso direto após o login.

O componente cliente importa apenas o contrato tipado do RAG. A consulta à base,
a chave da Groq e a chamada ao provedor permanecem exclusivamente no servidor.

## Estados da interface

- inicial, sem consulta realizada;
- pergunta inválida ou curta;
- consulta em andamento;
- falha de rede ou resposta inválida;
- resposta fundamentada com referências;
- contexto insuficiente;
- solicitação de aconselhamento personalizado limitada.

## Validação manual

1. Faça login e acesse `/chat` pelo cabeçalho ou pela área autenticada.
2. Envie uma pergunta coberta por uma aula publicada.
3. Confirme a resposta fundamentada e os vínculos para aula e fontes.
4. Envie uma pergunta fora da base e confirme `Contexto insuficiente`.
5. Peça uma recomendação individual de compra e confirme `Solicitação limitada`.
6. Atualize a página e confirme que a consulta anterior não reaparece.

## Validações automatizadas

```powershell
npm.cmd run lint
npm.cmd run build
```

Em 09/09/2026, lint e build foram aprovados, incluindo a rota dinâmica `/chat`.
No navegador autenticado, a pergunta coberta exibiu resposta fundamentada com
duas referências, a pergunta fora da base exibiu contexto insuficiente e o
pedido de recomendação personalizada exibiu solicitação limitada. Todas as
consultas responderam HTTP 200 sem erro no servidor. A abertura dos vínculos e o
descarte da consulta após atualizar a página também foram aprovados.
