import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/require-admin'
import AdminMemberProfileView from '@/components/admin/AdminMemberProfileView'
import type { AdminMemberDetail } from '@/types/admin'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: { id: string }
}

export default async function AdminMemberProfilePage({ params }: PageProps) {
  await requireAdminPage()

  const [user, courses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        accessEndsAt: true,
        createdAt: true,
        role: true,
        enrollments: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            courseId: true,
            createdAt: true,
            course: { select: { title: true } },
          },
        },
      },
    }),
    prisma.course.findMany({
      orderBy: { title: 'asc' },
      select: { id: true, title: true },
    }),
  ])

  if (!user || user.role === 'admin') notFound()

  const member: AdminMemberDetail = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    accessEndsAt: user.accessEndsAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    role: user.role,
    enrollments: user.enrollments.map((enrollment) => ({
      id: enrollment.id,
      courseId: enrollment.courseId,
      courseTitle: enrollment.course.title,
      createdAt: enrollment.createdAt.toISOString(),
    })),
  }

  return <AdminMemberProfileView member={member} courses={courses} />
}
