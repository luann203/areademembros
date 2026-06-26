import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const integrations = await prisma.integration.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(integrations)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
