import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/require-admin'
import AdminMembersView from '@/components/admin/AdminMembersView'
import type { AdminMemberRecord } from '@/types/admin'

export const dynamic = 'force-dynamic'

export default async function AdminMembersPage() {
  await requireAdminPage()

  const [members, total, courses] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'student' },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        accessEndsAt: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.user.count({ where: { role: 'student' } }),
    prisma.course.findMany({
      orderBy: { title: 'asc' },
      select: { id: true, title: true },
    }),
  ])

  const serialized: AdminMemberRecord[] = members.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    avatarUrl: member.avatarUrl,
    accessEndsAt: member.accessEndsAt?.toISOString() ?? null,
    createdAt: member.createdAt.toISOString(),
    enrollmentCount: member._count.enrollments,
  }))

  return (
    <AdminMembersView initialMembers={serialized} initialTotal={total} courses={courses} />
  )
}
