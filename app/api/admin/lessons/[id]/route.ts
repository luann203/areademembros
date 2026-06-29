import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/require-admin'
import { recalculateCourseDuration } from '@/lib/recalculate-course-duration'

type RouteContext = { params: { id: string } }

export async function GET(_request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: {
      module: {
        select: {
          id: true,
          title: true,
          courseId: true,
          course: { select: { id: true, title: true } },
        },
      },
    },
  })

  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 })
  }

  return NextResponse.json(lesson)
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const existing = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: { module: { select: { courseId: true } } },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 })
  }

  const body = await request.json()
  const { title, description, videoUrl, duration, moduleId, order, showFooter } = body

  if (moduleId) {
    const targetModule = await prisma.module.findFirst({
      where: { id: moduleId, courseId: existing.module.courseId },
    })
    if (!targetModule) {
      return NextResponse.json({ error: 'Invalid module for this course.' }, { status: 400 })
    }
  }

  const lesson = await prisma.lesson.update({
    where: { id: params.id },
    data: {
      ...(title?.trim() ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(videoUrl !== undefined ? { videoUrl: videoUrl?.trim() || null } : {}),
      ...(duration !== undefined ? { duration: typeof duration === 'number' ? duration : null } : {}),
      ...(typeof showFooter === 'boolean' ? { showFooter } : {}),
      ...(moduleId ? { moduleId } : {}),
      ...(typeof order === 'number' ? { order } : {}),
    },
  })

  await recalculateCourseDuration(existing.module.courseId)
  return NextResponse.json(lesson)
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const existing = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: { module: { select: { courseId: true } } },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 })
  }

  await prisma.lesson.delete({ where: { id: params.id } })
  await recalculateCourseDuration(existing.module.courseId)
  return NextResponse.json({ ok: true })
}
