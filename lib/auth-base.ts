/**
 * NextAuth: senha mágica 1234567.
 * Se houver banco (DATABASE_URL), busca/cria usuário por email e usa o id real (matrículas funcionam).
 * Sem banco, retorna um id temporário (lista de cursos fica vazia).
 */
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const MAGIC_PASSWORD = '1234567'

export function getAuthOptionsBase(): NextAuthOptions {
  return {
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-change-in-production',
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null
          if (credentials.password.trim() !== MAGIC_PASSWORD) return null

          const email = String(credentials.email).trim().toLowerCase()
          const name = email.split('@')[0] || 'User'

          try {
            const existing = await prisma.user.findUnique({ where: { email } })
            if (existing) {
              return {
                id: existing.id,
                email: existing.email,
                name: existing.name ?? name,
                role: existing.role,
              }
            }
            const hashed = await bcrypt.hash(MAGIC_PASSWORD, 10)
            const created = await prisma.user.create({
              data: {
                email,
                password: hashed,
                name,
                role: 'student',
              },
            })
            if (created?.id) {
              return {
                id: created.id,
                email: (created as { email: string }).email,
                name: ((created as { name: string | null }).name) ?? name,
                role: (created as { role: string }).role,
              }
            }
          } catch {
            // ignore (banco indisponível ou create falhou)
          }
          return {
            id: `magic-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            email,
            name,
            role: 'student',
          }
        },
      }),
    ],
    pages: {
      signIn: '/login',
      error: '/login',
    },
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60, // 30 dias
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id
          token.email = user.email
          token.name = user.name
          token.role = 'student'
        }
        if (!token.id && token.sub) token.id = token.sub
        return token
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = (token.id ?? token.sub ?? '') as string
          session.user.role = (token.role as string) ?? 'student'
          session.user.email = (token.email as string) ?? ''
          session.user.name = (token.name as string) ?? 'User'
        }
        return session
      },
    },
  }
}
