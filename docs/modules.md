# Módulos

A ETAPA 5 organiza módulos dentro dos cursos existentes. Cada módulo pertence a
um único curso e possui uma posição positiva e única nesse curso.

## Fluxos

### Administração

```text
ADMIN abre um curso
  ↓
LISTA os módulos em ordem
  ↓
CRIA ou EDITA um módulo
  ↓
MOVE para cima ou para baixo
```

### Usuário

```text
USER abre um curso publicado
  ↓
VISUALIZA os módulos na ordem definida
```

A ETAPA 5 não cria aulas nem permite abrir conteúdo de aula.

A partir da ETAPA 6, a administração de cada módulo possui uma página própria
para listar e gerenciar suas aulas. Essa extensão não altera o contrato do
módulo.

## Rotas

```text
/admin/cursos/[id]                                  lista módulos do curso
/admin/cursos/[id]/modulos/novo                     cria módulo
/admin/cursos/[id]/modulos/[moduleId]/editar        edita módulo
/cursos/[id]                                        mostra módulos do curso publicado
/admin/cursos/[id]/modulos/[moduleId]               gerencia aulas do módulo
```

## Ordenação

A restrição `modules_course_position_unique` impede duas posições iguais no
mesmo curso. Por isso, a aplicação não troca posições com requisições separadas.

As funções PostgreSQL executam cada operação em uma única transação:

- `create_course_module`: bloqueia o curso e atribui a próxima posição;
- `move_course_module`: bloqueia o curso e troca a posição com o módulo vizinho.

As funções são `SECURITY INVOKER`: usam as permissões e policies RLS da sessão
autenticada. Elas não usam `service_role` e não ignoram o RLS.

## Segurança

- `ADMIN` pode consultar, criar, editar e ordenar módulos.
- Usuários autenticados consultam somente módulos cujo curso está publicado.
- `anon` não possui acesso.
- `DELETE` não é concedido à role `authenticated`.
- Todas as Server Actions verificam `ADMIN` novamente no servidor.
- A relação entre curso e módulo é validada nas consultas e mutações.

Módulos não possuem publicação independente no schema atual. A visibilidade é
herdada do curso: ao publicar o curso, sua estrutura de módulos fica visível.

## Aplicação no Supabase

No SQL Editor, execute uma única vez o conteúdo completo de:

```text
supabase/migrations/20260902000000_configure_module_access.sql
```

Depois execute o conteúdo completo de:

```text
supabase/tests/module_access_validation.sql
```

O teste deve terminar sem exceção e emitir o aviso:

```text
Acesso e ordenação de módulos validados com sucesso.
```

## Dados de teste

Use nomes que identifiquem claramente os registros temporários:

```text
Módulo 1 de Teste
Módulo 2 de Teste
```

## Validação realizada

Em 02/09/2026, a migration e o teste SQL foram informados pelo usuário como
executados corretamente no Supabase compartilhado. O fluxo manual também foi
validado:

- `ADMIN` criou dois módulos;
- `ADMIN` editou um módulo;
- `ADMIN` alterou a ordem;
- a ordem permaneceu consistente na administração;
- `USER` visualizou os módulos na mesma ordem no curso publicado;
- a interface do usuário não apresentou controles administrativos.

## Referências técnicas

- Supabase — Row Level Security:
  https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase — Database Functions:
  https://supabase.com/docs/guides/database/functions
