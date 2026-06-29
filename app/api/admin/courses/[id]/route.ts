import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/require-admin'

type RouteContext = { params: { id: string } }

export async function GET(_request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      category: { select: { id: true, name: true } },
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: { orderBy: { order: 'asc' } },
        },
      },
    },
  })

  if (!course) {
    return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
  }

  return NextResponse.json(course)
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const existing = await prisma.course.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
  }

  const body = await request.json()
  const { title, description, salesPageUrl, categoryId, imageUrl } = body

  const course = await prisma.course.update({
    where: { id: params.id },
    data: {
      ...(title?.trim() ? { title: title.trim() } : {}),
      ...(description?.trim() ? { description: description.trim() } : {}),
      salesPageUrl: salesPageUrl?.trim() || null,
      categoryId: categoryId || null,
      ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
    },
  })

  return NextResponse.json(course)
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const existing = await prisma.course.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
  }

  await prisma.course.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
