# Supabase + GitHub

Este projeto usa **PostgreSQL no Supabase** via Prisma. A área do aluno não depende do Supabase diretamente no frontend — só o banco na nuvem.

---

## 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto.
2. Anote a **senha do banco** (Database password).

---

## 2. Obter as URLs de conexão

No Supabase: **Project Settings → Database → Connection string**

| Variável | Modo | Porta | Uso |
|----------|------|-------|-----|
| `DATABASE_URL` | **Transaction** (pooler) | 6543 | App em produção / `npm run dev` |
| `DIRECT_URL` | **Session** ou Direct | 5432 | `prisma migrate` |

Substitua `[YOUR-PASSWORD]` pela senha do banco.

Exemplo `.env` local:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gere-um-secret-longo-aqui

DATABASE_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

> Use `openssl rand -base64 32` para gerar o `NEXTAUTH_SECRET`.

---

## 3. Aplicar schema e popular dados

```bash
cp .env.example .env
# Edite .env com suas URLs do Supabase

npm install
npm run db:migrate    # cria tabelas no Supabase
npm run db:seed       # usuários e curso base
npm run dev
```

Na primeira visita ao `/dashboard`, o app também cria os cursos **Expert** (Chin Filler, Botulinum Toxin, etc.) automaticamente.

**Login de teste:**
- Email: qualquer
- Senha: `1234567`

---

## 4. Deploy (Vercel)

1. Conecte o repositório GitHub ao Vercel.
2. Em **Environment Variables**, adicione:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_URL` (ex: `https://seu-dominio.vercel.app`)
   - `NEXTAUTH_SECRET`
3. Deploy. O build roda `prisma migrate deploy` automaticamente.

---

## 5. GitHub

Repositório: `https://github.com/luann203/areademembros`

```bash
git add .
git commit -m "feat: Supabase PostgreSQL + área do aluno"
git push origin main
```

**Nunca commite** o arquivo `.env` (já está no `.gitignore`).

---

## Comandos úteis

| Comando | Descrição |
|---------|-----------|
| `npm run db:migrate` | Aplica migrations no banco |
| `npm run db:seed` | Popula dados iniciais |
| `npm run db:setup` | migrate + seed |
| `npm run db:studio` | Prisma Studio (visualizar banco) |
