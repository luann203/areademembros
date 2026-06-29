import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/require-admin'

export async function GET(request: Request) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit') || 50), 200)
  const platform = searchParams.get('platform')

  const logs = await prisma.webhookLog.findMany({
    where: platform ? { platform } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      integration: { select: { name: true, platform: true } },
    },
  })

  const total = await prisma.webhookLog.count({
    where: platform ? { platform } : undefined,
  })

  return NextResponse.json({ logs, total })
}
