import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/require-admin'

export async function GET() {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const [pendingComments, failedWebhooks] = await Promise.all([
    prisma.comment.count({ where: { status: 'pending' } }),
    prisma.webhookLog.count({ where: { status: 'failed' } }),
  ])

  const badges: Record<string, number> = {}

  if (pendingComments > 0) {
    badges['/dashboard/admin/comments'] = pendingComments
  }

  if (failedWebhooks > 0) {
    badges['/dashboard/integrations'] = failedWebhooks
  }

  return NextResponse.json({ badges })
}
