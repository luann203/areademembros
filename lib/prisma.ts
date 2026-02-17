import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Detectar se estamos em build time (várias formas de detectar)
const isBuildTime = 
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.NEXT_PHASE === 'phase-development-build' ||
  process.env.VERCEL === '1' && !process.env.VERCEL_ENV ||
  typeof window === 'undefined' && process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL

// Criar Prisma Client apenas em runtime, não durante build
function createPrismaClient(): PrismaClient {
  // Se estiver em build time, retornar um proxy que não inicializa o cliente real
  if (isBuildTime) {
    return new Proxy({} as PrismaClient, {
      get(target, prop) {
        // Durante build, retornar funções vazias que não fazem nada
        if (typeof prop === 'string' && prop !== 'constructor') {
          return () => Promise.resolve(null)
        }
        return undefined
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
