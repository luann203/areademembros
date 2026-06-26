import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveUserId } from '@/lib/resolve-user-id'
import AccountForm from '@/components/AccountForm'
import type { UserProfile } from '@/types/account'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = await resolveUserId(session)
  if (!userId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      timezone: true,
    },
  })

  if (!user) redirect('/login')

  const profile: UserProfile = user

  return (
    <div className="max-w-6xl ds-page-shell">
      <header className="mb-6 md:mb-8">
        <p className="ds-label mb-2">Prohub.</p>
        <h1 className="ds-page-title text-2xl sm:text-3xl">My Account</h1>
      </header>

      <AccountForm profile={profile} />
    </div>
  )
}
