#!/bin/bash

echo "🚀 Iniciando Área de Membros..."
echo ""

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado. Criando..."
    cat > .env << EOF
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=desenvolvimento-secret-key-change-in-production-123456789
DATABASE_URL="file:./prisma/dev.db"
EOF
fi

# Verificar se banco existe
if [ ! -f "prisma/dev.db" ]; then
    echo "🗄️  Configurando banco de dados..."
    npm run db:push
    npm run db:generate
    npm run db:seed
fi

# Limpar cache
echo "🧹 Limpando cache..."
rm -rf .next

# Iniciar servidor
echo ""
echo "✅ Tudo pronto! Iniciando servidor..."
echo "🌐 Acesse: http://localhost:3000"
echo ""
npm run dev
