'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ds-bg p-4">
      <div className="ds-card p-8 max-w-md text-center">
        <h2 className="ds-page-title text-2xl mb-3">Algo deu errado</h2>
        <p className="text-ds-secondary text-sm mb-6">
          {error.message || 'Ocorreu um erro inesperado.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button type="button" onClick={() => reset()} className="ds-btn-brand">
            Tentar novamente
          </button>
          <Link href="/login" className="ds-btn-secondary">
            Ir para login
          </Link>
        </div>
      </div>
    </div>
  )
}
