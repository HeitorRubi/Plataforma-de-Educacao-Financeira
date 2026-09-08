# Base de conhecimento

## Escopo da ETAPA 9

A base de conhecimento prepara o conteúdo editorial aprovado para a recuperação
da ETAPA 10. Nesta etapa não há chamada à OpenAI, embeddings, busca por pergunta,
geração de resposta ou interface de chatbot.

Um documento é elegível somente quando:

- o curso está publicado;
- a aula está publicada;
- o conteúdo da aula não está vazio.

Os módulos identificam a posição e o contexto da aula. As fontes cadastradas são
mantidas como dados estruturados, inclusive quando autor, URL ou ano não foram
informados.

## Estrutura

A migration `20260908000000_create_knowledge_documents_view.sql` cria a view
`public.knowledge_documents`. Cada linha representa uma aula elegível e contém:

- identificadores e títulos do curso, módulo e aula;
- posições do módulo e da aula;
- conteúdo Markdown da aula;
- data da última atualização;
- fontes agregadas em um array JSON ordenado.

A view consulta diretamente as tabelas editoriais. Publicar, despublicar ou
editar uma aula altera imediatamente a base, sem uma rotina de sincronização e
sem cópia persistida do conteúdo.

## Preparação dos trechos

`src/lib/knowledge/chunking.ts` divide o Markdown por blocos separados por linhas
em branco e combina os blocos até o limite de 1.200 caracteres. Blocos maiores
são divididos preferencialmente em quebras naturais de linha, frase ou palavra.

Os trechos são preparados no servidor e mantêm o vínculo com o documento e suas
fontes. Eles não são salvos no banco e ainda não recebem pontuação de relevância
ou embeddings.

## Segurança

- a view usa `security_invoker` e preserva o RLS das tabelas consultadas;
- `security_barrier` evita que filtros externos sejam antecipados ao filtro da
  própria view;
- `authenticated` possui somente `SELECT` na view;
- `anon` não possui acesso;
- `src/lib/knowledge/queries.ts` executa somente no servidor e exige sessão;
- `/admin/base-conhecimento` também é protegida pelo layout administrativo;
- nenhuma `service_role` ou chave da OpenAI é usada.

## Interface administrativa

A rota `/admin/base-conhecimento` apresenta:

- quantidade de cursos cobertos;
- aulas elegíveis;
- trechos preparados;
- fontes associadas;
- vínculo de cada documento com curso, módulo e aula.

A tela é somente de leitura. A publicação e a edição permanecem no gerenciamento
de conteúdo existente.

## Aplicação e validação

No SQL Editor do Supabase, execute primeiro:

```text
supabase/migrations/20260908000000_create_knowledge_documents_view.sql
```

Depois execute:

```text
supabase/tests/knowledge_base_validation.sql
```

Resultado esperado:

```text
Success. No rows returned
```

No navegador:

1. Entre como `ADMIN` e abra `/admin/base-conhecimento`.
2. Confirme que aparecem somente aulas publicadas de cursos publicados.
3. Compare os totais de documentos e fontes com o conteúdo administrativo.
4. Abra uma aula pelo vínculo apresentado.
5. Entre como `USER` e confirme que a rota administrativa redireciona para
   `/area-autenticada`.

Despublicar temporariamente uma aula deve removê-la da base. Ao publicá-la
novamente, ela deve reaparecer sem executar uma sincronização adicional.

## Validação registrada

Em 08/09/2026:

- a migration foi aplicada no Supabase compartilhado;
- o teste SQL terminou sem exceção;
- o painel exibiu 1 curso, 2 aulas, 2 trechos e 2 fontes;
- rascunhos não apareceram;
- o vínculo de aula funcionou;
- uma conta `USER` foi redirecionada para `/area-autenticada` ao tentar acessar
  a rota administrativa.
