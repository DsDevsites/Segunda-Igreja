# Segunda Igreja Presbiteriana de Belo Horizonte

Site institucional em desenvolvimento para a Segunda Igreja Presbiteriana de Belo Horizonte.

## Stack

- React + TypeScript + Vite
- CSS responsivo com identidade visual branca, azul e dourada
- Supabase Auth planejado para login administrativo
- GitHub para versionamento
- Hospedagem a definir após os testes

## Executar localmente

Requisitos: Node.js LTS e npm.

```bash
npm install
npm run dev
```

## Verificar a versão de produção

```bash
npm run build
npm run preview
```

## Configurar o Supabase

1. Crie um projeto Supabase para a igreja.
2. Copie `.env.example` para `.env.local`.
3. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com a URL e a chave publicável/anon do projeto.
4. Reinicie o servidor de desenvolvimento.

Nunca coloque a chave `service_role` no frontend ou no GitHub. A conta administrativa deve receber a permissão no backend; não existe cadastro público de administradores.

## Situação atual

- Página inicial responsiva em protótipo.
- Rota `/admin` com interface de login.
- Cliente Supabase preparado, aguardando configuração do projeto.
- Após conectar o Supabase, será necessário autorizar a conta administrativa e testar o login.
- Dashboard de gestão de notícias, eventos, sermões e páginas ainda será implementado.
- Endereço, horários, contatos, redes sociais e materiais oficiais precisam ser confirmados pela igreja antes da publicação.

## Identidade visual provisória

- Azul institucional: `#183653`
- Dourado: `#B99A62`
- Branco: `#FFFFFF`
- Cinza suave: `#F5F7FA`

As cores devem ser confirmadas com a identidade oficial da igreja.