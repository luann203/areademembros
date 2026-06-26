import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function extractEventType(platform: string, payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const data = payload as Record<string, unknown>

  if (platform === 'hotmart') {
    return (data.event as string) || (data.status as string) || null
  }
  if (platform === 'eduzz') {
    return (data.trans_status as string) || (data.event as string) || null
  }
  if (platform === 'kiwify') {
    return (data.webhook_event_type as string) || null
  }

  return (data.event as string) || (data.type as string) || (data.status as string) || null
}

export async function POST(
  request: Request,
  { params }: { params: { platform: string } }
) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const platform = params.platform

  let payload: unknown
  const contentType = request.headers.get('content-type') || ''

  try {
    if (contentType.includes('application/json')) {
      payload = await request.json()
    } else {
      const text = await request.text()
      try {
        payload = JSON.parse(text)
      } catch {
        payload = { raw: text }
      }
    }
  } catch {
    payload = { error: 'Invalid payload' }
  }

  let integrationId: string | null = null
  let status = 'received'

  if (secret) {
    const integration = await prisma.integration.findFirst({
      where: { platform, webhookSecret: secret, active: true },
    })
    if (!integration) {
      status = 'failed'
    } else {
      integrationId = integration.id
    }
  }

  const eventType = extractEventType(platform, payload)

  await prisma.webhookLog.create({
    data: {
      integrationId,
      platform,
      eventType,
      payload: JSON.stringify(payload),
      status,
    },
  })

  if (status === 'failed') {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 403 })
  }

  return NextResponse.json({ ok: true })
}

export async function GET(
  request: Request,
  { params }: { params: { platform: string } }
) {
  return POST(request, { params })
}
