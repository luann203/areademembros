import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/require-admin'

type RouteContext = { params: { id: string } }

export async function POST(request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const course = await prisma.course.findUnique({ where: { id: params.id } })
  if (!course) {
    return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
  }

  const body = await request.json()
  const { title, description } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Module title is required.' }, { status: 400 })
  }

  const maxOrder = await prisma.module.aggregate({
    where: { courseId: params.id },
    _max: { order: true },
  })

  const createdModule = await prisma.module.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      order: (maxOrder._max.order ?? 0) + 1,
      courseId: params.id,
    },
    include: { lessons: true },
  })

  return NextResponse.json(createdModule, { status: 201 })
}
