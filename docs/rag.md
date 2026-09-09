# RAG e Groq

## Escopo da ETAPA 10

A ETAPA 10 implementa o backend autenticado que recupera trechos da base de
conhecimento e gera respostas educacionais pela Groq. A interface e o
histórico do chatbot permanecem reservados, respectivamente, às ETAPAS 11 e 12.

Não foi criada migration nesta etapa. A recuperação lê a view
`public.knowledge_documents` integrada na ETAPA 9 sob a sessão e o RLS já
existentes.

## Fluxo

```text
POST /api/chat autenticado
        ↓
validação da pergunta
        ↓
guardrail de aconselhamento personalizado
        ↓
recuperação lexical de até 4 trechos publicados
        ↓
Groq Chat Completions no servidor
        ↓
resposta educacional + referências rastreáveis
```

Perguntas sem contexto suficiente e pedidos de recomendação financeira
personalizada recebem uma resposta controlada sem chamada à Groq.

## Recuperação

`src/lib/rag/retrieval.ts` normaliza acentos, remove palavras funcionais comuns
e pontua correspondências nos títulos e no conteúdo dos trechos. A busca é
determinística e retorna no máximo quatro resultados.

Esta escolha atende à base pequena do MVP sem criar embeddings ou uma cópia do
conteúdo. A resposta inclui, para cada trecho enviado ao modelo:

- número da citação;
- curso, módulo e aula;
- URL interna da aula;
- fontes estruturadas cadastradas.

## Groq

`src/lib/rag/groq.ts` usa o SDK oficial e a Chat Completions API. A chamada:

- ocorre somente em módulo `server-only`;
- usa `GROQ_API_KEY` sem o prefixo público do Next.js;
- permite configurar o modelo por `GROQ_MODEL`;
- usa o modelo de produção `openai/gpt-oss-20b` como padrão de baixo custo;
- usa esforço de raciocínio baixo;
- limita a conclusão a 1.200 tokens;
- define timeout de 30 segundos e uma repetição;
- não habilita ferramentas, pesquisa web ou execução de código.

O prompt manda usar apenas o contexto recuperado, ignorar instruções contidas
nele, reconhecer informação insuficiente, não inventar fontes e não fazer
recomendações individualizadas de compra ou venda.

## Contrato HTTP

Requisição:

```http
POST /api/chat
Content-Type: application/json

{"question":"O que a aula explica sobre ações?"}
```

A pergunta deve ter entre 3 e 500 caracteres. O corpo completo é limitado a
2.000 caracteres.

Resposta bem-sucedida:

```json
{
  "answer": "Resposta educacional com citação [1].",
  "status": "answered",
  "references": [
    {
      "citationNumber": 1,
      "chunkId": "lesson-id:1",
      "chunkPosition": 1,
      "courseId": "course-id",
      "courseTitle": "Curso",
      "moduleId": "module-id",
      "moduleTitle": "Módulo",
      "lessonId": "lesson-id",
      "lessonTitle": "Aula",
      "lessonUrl": "/cursos/course-id/modulos/module-id/aulas/lesson-id",
      "sources": []
    }
  ]
}
```

Valores possíveis de `status`:

- `answered`: resposta gerada a partir de trechos recuperados;
- `insufficient_context`: a base não sustentou a pergunta;
- `restricted`: pedido de recomendação financeira personalizada bloqueado.

Erros relevantes:

- `400`: JSON ou pergunta inválida;
- `401`: sessão ausente;
- `413`: corpo acima do limite;
- `415`: formato diferente de JSON;
- `502`: falha temporária no provedor;
- `503`: Groq ainda não configurada no servidor.

Todas as respostas usam `Cache-Control: no-store`.

## Configuração local

Crie uma chave nova na conta Groq e configure somente em `.env.local`, sem registrar
o valor em arquivos versionados ou mensagens:

```text
GROQ_API_KEY=sua_chave_real
GROQ_MODEL=openai/gpt-oss-20b
```

Reinicie `npm.cmd run dev` depois de alterar o ambiente.

## Validação

Validações automatizadas:

```powershell
npm.cmd run test:rag
npm.cmd run lint
npm.cmd run build
```

Para testar a API antes da interface da ETAPA 11, faça login, abra o console do
navegador e execute:

```javascript
await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    question: "O que o conteúdo da AULA 1 TESTE apresenta?",
  }),
}).then(async (response) => ({
  status: response.status,
  body: await response.json(),
}));
```

Confirme que uma pergunta relacionada retorna `answered` com referências, uma
pergunta fora da base retorna `insufficient_context` e um pedido individual de
compra ou venda retorna `restricted`.

## Validação registrada

Em 09/09/2026:

- `npm.cmd run test:rag`, lint e build foram aprovados;
- requisição sem sessão retornou HTTP 401 e resposta sem cache;
- pergunta coberta retornou HTTP 200, `answered` e duas referências;
- pergunta fora da base retornou `insufficient_context`;
- pedido de recomendação personalizada retornou `restricted`;
- a chave da Groq permaneceu somente no `.env.local` ignorado pelo Git;
- nenhuma pergunta, resposta ou sessão de chat foi persistida.
