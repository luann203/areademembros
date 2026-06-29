import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/require-admin'

type RouteContext = { params: { id: string } }

export async function PATCH(request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const body = await request.json()
  const { status, read } = body

  const existing = await prisma.comment.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Comment not found.' }, { status: 404 })
  }

  const data: { status?: string; read?: boolean } = {}
  if (status === 'approved' || status === 'rejected' || status === 'pending') {
    data.status = status
    data.read = true
  }
  if (typeof read === 'boolean') {
    data.read = read
  }

  const comment = await prisma.comment.update({
    where: { id: params.id },
    data,
  })

  return NextResponse.json(comment)
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const existing = await prisma.comment.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Comment not found.' }, { status: 404 })
  }

  await prisma.comment.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
