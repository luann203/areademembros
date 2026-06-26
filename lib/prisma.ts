import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const isBuildTime =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.NEXT_PHASE === 'phase-development-build'

const isVercel = process.env.VERCEL === '1'

const mockDelegate = {
  findMany: () => Promise.resolve([]),
  findUnique: () => Promise.resolve(null),
  findFirst: () => Promise.resolve(null),
  create: () => Promise.resolve({}),
  update: () => Promise.resolve({}),
  upsert: () => Promise.resolve({}),
  delete: () => Promise.resolve({}),
  deleteMany: () => Promise.resolve({ count: 0 }),
  createMany: () => Promise.resolve({ count: 0 }),
  count: () => Promise.resolve(0),
}

function createMockPrisma(): PrismaClient {
  return new Proxy({} as PrismaClient, {
    get(_target, prop: string) {
      if (prop === 'constructor') return PrismaClient
      return mockDelegate
    },
  }) as PrismaClient
}

function createPrismaClient(): PrismaClient {
  if (isBuildTime) {
    return new Proxy({} as PrismaClient, {
      get(_target, prop: string) {
        if (prop !== 'constructor' && typeof prop === 'string') {
          return () => Promise.resolve(null)
        }
        return undefined
      },
    }) as PrismaClient
  }

  if (isVercel && !process.env.DATABASE_URL) {
    return createMockPrisma()
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

function isStalePrismaClient(client: PrismaClient): boolean {
  const delegate = (client as PrismaClient & { integration?: { findMany?: unknown } }).integration
  return typeof delegate?.findMany !== 'function'
}

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma && isStalePrismaClient(globalForPrisma.prisma)) {
    void globalForPrisma.prisma.$disconnect().catch(() => {})
    globalForPrisma.prisma = undefined
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }

  return globalForPrisma.prisma
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    const value = client[prop as keyof PrismaClient]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})

if (process.env.NODE_ENV !== 'production' && !isBuildTime) {
  getPrismaClient()
}
