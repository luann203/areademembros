# Área de Membros

Plataforma de cursos online estilo Memberkit para gerenciamento de cursos e alunos.

## Como acessar

**No seu PC:** no terminal, na pasta do projeto, rode:
```bash
npm run dev
```
Depois abra no navegador: **http://localhost:3000**

Se a porta 3000 estiver ocupada, o Next.js pode usar 3001 — veja a URL que aparecer no terminal.

## 🚀 Funcionalidades

- ✅ Sistema de autenticação (login/logout)
- ✅ Dashboard com sidebar de navegação
- ✅ Listagem de cursos em cards
- ✅ Página de detalhes do curso com módulos e aulas
- ✅ Player de vídeo integrado
- ✅ Sistema de comentários nas aulas
- ✅ Acompanhamento de progresso
- ✅ Marcar aulas como concluídas
- ✅ Avaliação de conteúdo

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

## 🛠️ Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure o banco de dados:
```bash
npm run db:push
npm run db:generate
```

3. Popule o banco com dados de exemplo:
```bash
npm run db:seed
```

## 🎯 Como usar

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse `http://localhost:3000`

3. Faça login:
   - **Qualquer email** com senha **`1234567`** (acesso padrão), ou
   - **Aluno do seed**: `aluno@example.com` / `aluno123`

## 📁 Estrutura do Projeto

```
areademembros/
├── app/                    # Páginas Next.js (App Router)
│   ├── api/               # API Routes
│   ├── dashboard/         # Páginas do dashboard
│   ├── login/             # Página de login
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── Sidebar.tsx        # Barra lateral de navegação
│   ├── CourseCard.tsx     # Card de curso
│   ├── LessonContent.tsx  # Conteúdo da aula
│   └── CommentSection.tsx # Seção de comentários
├── lib/                   # Utilitários
│   ├── prisma.ts          # Cliente Prisma
│   └── auth.ts            # Configuração NextAuth
├── prisma/                # Schema do banco de dados
│   ├── schema.prisma      # Schema Prisma
│   └── seed.ts            # Script de seed
└── types/                 # Definições de tipos TypeScript
```

## 🗄️ Banco de Dados

O projeto usa Prisma com SQLite. O schema inclui:

- **User**: Usuários (alunos e administradores)
- **Course**: Cursos
- **Module**: Módulos dos cursos
- **Lesson**: Aulas
- **Enrollment**: Inscrições de alunos em cursos
- **LessonProgress**: Progresso do aluno nas aulas
- **Comment**: Comentários nas aulas

## 🔐 Autenticação

O sistema usa NextAuth.js para autenticação. As senhas são hasheadas com bcrypt.

## 🎨 Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para banco de dados
- **NextAuth.js** - Autenticação
- **Tailwind CSS** - Estilização
- **React Player** - Player de vídeo
- **Lucide React** - Ícones

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run db:push` - Sincroniza schema com banco
- `npm run db:studio` - Abre Prisma Studio
- `npm run db:seed` - Popula banco com dados de exemplo

## 🚧 Próximos Passos

- [ ] Área administrativa para criar/editar cursos
- [ ] Upload de vídeos
- [ ] Sistema de certificados
- [ ] Notificações
- [ ] Comunidades/Fóruns
- [ ] Integração com pagamentos

## 📄 Licença

Este projeto é privado.
