# Aulas e fontes

A ETAPA 6 adiciona aulas textuais aos módulos. Cada aula pertence a um módulo,
possui ordem própria e começa como rascunho. Fontes e referências são registros
estruturados vinculados à aula.

## Fluxos

### Administração

```text
ADMIN abre um módulo
  ↓
CRIA ou EDITA uma aula
  ↓
REVISA conteúdo e fontes
  ↓
PUBLICA ou DESPUBLICA
  ↓
ORDENA aulas e fontes
```

### Usuário

```text
USER abre um curso publicado
  ↓
SELECIONA uma aula publicada
  ↓
LÊ conteúdo e fontes
  ↓
NAVEGA para aula anterior ou próxima
```

A ETAPA 6 não registra conclusão nem progresso.

## Rotas administrativas

```text
/admin/cursos/[id]/modulos/[moduleId]
/admin/cursos/[id]/modulos/[moduleId]/aulas/nova
/admin/cursos/[id]/modulos/[moduleId]/aulas/[lessonId]
/admin/cursos/[id]/modulos/[moduleId]/aulas/[lessonId]/editar
/admin/cursos/[id]/modulos/[moduleId]/aulas/[lessonId]/fontes/nova
/admin/cursos/[id]/modulos/[moduleId]/aulas/[lessonId]/fontes/[sourceId]/editar
```

## Rota pública

```text
/cursos/[id]/modulos/[moduleId]/aulas/[lessonId]
```

## Conteúdo em Markdown

O campo `lessons.content` armazena Markdown. A interface suporta parágrafos,
subtítulos, listas, links, citações, blocos de código e imagens por URL.

A renderização usa `react-markdown`. HTML bruto não é habilitado, e o projeto
não usa `dangerouslySetInnerHTML` para mostrar as aulas.

Exemplo claramente identificado como teste:

```markdown
## Subtítulo de teste

Parágrafo de teste.

- Item de teste 1
- Item de teste 2
```

## Publicação e navegação

- Uma aula publicada precisa possuir conteúdo não vazio.
- Usuários veem somente aulas publicadas de cursos publicados.
- Fontes herdam a visibilidade da aula.
- A navegação considera primeiro a posição do módulo e depois a posição da aula.
- Rascunhos não entram na navegação pública.

## Fontes

Cada fonte possui:

- título obrigatório;
- autor opcional;
- URL opcional, limitada a `http` ou `https`;
- ano de publicação opcional e com quatro dígitos;
- posição única dentro da aula.

Dados incompletos permanecem nulos. A aplicação não completa autor, ano ou URL
por suposição.

## Ordenação

As funções PostgreSQL executam criação e movimentação dentro de uma única
transação:

- `create_module_lesson`;
- `move_module_lesson`;
- `create_lesson_source`;
- `move_lesson_source`.

Todas usam `SECURITY INVOKER`, preservando os grants e as policies RLS da sessão.

## Segurança

- `ADMIN` pode consultar, criar, editar, ordenar e publicar aulas.
- `ADMIN` pode consultar, criar, editar e ordenar fontes.
- Usuário comum possui somente leitura do conteúdo publicado.
- `anon` não possui acesso.
- `DELETE` não é concedido à role `authenticated`.
- Todas as Server Actions administrativas verificam `ADMIN`.
- A hierarquia curso → módulo → aula é validada nas mutações.
- `lesson_progress` permanece sem acesso nesta etapa.

## Aplicação no Supabase

No SQL Editor, execute uma única vez o conteúdo completo de:

```text
supabase/migrations/20260903000000_configure_lesson_access.sql
```

Depois execute o conteúdo completo de:

```text
supabase/tests/lesson_access_validation.sql
```

O teste deve terminar sem exceção e emitir o aviso:

```text
Acesso, publicação e ordenação de aulas validados com sucesso.
```

## Validação realizada

Em 03/09/2026, foram registrados os seguintes resultados reais:

- migration e teste SQL aprovados no Supabase, conforme confirmação do usuário;
- criação e publicação de duas aulas como `ADMIN`;
- criação e reordenação de duas fontes de teste;
- conteúdo Markdown, lista e fontes exibidos para `USER`;
- aula não publicada ausente do catálogo do usuário;
- navegação da Aula 1 para a Aula 2 e retorno para a Aula 1;
- Server Actions executadas sem erro nos logs do Next.js;
- `npm.cmd run lint` e `npm.cmd run build` aprovados.

## Referências técnicas

- React Markdown: https://github.com/remarkjs/react-markdown
- Supabase — Row Level Security:
  https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase — Database Functions:
  https://supabase.com/docs/guides/database/functions
