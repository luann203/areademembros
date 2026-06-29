import type { Session } from 'next-auth'
import { resolveUserId } from '@/lib/resolve-user-id'

export function getSessionUserId(session: Session): string | null {
  const id = session.user.id
  if (id && !id.startsWith('magic-')) return id
  return null
}

export async function requireSessionUserId(session: Session): Promise<string | null> {
  return getSessionUserId(session) ?? resolveUserId(session)
}
