# Progresso das aulas

A ETAPA 7 permite que cada usuário marque aulas publicadas como concluídas e
acompanhe seu avanço em cada curso.

## Fluxo

```text
USER abre uma aula publicada
  ↓
CLICA em Concluir aula
  ↓
NEXT.JS valida sessão, curso, módulo e aula
  ↓
SUPABASE insere em lesson_progress
  ↓
CURSO atualiza quantidade e percentual
```

Após logout e novo login, o registro continua no PostgreSQL e é carregado para
o mesmo usuário.

## Cálculo

O total considera somente aulas publicadas do curso publicado:

```text
percentual = aulas concluídas / aulas publicadas × 100
```

O resultado é arredondado para o inteiro mais próximo. Quando não existem aulas
publicadas, o percentual é `0%`.

Exemplo matemático:

```text
7 aulas concluídas / 10 aulas publicadas = 70%
```

## Interface

Na página do curso:

- quantidade de aulas concluídas;
- quantidade total de aulas publicadas;
- percentual e barra de progresso;
- estado `Concluída` ou `Pendente` em cada aula.

Na página da aula:

- botão `Concluir aula` quando ainda estiver pendente;
- estado `Aula concluída` depois da persistência.

A ETAPA 7 não permite remover uma conclusão e não cria relatórios
administrativos.

## Segurança

- A Server Action obtém `user_id` da sessão autenticada.
- O navegador envia somente os identificadores de curso, módulo e aula.
- A relação curso → módulo → aula é validada novamente no servidor.
- O RLS permite que o usuário consulte somente o próprio progresso.
- O RLS permite inserir somente com `user_id = auth.uid()`.
- Apenas aulas publicadas de cursos publicados podem ser concluídas.
- `anon` não possui acesso.
- `UPDATE` e `DELETE` não são concedidos nesta etapa.
- A chave primária `(user_id, lesson_id)` impede duplicidade.

## Aplicação no Supabase

No SQL Editor, execute uma única vez o conteúdo completo de:

```text
supabase/migrations/20260904000000_configure_lesson_progress.sql
```

Depois execute o conteúdo completo de:

```text
supabase/tests/lesson_progress_validation.sql
```

O teste deve terminar sem exceção e emitir:

```text
Acesso e estrutura de progresso validados com sucesso.
```

## Teste manual esperado

1. Entrar como `USER` e abrir um curso com duas aulas publicadas.
2. Confirmar que ambas começam como `Pendente` e o curso mostra `0%`.
3. Abrir a primeira aula e clicar em `Concluir aula`.
4. Voltar ao curso e confirmar `1 de 2 aulas concluídas` e `50%`.
5. Sair e entrar novamente com a mesma conta.
6. Confirmar que a primeira aula continua concluída e o percentual continua `50%`.
7. Concluir a segunda aula e confirmar `2 de 2` e `100%`.
8. Entrar com outro `USER` e confirmar que o progresso é independente.

## Validação realizada

Em 04/09/2026, foram registrados os seguintes resultados reais:

- migration aplicada e teste SQL concluído sem exceção no Supabase;
- primeira aula concluída, resultando em `1 de 2` e `50%`;
- logout e novo login mantendo a primeira conclusão;
- segunda aula concluída, resultando em `2 de 2` e `100%`;
- conta `ADMIN` consultou o mesmo curso com `0 de 2` e `0%`;
- ações e leituras executadas sem erro nos logs do Next.js.
