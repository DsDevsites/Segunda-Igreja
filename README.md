# Segunda Igreja Presbiteriana de Belo Horizonte

Site institucional em desenvolvimento, com página pública e painel administrativo conectado ao Supabase.

## Stack

- React + TypeScript + Vite
- CSS responsivo com identidade visual branca, azul-marinho e dourada
- Supabase Auth, Postgres e Row Level Security
- GitHub para versionamento
- Hospedagem a definir após os testes

## Executar localmente

Requisitos: Node.js LTS e npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Preencha `.env.local` com a URL e a chave publicável do seu projeto. Não adicione o arquivo `.env.local` ao Git.

## Configurar o Supabase

Variáveis necessárias:

- `VITE_SUPABASE_URL`: URL do projeto Supabase.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: chave publicável que começa com `sb_publishable_`. A variável legada `VITE_SUPABASE_ANON_KEY` também é aceita.

Nunca coloque a chave `service_role`, chaves secretas ou senha do banco no frontend ou no GitHub.

## Recursos implementados

- Página inicial responsiva.
- Leitura pública de horários, notícias, próximos eventos e último sermão publicados.
- Rota `/admin` com login via Supabase Auth.
- Painel de gestão para notícias, eventos, sermões, páginas, horários e configurações.
- Criação, edição, publicação/rascunho e exclusão de registros.
- Tabelas do banco com Row Level Security habilitado e políticas de leitura pública para conteúdo publicado.
- Verificação de build via GitHub Actions.

## Próximas etapas

1. Configurar as variáveis de ambiente no ambiente local ou na hospedagem.
2. Criar a conta do responsável pelo painel no Supabase Auth e atribuir o papel administrativo em `app_metadata.role = "admin"`.
3. Confirmar que o login, as políticas RLS e as operações CRUD funcionam.
4. Configurar armazenamento de imagens e upload direto pelo painel.
5. Preparar detalhes de páginas individuais e revisar conteúdo e imagens demonstrativos.
6. Confirmar endereço, horários, contatos, redes sociais e materiais oficiais antes da publicação.

## Identidade visual provisória

- Azul institucional: `#183653`
- Dourado: `#B99A62`
- Branco: `#FFFFFF`
- Cinza suave: `#F5F7FA`

As cores e todos os conteúdos de demonstração devem ser confirmados antes da publicação.
