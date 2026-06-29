import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processHotmartWebhook } from '@/lib/provision-student-access'
import { verifyHotmartSignature } from '@/lib/hotmart-signature'

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

function parsePayload(rawBody: string, contentType: string): unknown {
  if (!rawBody) return { error: 'Empty payload' }

  if (contentType.includes('application/json') || rawBody.trim().startsWith('{')) {
    try {
      return JSON.parse(rawBody)
    } catch {
      return { raw: rawBody }
    }
  }

  try {
    return JSON.parse(rawBody)
  } catch {
    return { raw: rawBody }
  }
}

function verifyHotmartRequest(request: Request, rawBody: string): NextResponse | null {
  const secret = process.env.HOTMART_WEBHOOK_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Hotmart Webhook] HOTMART_WEBHOOK_SECRET não configurado em produção')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
    }
    return null
  }

  const signature =
    request.headers.get('x-hotmart-webhook-token') ||
    request.headers.get('x-hotmart-hottok')

  if (!verifyHotmartSignature(rawBody, signature, secret)) {
    console.warn('[Hotmart Webhook] Assinatura inválida')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}

export async function POST(
  request: Request,
  { params }: { params: { platform: string } }
) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const platform = params.platform
  const contentType = request.headers.get('content-type') || ''

  let rawBody = ''
  try {
    rawBody = await request.text()
  } catch {
    rawBody = ''
  }

  if (platform === 'hotmart') {
    const denied = verifyHotmartRequest(request, rawBody)
    if (denied) return denied
  }

  const payload = parsePayload(rawBody, contentType)

  let integration = null
  let logStatus = 'received'

  if (secret) {
    integration = await prisma.integration.findFirst({
      where: { platform, webhookSecret: secret, active: true },
    })
    if (!integration) {
      logStatus = 'failed'
    }
  } else {
    logStatus = 'failed'
  }

  const eventType = extractEventType(platform, payload)

  const log = await prisma.webhookLog.create({
    data: {
      integrationId: integration?.id ?? null,
      platform,
      eventType,
      payload: JSON.stringify(payload),
      status: logStatus,
    },
  })

  if (logStatus === 'failed' || !integration) {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 403 })
  }

  if (platform === 'hotmart') {
    try {
      const result = await processHotmartWebhook(integration, payload)

      if (result.ok) {
        await prisma.webhookLog.update({
          where: { id: log.id },
          data: { status: 'processed' },
        })
        return NextResponse.json({
          ok: true,
          action: result.action,
          enrolled: result.enrolledCourses,
          revoked: result.revokedCourses,
          newUser: result.isNewUser ?? false,
          skipped: result.reason,
        })
      }

      return NextResponse.json({ ok: true, skipped: result.reason })
    } catch (error) {
      console.error('[webhook] Hotmart processing failed:', error)
      await prisma.webhookLog.update({
        where: { id: log.id },
        data: { status: 'failed' },
      })
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}

export async function GET(
  request: Request,
  { params }: { params: { platform: string } }
) {
  return POST(request, { params })
}
