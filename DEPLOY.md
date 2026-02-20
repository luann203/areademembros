# Deploy no Vercel (e por que não funciona igual ao localhost)

No **localhost** o app usa um banco de dados (antes SQLite em `prisma/dev.db`). No **Vercel** não existe esse arquivo: cada deploy roda em um servidor efêmero, então o banco tem que ser na nuvem.

O projeto está configurado para usar **Postgres** com a variável **`DATABASE_URL`**. Assim funciona igual no seu PC e no Vercel.

---

## 1. Criar o banco no Vercel

1. No [Vercel](https://vercel.com), abra o projeto.
2. Vá em **Storage** → **Create Database** → escolha **Postgres**.
3. Conecte o banco ao projeto (ele cria a variável `DATABASE_URL` automaticamente).
4. Faça um novo **deploy** (push no GitHub ou “Redeploy” no Vercel).

O build já roda `prisma migrate deploy` quando `DATABASE_URL` existe, então as tabelas são criadas no primeiro deploy com o banco ligado.

---

## 2. Popular o banco (cursos e usuários)

O Postgres do Vercel começa vazio. Faça no seu PC, **uma vez**:

1. No Vercel: **Storage** → clique no banco → **.env** ou **Variables** e copie a **`DATABASE_URL`**.
2. No seu projeto, no `.env`, coloque:
   ```bash
   DATABASE_URL="postgresql://..."   # a URL que você copiou
   ```
3. No terminal, rode **um comando só** (cria tabelas + cursos + usuário de teste):
   ```bash
   npm run db:setup
   ```
4. Depois, faça um novo deploy (push no GitHub ou **Redeploy** no Vercel).

**Login para testar:** no site em produção, entre com:
- **Email:** `aluno@example.com`
- **Senha:** `1234567`

Esse usuário já vem inscrito nos cursos que o seed criou. Qualquer outro email com senha `1234567` também funciona; na primeira vez o app cria o usuário no banco (e você pode inscrevê-lo em cursos depois pelo Prisma Studio, se quiser).

---

## 3. Localhost de novo (com Postgres)

O schema agora é **só Postgres**. Para desenvolver no PC:

1. Tenha um Postgres (Docker, instalado, ou [Neon](https://neon.tech) / [Supabase](https://supabase.com) grátis).
2. No `.env`:
   ```bash
   DATABASE_URL="postgresql://usuario:senha@host:5432/nome_do_banco"
   ```
3. Primeira vez:
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```
4. Subir o app:
   ```bash
   npm run dev
   ```

---

## Resumo

| Onde      | Banco              | O que fazer |
|----------|--------------------|-------------|
| Localhost | Postgres (seu PC ou Neon/Supabase) | `DATABASE_URL` no `.env`, `migrate deploy`, `db:seed` |
| Vercel   | Postgres (Vercel Storage)          | Criar Postgres no Storage, conectar ao projeto, redeploy; depois rodar seed (com a URL do Vercel) no PC ou por script |

Quando `DATABASE_URL` estiver definida no Vercel e o banco estiver populado (seed + usuário/matrícula), o app no deploy vai se comportar como no localhost: login, cursos e aulas funcionando.
