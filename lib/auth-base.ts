/**
 * NextAuth: credenciais com bcrypt.
 * Senha de desenvolvimento só em NODE_ENV=development (ou ALLOW_MAGIC_PASSWORD=true).
 */
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { isConfiguredAdminEmail } from '@/lib/admin-email'
import { isMagicPassword } from '@/lib/magic-password'
import { checkLoginRateLimit } from '@/lib/ratelimit'

function getClientIp(): string {
  const headerList = headers()
  const forwarded = headerList.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'anonymous'
  return headerList.get('x-real-ip') ?? 'anonymous'
}

export function getAuthOptionsBase(): NextAuthOptions {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret && process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
    throw new Error('NEXTAUTH_SECRET must be set in production')
  }

  return {
    secret: secret || 'fallback-secret-for-development-change-in-production',
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null

          const ip = getClientIp()
          const { success } = await checkLoginRateLimit(ip)
          if (!success) {
            throw new Error('TooManyAttempts')
          }

          const email = String(credentials.email).trim().toLowerCase()
          const name = email.split('@')[0] || 'User'
          const password = credentials.password.trim()

          try {
            const existing = await prisma.user.findUnique({ where: { email } })
            if (existing) {
              const magicOk = isMagicPassword(password)
              const hashOk = await bcrypt.compare(password, existing.password)
              if (!magicOk && !hashOk) return null

              const role = isConfiguredAdminEmail(email) ? 'admin' : existing.role
              if (role === 'admin' && existing.role !== 'admin') {
                await prisma.user.update({
                  where: { id: existing.id },
                  data: { role: 'admin' },
                })
              }

              return {
                id: existing.id,
                email: existing.email,
                name: existing.name ?? name,
                role,
                avatarUrl: existing.avatarUrl,
              }
            }

            if (!isMagicPassword(password)) return null

            const hashed = await bcrypt.hash(password, 12)
            const created = await prisma.user.create({
              data: {
                email,
                password: hashed,
                name,
                role: isConfiguredAdminEmail(email) ? 'admin' : 'student',
              },
            })
            if (created?.id) {
              return {
                id: created.id,
                email: created.email,
                name: created.name ?? name,
                role: created.role,
                avatarUrl: created.avatarUrl ?? null,
              }
            }
          } catch (error) {
            if (error instanceof Error && error.message === 'TooManyAttempts') {
              throw error
            }
            // banco indisponível ou create falhou
          }

          if (process.env.NODE_ENV !== 'development') return null

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
      maxAge: 7 * 24 * 60 * 60,
    },
    jwt: {
      maxAge: 7 * 24 * 60 * 60,
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id
          token.email = user.email
          token.name = user.name
          token.role = user.role ?? 'student'
          token.avatarUrl = user.avatarUrl ?? null
        }

        const email =
          typeof token.email === 'string' ? token.email.toLowerCase().trim() : ''
        const currentId = typeof token.id === 'string' ? token.id : ''

        if (email && isConfiguredAdminEmail(email)) {
          token.role = 'admin'
        }

        if (email && (!currentId || currentId.startsWith('magic-'))) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email },
              select: { id: true, role: true, name: true, avatarUrl: true },
            })
            if (dbUser) {
              token.id = dbUser.id
              token.role = isConfiguredAdminEmail(email) ? 'admin' : dbUser.role
              token.name = dbUser.name ?? token.name
              token.avatarUrl = dbUser.avatarUrl
            }
          } catch {
            // banco indisponível
          }
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
          session.user.avatarUrl = (token.avatarUrl as string | null) ?? null
        }
        return session
      },
    },
  }
}
