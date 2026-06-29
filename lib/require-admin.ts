import { redirect } from 'next/navigation'
import { getServerSession, type Session } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { isConfiguredAdminEmail } from '@/lib/admin-email'
import { prisma } from '@/lib/prisma'
import { resolveUserId } from '@/lib/resolve-user-id'

async function promoteAdminIfNeeded(userId: string, email: string): Promise<void> {
  if (!isConfiguredAdminEmail(email)) return
  try {
    await prisma.user.updateMany({
      where: { id: userId, role: { not: 'admin' } },
      data: { role: 'admin' },
    })
  } catch {
    // ignore
  }
}

export async function getAdminSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  if (session.user.role === 'admin') return session

  const email = session.user.email ?? ''
  if (isConfiguredAdminEmail(email)) {
    const userId = await resolveUserId(session)
    if (!userId) return null
    await promoteAdminIfNeeded(userId, email)
    session.user.role = 'admin'
    return session
  }

  return null
}

export async function requireAdminPage() {
  const session = await getAdminSession()
  if (!session) redirect('/dashboard')
  return session
}

export async function requireAdminApi() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return session
}

export function isAdminRole(role: string | undefined | null): boolean {
  return role === 'admin'
}
