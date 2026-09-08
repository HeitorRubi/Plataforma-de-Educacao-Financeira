# CHECKPOINT 1 — Plataforma educacional

## Objetivo

Validar a plataforma educacional completa antes de liberar as etapas de IA. O
checkpoint não adiciona funcionalidades: ele comprova que autenticação,
administração, catálogo, aulas e progresso funcionam juntos na `main` integrada.

## Pré-condições

- migrations das etapas 2 a 7 aplicadas no Supabase;
- testes SQL das etapas 2 a 8 aprovados;
- confirmação de e-mail desativada para o projeto acadêmico;
- uma conta com perfil `ADMIN`;
- um e-mail ainda não cadastrado para criar a conta `USER` do teste;
- servidor local iniciado com `npm.cmd run dev`.

Não registrar senhas, tokens ou chaves nos documentos ou nas evidências.

## Fluxo administrativo

Use nomes claramente identificados como dados de teste.

- [x] Entrar com uma conta `ADMIN`.
- [x] Abrir `/admin` e criar um curso de teste.
- [x] Criar dois módulos no curso.
- [x] Alterar a ordem dos módulos e confirmar a ordem persistida.
- [x] Criar duas aulas com conteúdo textual em Markdown.
- [x] Alterar a ordem das aulas e confirmar a ordem persistida.
- [x] Criar uma fonte com dados reais de uma referência conhecida ou com rótulo
  explícito de teste, sem inventar dados bibliográficos.
- [x] Publicar as duas aulas.
- [x] Publicar o curso.
- [x] Retornar ao painel e confirmar que os totais foram atualizados.
- [x] Sair da conta `ADMIN`.

## Fluxo do usuário

- [x] Criar uma nova conta pela rota `/cadastro`.
- [x] Confirmar o redirecionamento para `/area-autenticada` após o cadastro.
- [x] Abrir o catálogo e localizar somente o curso publicado.
- [x] Confirmar que cursos em rascunho não aparecem.
- [x] Abrir o curso e conferir módulos e aulas na ordem administrativa.
- [x] Ler a primeira aula e conferir Markdown e fonte.
- [x] Usar a navegação para avançar à próxima aula.
- [x] Concluir a primeira aula e confirmar progresso parcial.
- [x] Concluir a segunda aula e confirmar `100%`.
- [x] Sair e entrar novamente com a mesma conta.
- [x] Confirmar que as duas conclusões e o percentual continuam salvos.
- [x] Tentar abrir `/admin` e `/admin/cursos` diretamente.
- [x] Confirmar o redirecionamento para `/area-autenticada`.

## Isolamento

- [x] Entrar com outra conta que não concluiu as aulas.
- [x] Confirmar que o curso inicia com `0%` para essa conta.
- [x] Confirmar que não há acesso ao progresso da primeira conta.

## Verificações locais

```powershell
npm.cmd run lint
npm.cmd run build
git diff --check
```

Também verificar sem sessão:

```powershell
curl.exe -sS -I --max-redirs 0 http://localhost:3000/cursos
curl.exe -sS -I --max-redirs 0 http://localhost:3000/admin
```

`/admin` deve responder com redirecionamento HTTP para `/login`. Como `/cursos`
possui uma interface de carregamento com streaming, ela pode responder `200` com
`NEXT_REDIRECT` e uma atualização automática para `/login` no corpo. Em ambos os
casos, o navegador deve terminar na página de login sem exibir dados protegidos.

## Critério de aprovação

O CHECKPOINT 1 foi aprovado em 08/09/2026. Os fluxos `ADMIN`, `USER`, de
persistência do progresso, isolamento entre contas e bloqueio administrativo
foram confirmados pelo desenvolvedor principal. As verificações locais também
terminaram sem erro.

A ETAPA 9 só deve ser iniciada depois da integração desta documentação e de
autorização explícita do desenvolvedor principal.
