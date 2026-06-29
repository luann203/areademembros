import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/require-admin'

export async function GET() {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const integrations = await prisma.integration.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(integrations)
}

export async function POST(request: Request) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const body = await request.json()
  const { platform, name, token, offerId, modality, courseIds } = body

  if (!platform || !name?.trim()) {
    return NextResponse.json({ error: 'Plataforma e nome são obrigatórios.' }, { status: 400 })
  }

  const webhookSecret = randomBytes(24).toString('hex')
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const webhookUrl = `${baseUrl}/api/webhooks/${platform}?secret=${webhookSecret}`

  const integration = await prisma.integration.create({
    data: {
      platform,
      name: name.trim(),
      token: token?.trim() || null,
      offerId: offerId?.trim() || null,
      modality: modality || 'courses',
      courseIds: JSON.stringify(courseIds || []),
      webhookUrl,
      webhookSecret,
      active: true,
    },
  })

  return NextResponse.json(integration, { status: 201 })
}
