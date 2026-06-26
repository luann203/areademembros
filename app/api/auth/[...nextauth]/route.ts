import NextAuth from 'next-auth'
import { getAuthOptionsBase } from '@/lib/auth-base'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Config mínima (sem Prisma) para evitar erros no Vercel
const handler = NextAuth(getAuthOptionsBase())

export { handler as GET, handler as POST }
