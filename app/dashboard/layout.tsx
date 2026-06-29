import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import DashboardShell from '@/components/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const isAdmin = session.user.role === 'admin'

  return (
    <DashboardShell
      isAdmin={isAdmin}
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? '',
        avatarUrl: session.user.avatarUrl ?? null,
      }}
    >
      {children}
    </DashboardShell>
  )
}
