# Plataforma de Educação Financeira

Plataforma web gratuita para cursos de educação financeira, com administração
de conteúdo, acompanhamento de progresso e assistente educacional fundamentado
na base publicada.

Produção: [https://pla-financeiro.vercel.app](https://pla-financeiro.vercel.app)

## Funcionalidades

- cadastro, login, perfil e controle de acesso `USER`/`ADMIN`;
- cursos, módulos, aulas em Markdown e fontes;
- publicação, ordenação e painel administrativo;
- progresso individual persistente;
- chatbot RAG com Groq, referências e histórico privado;
- PostgreSQL no Supabase com RLS e privilégios mínimos.

## Tecnologias

- TypeScript, Next.js, React e Tailwind CSS;
- PostgreSQL, Supabase Auth e Supabase SSR;
- Groq API;
- Vercel e GitHub.

## Ambiente local

Instale as dependências:

```powershell
npm.cmd install
```

Crie `.env.local` a partir de `.env.example` e configure:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
GROQ_API_KEY
GROQ_MODEL
```

Nunca use `service_role` na aplicação nem versione chaves reais.

Inicie o servidor:

```powershell
npm.cmd run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Verificações

```powershell
npm.cmd run test:all
npm.cmd run lint
npm.cmd run build
```

Com o build iniciado por `npm.cmd run start`, execute:

```powershell
npm.cmd run test:http
```

O processo de publicação e a configuração dos serviços estão documentados em
[`docs/deployment.md`](docs/deployment.md).

No PowerShell deste computador, utiliza-se `npm.cmd` porque a política de
execução do Windows pode bloquear o script `npm.ps1` chamado por `npm`.
