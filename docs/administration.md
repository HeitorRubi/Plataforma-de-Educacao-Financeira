# Painel administrativo

## Escopo da ETAPA 8

A administração possui uma entrada central em `/admin` para acompanhar e acessar
o conteúdo educacional. O painel consolida:

- total de cursos e cursos publicados;
- total de módulos;
- aulas publicadas em relação ao total de aulas;
- total de fontes;
- quantidade de módulos, aulas e fontes por curso;
- acesso ao gerenciamento completo de cada curso.

As operações de criação, edição, publicação e ordenação continuam nas páginas
hierárquicas de cursos, módulos, aulas e fontes. O painel não duplica formulários
nem introduz exclusão física.

## Autorização

O segmento inteiro `/admin` é protegido por `src/app/admin/layout.tsx`, que exige
um perfil `ADMIN` antes de renderizar qualquer página administrativa. Consultas
e Server Actions continuam chamando `requireAdmin()` diretamente como proteção
adicional.

O cliente Supabase utilizado no servidor representa a sessão atual. Nenhuma
`service_role` é usada. Grants, policies RLS e funções `SECURITY INVOKER`
permanecem como barreira no PostgreSQL caso alguém tente chamar o banco fora da
interface.

## Validação

No SQL Editor do Supabase, execute:

```text
supabase/tests/admin_access_validation.sql
```

Resultado esperado:

```text
Success. No rows returned
```

O teste verifica RLS, políticas administrativas, ausência de políticas de
escrita para usuários comuns, privilégios das tabelas, ausência de `DELETE` e a
execução das funções administrativas sem elevação de privilégios.

Depois valide no navegador:

1. Entre com uma conta `ADMIN` e abra `/admin`.
2. Confirme os totais e acesse `Gerenciar conteúdo` em um curso.
3. Crie ou edite um item e confirme que o painel reflete a alteração.
4. Entre com uma conta `USER` e tente abrir `/admin` e `/admin/cursos`.
5. Confirme o redirecionamento para `/area-autenticada` e a ausência de controles
   administrativos.

O teste como `USER` é obrigatório porque esconder o link na interface não é uma
barreira de segurança.
