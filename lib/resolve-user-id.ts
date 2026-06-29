import type { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function resolveUserId(session: Session): Promise<string | null> {
  const sessionId = session.user.id
  if (sessionId && !sessionId.startsWith('magic-')) {
    return sessionId
  }

  const email = session.user.email?.toLowerCase().trim()
  if (!email) return null

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    return user?.id ?? null
  } catch {
    return null
  }
}
