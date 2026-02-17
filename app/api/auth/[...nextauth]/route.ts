import NextAuth from 'next-auth'
import { getAuthOptions } from '@/lib/auth'

// Forçar rota dinâmica para evitar análise durante build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Lazy initialization - só cria o handler quando a rota é chamada, não durante o build
let handler: ReturnType<typeof NextAuth> | null = null

function getHandler() {
  if (!handler) {
    handler = NextAuth(getAuthOptions())
  }
  return handler
}

// Usar dynamic import para evitar execução durante build
export async function GET(...args: Parameters<ReturnType<typeof NextAuth>['GET']>) {
  return getHandler().GET(...args)
}

export async function POST(...args: Parameters<ReturnType<typeof NextAuth>['POST']>) {
  return getHandler().POST(...args)
}
