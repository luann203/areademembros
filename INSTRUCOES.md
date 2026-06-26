# Instruções de Instalação e Uso

## 🚀 Passo a Passo para Começar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu-secret-key-aqui-gere-um-valor-aleatorio
DATABASE_URL="file:./prisma/dev.db"
```

**Para gerar um NEXTAUTH_SECRET**, você pode usar:
```bash
openssl rand -base64 32
```

### 3. Configurar Banco de Dados
```bash
# Criar o banco de dados
npm run db:push

# Gerar o cliente Prisma
npm run db:generate

# Popular com dados de exemplo
npm run db:seed
```

### 4. Iniciar o Servidor
```bash
npm run dev
```

### 5. Acessar a Aplicação
Abra seu navegador em: `http://localhost:3000`

## 🔑 Credenciais de Login

Após rodar o seed, você pode fazer login com:

**Administrador:**
- Email: `admin@example.com`
- Senha: `admin123`

**Aluno:**
- Email: `aluno@example.com`
- Senha: `aluno123`

## 📝 Próximos Passos

1. **Criar seus próprios cursos**: Por enquanto, você precisa criar cursos diretamente no banco de dados ou através do Prisma Studio:
   ```bash
   npm run db:studio
   ```

2. **Adicionar vídeos**: Atualize o campo `videoUrl` nas aulas com URLs de vídeos do YouTube, Vimeo ou outros serviços suportados pelo React Player.

3. **Personalizar**: Ajuste cores, textos e imagens conforme necessário.

## 🛠️ Comandos Úteis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run db:studio` - Abre interface visual do banco de dados
- `npm run db:push` - Sincroniza schema com banco
- `npm run db:seed` - Popula banco com dados de exemplo

## ⚠️ Notas Importantes

- O banco de dados SQLite será criado em `prisma/dev.db`
- Para produção, considere usar PostgreSQL ou MySQL
- Os vídeos devem ser URLs públicas (YouTube, Vimeo, etc.) ou hospedados em um serviço de armazenamento
- A autenticação usa JWT, então não esqueça de definir um NEXTAUTH_SECRET seguro em produção
