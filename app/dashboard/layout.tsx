import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveUserId } from '@/lib/resolve-user-id'
import Sidebar from '@/components/Sidebar'
import DashboardHeader from '@/components/DashboardHeader'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const userId = await resolveUserId(session)
  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, avatarUrl: true },
      })
    : null

  return (
    <div className="flex min-h-screen bg-ds-bg">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col relative pl-[72px] md:pl-0">
        <DashboardHeader
          user={{
            name: user?.name ?? session.user.name ?? null,
            email: user?.email ?? session.user.email ?? '',
            avatarUrl: user?.avatarUrl ?? null,
          }}
        />
        <main className="flex-1 min-w-0 overflow-auto px-4 md:px-7 pt-4 pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
