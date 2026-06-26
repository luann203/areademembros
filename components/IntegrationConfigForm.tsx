'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play, Copy, Check } from 'lucide-react'
import PlatformLogo from '@/components/PlatformLogo'
import type { IntegrationPlatform, IntegrationModality, IntegrationRecord } from '@/types/integration'

type Course = { id: string; title: string }

type IntegrationConfigFormProps = {
  platform: IntegrationPlatform
  courses: Course[]
  existing?: IntegrationRecord | null
}

const HOTMART_INSTRUCTIONS =
  'Entre na sua conta do Hotmart e clique em Ferramentas > Webhook (API e Notificações), depois crie uma nova configuração de acordo com o curso que você quer vender. No painel direito do Hotmart, marque todos os eventos, em seguida, gere uma URL de notificação abaixo e cadastre no Hotmart.'

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
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl">
      <header className="flex items-center justify-between mb-8 gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
            Prohub.
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#212529]">{platform.name}</h1>
        </div>
        <Link
          href="/dashboard/integrations"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-ds-border rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <aside className="space-y-4">
          <div className="bg-ds-card border border-ds-border rounded-lg p-6 flex items-center justify-center h-40">
            <PlatformLogo platform={platform} size="lg" />
          </div>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 border border-ds-border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Play className="w-4 h-4" />
            Ver como funciona
          </button>
        </aside>

        <div className="bg-ds-card border border-ds-border rounded-lg p-6 sm:p-8">
          <p className="text-gray-600 text-sm leading-relaxed mb-8">{HOTMART_INSTRUCTIONS}</p>

          <div className="space-y-5">
            <div>
              <label htmlFor="config-name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome da configuração
              </label>
              <input
                id="config-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E50914]/30 focus:border-[#E50914] outline-none"
                placeholder={`Minha integração ${platform.name}`}
              />
            </div>

            <div>
              <label htmlFor="config-token" className="block text-sm font-medium text-gray-700 mb-2">
                Token {platform.name}
              </label>
              <input
                id="config-token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E50914]/30 focus:border-[#E50914] outline-none"
              />
            </div>

            <div>
              <label htmlFor="config-offer" className="block text-sm font-medium text-gray-700 mb-2">
                ID da oferta {platform.name}
              </label>
              <input
                id="config-offer"
                type="text"
                value={offerId}
                onChange={(e) => setOfferId(e.target.value)}
                placeholder="Exemplo: gcc42kqj"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E50914]/30 focus:border-[#E50914] outline-none"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Deixe em branco, preencha apenas em casos especiais.
              </p>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">Modalidade</span>
              <div className="flex flex-wrap gap-2">
                {(['courses', 'subscription', 'unlimited'] as IntegrationModality[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setModality(m)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      modality === m
                        ? 'bg-[#E50914]/10 border-[#E50914] text-[#E50914]'
                        : 'border-ds-border text-gray-600 hover:border-gray-300'
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
                <span className="block text-sm font-medium text-gray-700 mb-2">
                  Selecionar cursos vinculados
                </span>
                <div className="border border-ds-border rounded-lg divide-y divide-gray-100 max-h-48 overflow-y-auto">
                  {courses.map((course) => (
                    <label
                      key={course.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course.id)}
                        onChange={() => toggleCourse(course.id)}
                        className="rounded border-gray-300 text-[#E50914] focus:ring-[#E50914]"
                      />
                      <span className="text-sm text-gray-700">{course.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            {saved && webhookUrl && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 mb-2">
                  URL de notificação {isEditing ? 'atualizada' : 'gerada'} com sucesso!
                </p>
                <div className="flex items-start gap-2">
                  <code className="flex-1 text-xs bg-ds-card border border-green-200 rounded px-3 py-2 break-all">
                    {webhookUrl}
                  </code>
                  <button
                    type="button"
                    onClick={copyUrl}
                    className="flex-shrink-0 p-2 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                    title="Copiar URL"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <Link
                  href="/dashboard/integrations?tab=installed"
                  className="inline-block mt-4 text-sm font-medium text-[#E50914] hover:underline"
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
                className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm transition-colors hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#E50914' }}
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
