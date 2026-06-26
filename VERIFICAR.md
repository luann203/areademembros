# Verificação Rápida

## ✅ Checklist antes de rodar

1. **Dependências instaladas?**
   ```bash
   ls node_modules
   ```
   Se não existir, rode: `npm install`

2. **Arquivo .env existe?**
   ```bash
   ls .env
   ```
   Se não existir, crie com:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=desenvolvimento-secret-key-change-in-production-123456789
   DATABASE_URL="file:./prisma/dev.db"
   ```

3. **Banco de dados criado?**
   ```bash
   ls prisma/dev.db
   ```
   Se não existir, rode:
   ```bash
   npm run db:push
   npm run db:generate
   npm run db:seed
   ```

## 🚀 Iniciar o servidor

```bash
npm run dev
```

O servidor deve iniciar em `http://localhost:3000`

## 🔍 Se não funcionar

1. Verifique se a porta 3000 está livre:
   ```bash
   lsof -i :3000
   ```

2. Verifique os erros no terminal onde rodou `npm run dev`

3. Tente limpar o cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

4. Verifique se todas as dependências estão instaladas:
   ```bash
   npm install
   ```

## 📧 Credenciais de Login

- **Aluno**: `aluno@example.com` / `aluno123`
- **Admin**: `admin@example.com` / `admin123`
