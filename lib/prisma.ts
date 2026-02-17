import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Detectar se estamos em build time
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                     process.env.NEXT_PHASE === 'phase-development-build'

// Criar Prisma Client apenas em runtime, não durante build
function createPrismaClient(): PrismaClient {
  if (isBuildTime) {
    // Durante build, retornar um proxy que lança erro se tentar usar
    return new Proxy({} as PrismaClient, {
      get() {
        throw new Error('Prisma Client não pode ser usado durante o build. Use apenas em runtime.')
      }
    })
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Export usando Proxy para lazy initialization - só cria quando realmente acessado
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient()
    }
    const value = globalForPrisma.prisma[prop as keyof PrismaClient]
    if (typeof value === 'function') {
      return value.bind(globalForPrisma.prisma)
    }
    return value
  }
})

if (process.env.NODE_ENV !== 'production' && !isBuildTime) {
  // Garantir que o prisma seja criado para cache em desenvolvimento
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
}
