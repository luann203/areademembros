/**
 * Auth: usa config base (só senha mágica) para rota e getServerSession.
 * Mesma config em todo o app = sessão funciona após login.
 */
import type { NextAuthOptions } from 'next-auth'
import { getAuthOptionsBase } from './auth-base'

export function getAuthOptions(): NextAuthOptions {
  return getAuthOptionsBase()
}

// Para getServerSession(authOptions) em páginas e layouts
export const authOptions = getAuthOptionsBase()
