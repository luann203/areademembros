import type { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function resolveUserId(session: Session): Promise<string | null> {
  const email = session.user.email?.toLowerCase().trim()

  if (email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })
      if (user) return user.id
    } catch {
      // segue para fallback
    }
  }

  const sessionId = session.user.id
  if (sessionId && !sessionId.startsWith('magic-')) {
    return sessionId
  }

  return null
}
