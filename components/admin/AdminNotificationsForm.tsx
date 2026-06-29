'use client'

import { useState } from 'react'
import { Loader2, Send, X } from 'lucide-react'

const TARGET_LABELS: Record<'students' | 'all', string> = {
  students: 'All students',
  all: 'All users (including admins)',
}

export default function AdminNotificationsForm() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState<'students' | 'all'>('students')
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [success, setSuccess] = useState<number | null>(null)
  const [error, setError] = useState('')

  const sendNotification = async () => {
    setError('')
    setSuccess(null)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, target }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send notifications.')
      }

      const data = await res.json()
      setSuccess(data.sent)
      setTitle('')
      setMessage('')
      setConfirmOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
      setConfirmOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(null)
    setConfirmOpen(true)
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-12">
      <div>
        <h2 className="ds-section-title mb-3">Send notification</h2>
        <p className="text-sm text-ds-secondary leading-relaxed">
          Broadcast a message to your students. They will see it in the notification bell
          on their dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="ds-card p-6 space-y-5">
        <div>
          <label className="ds-label block mb-2">Recipients</label>
          <select
            className="ds-input"
            value={target}
            onChange={(e) => setTarget(e.target.value as 'students' | 'all')}
          >
            <option value="students">All students</option>
            <option value="all">All users (including admins)</option>
          </select>
        </div>

        <div>
          <label className="ds-label block mb-2">Title</label>
          <input
            className="ds-input"
            placeholder="Notification title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="ds-label block mb-2">Message</label>
          <textarea
            className="ds-input min-h-[140px] resize-y"
            placeholder="Write your message to students..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success !== null && (
          <p className="text-sm text-green-400">
            Notification sent to {success} user{success === 1 ? '' : 's'}.
          </p>
        )}

        <button type="submit" className="ds-btn-brand" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send notification
            </>
          )}
        </button>
      </form>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !loading && setConfirmOpen(false)}
          />
          <div
            className="relative ds-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-notification-title"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-ds-border">
              <h3 id="confirm-notification-title" className="ds-section-title text-base">
                Confirmar envio
              </h3>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
                className="p-2 rounded-ds-md text-ds-muted hover:bg-white/5 hover:text-ds-primary transition-colors disabled:opacity-50"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-ds-secondary">
                Revise a notificação antes de enviar. Ela será exibida no sino do dashboard dos
                destinatários.
              </p>

              <div>
                <p className="ds-label mb-1">Destinatários</p>
                <p className="text-sm text-ds-primary">{TARGET_LABELS[target]}</p>
              </div>

              <div>
                <p className="ds-label mb-1">Título</p>
                <p className="text-sm font-medium text-ds-primary">{title}</p>
              </div>

              <div>
                <p className="ds-label mb-1">Mensagem</p>
                <p className="text-sm text-ds-secondary whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-ds-border">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
                className="flex-1 ds-btn-secondary justify-center disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={sendNotification}
                disabled={loading}
                className="flex-1 ds-btn-brand justify-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Confirmar envio
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
