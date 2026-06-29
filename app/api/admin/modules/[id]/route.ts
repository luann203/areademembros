import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/require-admin'

type RouteContext = { params: { id: string } }

export async function PATCH(request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const existing = await prisma.module.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Module not found.' }, { status: 404 })
  }

  const body = await request.json()
  const { title, description, order } = body

  const updatedModule = await prisma.module.update({
    where: { id: params.id },
    data: {
      ...(title?.trim() ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(typeof order === 'number' ? { order } : {}),
    },
    include: { lessons: { orderBy: { order: 'asc' } } },
  })

  return NextResponse.json(updatedModule)
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const existing = await prisma.module.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Module not found.' }, { status: 404 })
  }

  await prisma.module.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
