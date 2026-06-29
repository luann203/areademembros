'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import PlatformLogo from '@/components/PlatformLogo'
import type { IntegrationPlatform, IntegrationModality, IntegrationRecord } from '@/types/integration'

type Course = { id: string; title: string }

type IntegrationConfigFormProps = {
  platform: IntegrationPlatform
  courses: Course[]
  existing?: IntegrationRecord | null
}

const HOTMART_INSTRUCTIONS =
  'Entre na sua conta do Hotmart e clique em Ferramentas > Webhook (API e Notificações), depois crie uma nova configuração. Marque os eventos de compra aprovada (PURCHASE_APPROVED / PURCHASE_COMPLETE) e também reembolso/cancelamento (PURCHASE_REFUNDED / PURCHASE_CANCELED). Gere a URL abaixo e cadastre na Hotmart. Compra aprovada: o aluno é criado, matriculado nos cursos selecionados e recebe a senha na área de notificações. Reembolso ou cancelamento: a matrícula nesses cursos é removida automaticamente.'

function parseCourseIds(value: string): string[] {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

export default function IntegrationConfigForm({
  platform,
  courses,
  existing = null,
}: IntegrationConfigFormProps) {
  const router = useRouter()
  const isEditing = Boolean(existing)

  const [name, setName] = useState(existing?.name ?? '')
  const [token, setToken] = useState(existing?.token ?? '')
  const [offerId, setOfferId] = useState(existing?.offerId ?? '')
  const [modality, setModality] = useState<IntegrationModality>(
    (existing?.modality as IntegrationModality) || 'courses'
  )
  const [selectedCourses, setSelectedCourses] = useState<string[]>(
    existing ? parseCourseIds(existing.courseIds) : []
  )
  const [webhookUrl, setWebhookUrl] = useState<string | null>(existing?.webhookUrl ?? null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(isEditing)

  const toggleCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    )
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('O nome da configuração é obrigatório.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const payload = {
        platform: platform.slug,
        name: name.trim(),
        token: token.trim() || undefined,
        offerId: offerId.trim() || undefined,
        modality,
        courseIds: selectedCourses,
      }

      const res = await fetch(
        isEditing ? `/api/integrations/${existing!.id}` : '/api/integrations',
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Não foi possível salvar a integração.')
      }

      const integration = await res.json()
      setWebhookUrl(integration.webhookUrl)
      setSaved(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo deu errado.')
    } finally {
      setLoading(false)
    }
  }

  const copyUrl = async () => {
    if (!webhookUrl) return
    try {
      await navigator.clipboard.writeText(webhookUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Não foi possível copiar a URL.')
    }
  }

  return (
    <div className="ds-page-shell max-w-5xl">
      <header className="flex items-center justify-between mb-8 gap-4">
        <div>
          <p className="ds-label mb-2">Prohub.</p>
          <h1 className="ds-page-title text-2xl sm:text-3xl">{platform.name}</h1>
        </div>
        <Link href="/dashboard/integrations" className="ds-btn-secondary flex-shrink-0">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <aside>
          <div className="ds-card p-6 flex items-center justify-center h-40">
            <PlatformLogo platform={platform} size="lg" />
          </div>
        </aside>

        <div className="ds-card p-6 sm:p-8">
          <p className="text-ds-secondary text-sm leading-relaxed mb-8">{HOTMART_INSTRUCTIONS}</p>

          <div className="space-y-5">
            <div>
              <label htmlFor="config-name" className="ds-label block mb-2">
                Nome da configuração
              </label>
              <input
                id="config-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="ds-input"
                placeholder={`Minha integração ${platform.name}`}
              />
            </div>

            <div>
              <label htmlFor="config-token" className="ds-label block mb-2">
                Token {platform.name}
              </label>
              <input
                id="config-token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="ds-input"
              />
            </div>

            <div>
              <label htmlFor="config-offer" className="ds-label block mb-2">
                ID da oferta {platform.name}
              </label>
              <input
                id="config-offer"
                type="text"
                value={offerId}
                onChange={(e) => setOfferId(e.target.value)}
                placeholder="Exemplo: gcc42kqj"
                className="ds-input"
              />
              <p className="text-xs text-ds-muted mt-1.5">
                Deixe em branco, preencha apenas em casos especiais.
              </p>
            </div>

            <div>
              <span className="ds-label block mb-2">Modalidade</span>
              <div className="flex flex-wrap gap-2">
                {(['courses', 'subscription', 'unlimited'] as IntegrationModality[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setModality(m)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      modality === m
                        ? 'bg-brand/10 border-brand text-white'
                        : 'border-ds-border text-ds-secondary hover:text-white hover:border-white/20'
                    }`}
                  >
                    {m === 'courses'
                      ? 'Cursos'
                      : m === 'subscription'
                        ? 'Assinatura'
                        : 'Acesso ilimitado'}
                  </button>
                ))}
              </div>
            </div>

            {courses.length > 0 && (
              <div>
                <span className="ds-label block mb-2">Selecionar cursos vinculados</span>
                <div className="border border-ds-border rounded-lg divide-y divide-ds-border max-h-48 overflow-y-auto">
                  {courses.map((course) => (
                    <label
                      key={course.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course.id)}
                        onChange={() => toggleCourse(course.id)}
                        className="rounded border-ds-border text-brand focus:ring-brand"
                      />
                      <span className="text-sm text-white">{course.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            {saved && webhookUrl && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                <p className="text-sm font-medium text-green-300 mb-2">
                  URL de notificação {isEditing ? 'atualizada' : 'gerada'} com sucesso!
                </p>
                <div className="flex items-start gap-2">
                  <code className="flex-1 text-xs text-ds-secondary bg-ds-surface border border-ds-border rounded px-3 py-2 break-all">
                    {webhookUrl}
                  </code>
                  <button
                    type="button"
                    onClick={copyUrl}
                    className="flex-shrink-0 p-2 text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                    title="Copiar URL"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <Link
                  href="/dashboard/integrations?tab=installed"
                  className="inline-block mt-4 text-sm font-medium text-brand hover:underline"
                >
                  Ver em Integrações instaladas →
                </Link>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="ds-btn-brand disabled:opacity-50"
              >
                {loading
                  ? 'Salvando…'
                  : saved
                    ? 'Atualizar integração'
                    : 'Gerar URL de notificação'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
