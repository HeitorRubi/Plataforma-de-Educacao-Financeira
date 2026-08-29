# Especificação do Projeto

## Produto

Plataforma Gratuita de Educação Financeira, inicialmente focada em educação financeira e renda variável.

O sistema deverá permitir aprendizado por cursos e disponibilizar, posteriormente, um assistente de IA baseado nos conteúdos aprovados da própria plataforma.

## Stack definida

| Parte | Tecnologia |
|---|---|
| Linguagem | TypeScript |
| Framework | Next.js |
| Interface | React |
| CSS | Tailwind CSS |
| Backend | Next.js |
| Banco | PostgreSQL |
| Banco/Auth | Supabase |
| IA | OpenAI API |
| Chatbot | RAG / recuperação de conteúdo |
| Versionamento | Git |
| Repositório | GitHub |

Trocas de tecnologia exigem autorização explícita.

## MVP — usuário

- cadastro;
- login;
- logout;
- sessão;
- perfil;
- acesso a cursos;
- acesso a módulos;
- leitura de aulas textuais;
- conclusão de aulas;
- acompanhamento de progresso;
- uso do chatbot educacional.

## MVP — administrador

- autenticação;
- criação e edição de cursos;
- publicação/despublicação de cursos;
- criação e edição de módulos;
- ordenação de módulos;
- criação e edição de aulas;
- publicação/despublicação de aulas;
- ordenação de aulas;
- gerenciamento das fontes dos conteúdos.

Permissões administrativas devem ser protegidas no servidor/banco, não somente por elementos visuais.

## MVP — chatbot

O chatbot deverá:

- receber perguntas;
- priorizar conteúdos da própria plataforma;
- recuperar trechos relevantes;
- responder de forma educacional;
- indicar conteúdo/fonte relacionada quando disponível;
- reconhecer falta de informação;
- evitar alucinações;
- não inventar fontes, autores, páginas ou dados;
- não atuar como consultor financeiro;
- não fornecer recomendações individualizadas de compra ou venda.

A chave da OpenAI nunca pode ser exposta no frontend.

## Fora do escopo atual

Não implementar no MVP atual:

- carteira de ações;
- cotações;
- integração com B3;
- ranking de ações;
- preço-teto;
- fluxo de caixa descontado;
- valuation;
- rede social;
- aplicativo mobile;
- vídeos;
- certificados;
- gamificação avançada;
- pagamentos;
- assinatura premium.

## Arquitetura

Fluxo principal:

```text
React / Next.js
      ↓
Next.js server
      ↓
Regras da aplicação
      ↓
Supabase Auth + PostgreSQL
```

Fluxo futuro do chatbot:

```text
Usuário
  ↓
Interface do chat
  ↓
Next.js server
  ↓
Recuperação de conteúdo
  ↓
OpenAI API
  ↓
Resposta
```

Evitar arquitetura distribuída ou complexidade sem necessidade comprovada.

## Conteúdo educacional

O desenvolvimento fornece os recursos técnicos para armazenar, organizar e apresentar conteúdo.

Não inserir automaticamente textos de livros nem completar referências bibliográficas por suposição.

Dados de teste são permitidos somente quando claramente identificados como teste.

## Segurança

Princípios mínimos:

- cada usuário acessa apenas os próprios dados privados;
- `USER` não pode executar operações administrativas;
- segredos ficam fora do frontend e do Git;
- entradas devem ser validadas;
- RLS deve ser utilizada onde aplicável;
- decisões temporárias de ambiente acadêmico devem ser registradas para revisão antes de produção.

## Qualidade e TG

O código precisa ser simples o suficiente para que o grupo consiga compreendê-lo e explicá-lo durante a apresentação do Trabalho de Graduação.

Decisões técnicas relevantes devem registrar:

```text
DECISÃO:
...

MOTIVO:
...

ALTERNATIVAS CONSIDERADAS:
...

JUSTIFICATIVA:
...
```
