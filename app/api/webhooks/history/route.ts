import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
