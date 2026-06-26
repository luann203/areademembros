import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import IntegrationsView from '@/components/IntegrationsView'
import type { IntegrationRecord, WebhookLogRecord } from '@/types/integration'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: { tab?: string }
}

export default async function IntegrationsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const initialTab =
    searchParams.tab === 'installed' || searchParams.tab === 'history'
      ? searchParams.tab
      : 'available'

  let integrations: IntegrationRecord[] = []
  let serializedLogs: WebhookLogRecord[] = []
  let webhookTotal = 0
  let loadError = false

  try {
    const [rawIntegrations, webhookLogs, total] = await Promise.all([
      prisma.integration.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.webhookLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.webhookLog.count(),
    ])

    integrations = rawIntegrations.map((i) => ({
      ...i,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    }))

    serializedLogs = webhookLogs.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    }))

    webhookTotal = total
  } catch (err) {
    console.error('[integrations] Failed to load data:', err)
    loadError = true
  }

  return (
    <IntegrationsView
      initialTab={initialTab}
      integrations={integrations}
      webhookLogs={serializedLogs}
      webhookTotal={webhookTotal}
      loadError={loadError}
    />
  )
}
