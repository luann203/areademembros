import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/require-admin'
import { recalculateCourseDuration } from '@/lib/recalculate-course-duration'

type RouteContext = { params: { id: string } }

export async function POST(request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const courseModule = await prisma.module.findUnique({
    where: { id: params.id },
    select: { id: true, courseId: true },
  })

  if (!courseModule) {
    return NextResponse.json({ error: 'Module not found.' }, { status: 404 })
  }

  const body = await request.json()
  const { title, description, videoUrl, duration, showFooter } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Lesson title is required.' }, { status: 400 })
  }

  const maxOrder = await prisma.lesson.aggregate({
    where: { moduleId: params.id },
    _max: { order: true },
  })

  const lesson = await prisma.lesson.create({
    data: {
      title: title.trim(),
      description: description?.trim() || '',
      videoUrl: videoUrl?.trim() || null,
      duration: typeof duration === 'number' ? duration : null,
      showFooter: typeof showFooter === 'boolean' ? showFooter : true,
      order: (maxOrder._max.order ?? 0) + 1,
      moduleId: params.id,
    },
  })

  await recalculateCourseDuration(courseModule.courseId)
  return NextResponse.json(lesson, { status: 201 })
}
