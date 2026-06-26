'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, ExternalLink, Copy, Check } from 'lucide-react'
import PlatformLogo from '@/components/PlatformLogo'
import { INTEGRATION_PLATFORMS, getPlatformBySlug } from '@/lib/integration-platforms'
import { formatDateTime, formatPayloadPreview } from '@/lib/format-integration'
import type { IntegrationRecord, WebhookLogRecord } from '@/types/integration'

type Tab = 'installed' | 'available' | 'history'

type IntegrationsViewProps = {
  initialTab: Tab
  integrations: IntegrationRecord[]
  webhookLogs: WebhookLogRecord[]
  webhookTotal: number
  loadError?: boolean
}

function parseTab(value: string | undefined): Tab {
  if (value === 'installed' || value === 'history') return value
  return 'available'
}

export default function IntegrationsView({
  initialTab,
  integrations: initialIntegrations,
  webhookLogs,
  webhookTotal,
  loadError = false,
}: IntegrationsViewProps) {
  const router = useRouter()
  const tab = parseTab(initialTab)

  const [integrations, setIntegrations] = useState(initialIntegrations)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setIntegrations(initialIntegrations)
  }, [initialIntegrations])

  const setTab = (next: Tab) => {
    router.replace(`/dashboard/integrations?tab=${next}`, { scroll: false })
  }

  const installedCount = integrations.length
  const availableCount = INTEGRATION_PLATFORMS.length

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'installed', label: 'Installed', count: installedCount },
    { id: 'available', label: 'Available', count: availableCount },
    { id: 'history', label: 'History', count: webhookTotal },
  ]

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta integração?')) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/integrations/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao remover')
      setIntegrations((prev) => prev.filter((i) => i.id !== id))
      router.refresh()
    } catch {
      alert('Não foi possível remover a integração. Tente novamente.')
    } finally {
      setDeletingId(null)
    }
  }

  const copyWebhookUrl = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      alert('Não foi possível copiar a URL.')
    }
  }

  return (
    <div className="ds-page-shell">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <p className="ds-label mb-2">Prohub.</p>
          <h1 className="ds-page-title text-2xl sm:text-3xl">Integrations</h1>
        </div>
        <Link
          href="/dashboard/integrations/hotmart"
          className="ds-btn-brand self-start sm:self-auto text-center"
        >
          Integrate
        </Link>
      </header>

      {loadError && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Não foi possível carregar os dados das integrações. Reinicie o servidor com{' '}
          <code className="font-mono text-xs">npx prisma generate && npm run dev</code>.
        </div>
      )}

      <div className="border-b border-ds-border mb-6">
        <nav className="flex gap-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-[#E50914] text-[#E50914]'
                  : 'border-transparent text-ds-secondary hover:text-gray-700'
              }`}
            >
              {t.label}
              <span
                className={`inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-xs font-semibold ${
                  tab === t.id ? 'bg-[#E50914]/10 text-[#E50914]' : 'bg-ds-surface text-ds-secondary'
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {tab === 'available' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {INTEGRATION_PLATFORMS.map((platform) => (
            <Link
              key={platform.slug}
              href={`/dashboard/integrations/${platform.slug}`}
              className="group bg-ds-card border border-ds-border rounded-lg overflow-hidden hover:border-[#E50914]/40 hover:shadow-sm transition-all max-w-sm"
            >
              <div className="flex items-center justify-center h-36 p-6">
                <PlatformLogo platform={platform} size="lg" />
              </div>
              <div className="border-t border-gray-100 px-4 py-2.5">
                <span className="text-xs text-ds-muted">{platform.categoryLabel}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab === 'installed' && (
        <div className="space-y-4">
          {integrations.length === 0 ? (
            <div className="text-center py-16 bg-ds-card rounded-lg border border-ds-border">
              <p className="text-ds-secondary mb-4">Nenhuma integração configurada ainda.</p>
              <Link
                href="/dashboard/integrations/hotmart"
                className="text-[#E50914] font-semibold hover:underline"
              >
                Configurar Hotmart
              </Link>
            </div>
          ) : (
            integrations.map((integration) => {
              const platform = getPlatformBySlug(integration.platform)
              return (
                <div
                  key={integration.id}
                  className="bg-ds-card border border-ds-border rounded-lg p-4 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {platform && (
                        <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center">
                          <PlatformLogo platform={platform} size="sm" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-ds-primary truncate">{integration.name}</h3>
                        <p className="text-sm text-ds-secondary capitalize">
                          {platform?.name ?? integration.platform} · {integration.modality}
                        </p>
                        {integration.webhookUrl && (
                          <div className="flex items-start gap-2 mt-2">
                            <code className="flex-1 text-xs bg-gray-50 border border-ds-border rounded px-2 py-1 break-all">
                              {integration.webhookUrl}
                            </code>
                            <button
                              type="button"
                              onClick={() => copyWebhookUrl(integration.id, integration.webhookUrl!)}
                              className="text-ds-muted hover:text-[#E50914] flex-shrink-0 mt-0.5"
                              title="Copiar URL"
                            >
                              {copiedId === integration.id ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/dashboard/integrations/${integration.platform}?id=${integration.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#E50914] border border-[#E50914]/30 rounded-lg hover:bg-[#E50914]/5 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(integration.id)}
                        disabled={deletingId === integration.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingId === integration.id ? 'Removendo…' : 'Remover'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-ds-card border border-ds-border rounded-lg overflow-hidden">
          {webhookLogs.length === 0 ? (
            <p className="text-center py-16 text-ds-secondary px-4">
              Nenhum webhook recebido ainda. Configure a integração e cadastre a URL no Hotmart.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ds-border bg-gray-50">
                    <th className="text-left px-4 py-3 font-semibold text-ds-secondary">Data</th>
                    <th className="text-left px-4 py-3 font-semibold text-ds-secondary">Plataforma</th>
                    <th className="text-left px-4 py-3 font-semibold text-ds-secondary">Evento</th>
                    <th className="text-left px-4 py-3 font-semibold text-ds-secondary">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-ds-secondary">Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {webhookLogs.map((log) => {
                    const platform = getPlatformBySlug(log.platform)
                    return (
                      <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50/50 align-top">
                        <td className="px-4 py-3 text-ds-secondary whitespace-nowrap">
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td className="px-4 py-3 font-medium text-ds-primary">
                          {platform?.name ?? log.platform}
                        </td>
                        <td className="px-4 py-3 text-ds-secondary">{log.eventType || '—'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              log.status === 'received'
                                ? 'bg-green-100 text-green-700'
                                : log.status === 'failed'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-ds-surface text-ds-secondary'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-ds-secondary font-mono text-xs max-w-md break-all">
                          {formatPayloadPreview(log.payload)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
