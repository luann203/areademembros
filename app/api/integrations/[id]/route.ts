import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/require-admin'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const body = await request.json()
  const { name, token, offerId, modality, courseIds } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'O nome da configuração é obrigatório.' }, { status: 400 })
  }

  const integration = await prisma.integration.update({
    where: { id: params.id },
    data: {
      name: name.trim(),
      token: token?.trim() || null,
      offerId: offerId?.trim() || null,
      modality: modality || 'courses',
      courseIds: JSON.stringify(courseIds || []),
    },
  })

  return NextResponse.json(integration)
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  try {
    await prisma.integration.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Integração não encontrada.' }, { status: 404 })
  }
}
