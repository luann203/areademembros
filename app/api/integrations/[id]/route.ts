import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.integration.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Integração não encontrada.' }, { status: 404 })
  }
}
