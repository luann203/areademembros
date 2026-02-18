import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Detectar se estamos em build time
const isBuildTime =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.NEXT_PHASE === 'phase-development-build'

// No Vercel usar mock (SQLite com file: não funciona em serverless)
const isVercel = process.env.VERCEL === '1'

// Objeto com métodos que retornam vazio (para usar no Vercel sem banco)
const mockDelegate = {
  findMany: () => Promise.resolve([]),
  findUnique: () => Promise.resolve(null),
  findFirst: () => Promise.resolve(null),
  create: () => Promise.resolve({}),
  update: () => Promise.resolve({}),
  delete: () => Promise.resolve({}),
  createMany: () => Promise.resolve({ count: 0 }),
}

// Proxy que retorna resultados vazios (sem conectar ao banco)
function createMockPrisma(): PrismaClient {
  return new Proxy({} as PrismaClient, {
    get(_target, prop: string) {
      if (prop === 'constructor') return PrismaClient
      return mockDelegate
    },
  }) as PrismaClient
}

// Criar Prisma Client apenas em runtime, não durante build
function createPrismaClient(): PrismaClient {
  if (isBuildTime) {
    return new Proxy({} as PrismaClient, {
      get(_target, prop: string) {
        if (prop !== 'constructor' && typeof prop === 'string') {
          return () => Promise.resolve(null)
        }
        return undefined
      }
    }) as PrismaClient
  }

  // No Vercel usar mock (evita erro de conexão SQLite no serverless)
  if (isVercel) {
    return createMockPrisma()
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
