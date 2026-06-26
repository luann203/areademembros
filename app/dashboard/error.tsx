'use client'

import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <div className="ds-card p-6 max-w-lg">
        <h2 className="ds-section-title mb-2">Erro ao carregar esta página</h2>
        <p className="text-ds-secondary text-sm mb-6">
          {error.message || 'Algo deu errado ao abrir esta seção.'}
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => reset()} className="ds-btn-brand">
            Tentar novamente
          </button>
          <Link href="/dashboard" className="ds-btn-secondary">
            Voltar para Contents
          </Link>
        </div>
      </div>
    </div>
  )
}
