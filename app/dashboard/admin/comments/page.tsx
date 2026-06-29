import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/require-admin'
import AdminCommentsView from '@/components/admin/AdminCommentsView'
import type { AdminCommentRecord } from '@/types/admin'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: { tab?: string }
}

function parseTab(value: string | undefined) {
  if (value === 'approved' || value === 'rejected' || value === 'pending' || value === 'unread') {
    return value
  }
  return 'pending' as const
}

export default async function AdminCommentsPage({ searchParams }: PageProps) {
  await requireAdminPage()

  const tab = parseTab(searchParams.tab)

  const where =
    tab === 'unread'
      ? { read: false }
      : { status: tab }

  const [comments, courses, lessons, unread, approved, rejected, pending] =
    await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          lesson: {
            select: {
              id: true,
              title: true,
              module: {
                select: {
                  course: { select: { id: true, title: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.course.findMany({
        orderBy: { title: 'asc' },
        select: { id: true, title: true },
      }),
      prisma.lesson.findMany({
        orderBy: { title: 'asc' },
        select: {
          id: true,
          title: true,
          module: { select: { courseId: true } },
        },
      }),
      prisma.comment.count({ where: { read: false } }),
      prisma.comment.count({ where: { status: 'approved' } }),
      prisma.comment.count({ where: { status: 'rejected' } }),
      prisma.comment.count({ where: { status: 'pending' } }),
    ])

  const serializedComments: AdminCommentRecord[] = comments.map((c) => ({
    id: c.id,
    content: c.content,
    status: c.status as AdminCommentRecord['status'],
    read: c.read,
    createdAt: c.createdAt.toISOString(),
    user: c.user,
    lesson: c.lesson,
  }))

  return (
    <AdminCommentsView
      courses={courses}
      lessons={lessons.map((l) => ({
        id: l.id,
        title: l.title,
        courseId: l.module.courseId,
      }))}
      initialTab={tab}
      initialComments={serializedComments}
      initialCounts={{ unread, approved, rejected, pending }}
    />
  )
}
