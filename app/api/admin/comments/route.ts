import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/require-admin'

export async function GET(request: NextRequest) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const { searchParams } = new URL(request.url)
  const tab = searchParams.get('tab') || 'pending'
  const courseId = searchParams.get('courseId')
  const lessonId = searchParams.get('lessonId')
  const search = searchParams.get('search')?.trim()

  const where: Record<string, unknown> = {}

  if (tab === 'unread') {
    where.read = false
  } else if (tab === 'approved' || tab === 'rejected' || tab === 'pending') {
    where.status = tab
  }

  if (lessonId) {
    where.lessonId = lessonId
  } else if (courseId) {
    where.lesson = { module: { courseId } }
  }

  if (search) {
    where.content = { contains: search, mode: 'insensitive' }
  }

  const comments = await prisma.comment.findMany({
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
  })

  const [unread, approved, rejected, pending] = await Promise.all([
    prisma.comment.count({ where: { read: false } }),
    prisma.comment.count({ where: { status: 'approved' } }),
    prisma.comment.count({ where: { status: 'rejected' } }),
    prisma.comment.count({ where: { status: 'pending' } }),
  ])

  return NextResponse.json({
    comments: comments.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
    counts: { unread, approved, rejected, pending },
  })
}
