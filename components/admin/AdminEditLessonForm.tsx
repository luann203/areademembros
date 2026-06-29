'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ExternalLink, Loader2, Trash2 } from 'lucide-react'
import type { AdminLessonRecord, AdminModuleRecord } from '@/types/admin'

type AdminEditLessonFormProps = {
  courseId: string
  courseTitle: string
  modules: AdminModuleRecord[]
  lesson?: AdminLessonRecord
  defaultModuleId?: string
  isNew?: boolean
}

export default function AdminEditLessonForm({
  courseId,
  courseTitle,
  modules,
  lesson,
  defaultModuleId,
  isNew = false,
}: AdminEditLessonFormProps) {
  const router = useRouter()

  const [title, setTitle] = useState(lesson?.title ?? '')
  const [moduleId, setModuleId] = useState(lesson?.moduleId ?? defaultModuleId ?? modules[0]?.id ?? '')
  const [description, setDescription] = useState(lesson?.description ?? '')
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl ?? '')
  const [duration, setDuration] = useState(lesson?.duration?.toString() ?? '')
  const [showFooter, setShowFooter] = useState(lesson?.showFooter ?? true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const lessonId = lesson?.id
  const editUrl = `/dashboard/admin/courses/${courseId}/edit`
  const studentUrl = lessonId ? `/dashboard/courses/${courseId}/lessons/${lessonId}` : null

  const saveLesson = async (createAnother = false) => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const payload = {
        title,
        description,
        videoUrl,
        duration: duration ? Number(duration) : null,
        moduleId,
        showFooter,
      }

      const url = isNew
        ? `/api/admin/modules/${moduleId}/lessons`
        : `/api/admin/lessons/${lessonId}`

      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save lesson.')
      }

      const saved = await res.json()

      if (createAnother && isNew) {
        setTitle('')
        setDescription('')
        setVideoUrl('')
        setDuration('')
        setShowFooter(true)
        setSuccess('Aula criada! Você pode adicionar outra abaixo.')
        router.refresh()
        return
      }

      if (isNew) {
        router.push(`/dashboard/admin/courses/${courseId}/lessons/${saved.id}?created=1`)
        router.refresh()
        return
      }

      setSuccess('Aula salva com sucesso!')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!lessonId || !confirm('Excluir esta aula permanentemente?')) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete lesson.')
      }
      router.push(editUrl)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="ds-label mb-2">Prohub.</p>
          <h1 className="ds-page-title text-2xl sm:text-3xl">
            {isNew ? 'New lesson' : 'Edit lesson'}
          </h1>
          <p className="text-sm text-ds-secondary mt-2">{courseTitle}</p>
        </div>
        {studentUrl && (
          <Link href={studentUrl} className="ds-btn-secondary self-start text-sm" target="_blank">
            <ExternalLink className="w-4 h-4" />
            View as student
          </Link>
        )}
      </header>

      <div className="ds-card p-6 space-y-5">
        {success && (
          <p className="text-sm text-green-400 border border-green-500/30 bg-green-500/10 rounded-lg px-4 py-3">
            {success}
          </p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}

        <div>
          <label className="ds-label block mb-2">Title</label>
          <input
            className="ds-input"
            placeholder="AULA 01 - INTRODUCTION"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="ds-label block mb-2">Module</label>
          <select className="ds-input" value={moduleId} onChange={(e) => setModuleId(e.target.value)} required>
            {modules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4 rounded-lg border border-ds-border bg-ds-surface/40 p-4 sm:p-5">
          <div>
            <label className="ds-label block mb-2">Video URL</label>
            <input
              className="ds-input"
              type="url"
              placeholder="https://player-vz-....pandavideo.com.br/embed/?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <p className="text-xs text-ds-muted mt-2">
              Suporta Panda Video, YouTube e outros links compatíveis com o player.
            </p>
          </div>

          <div>
            <label className="ds-label block mb-2">Duration (minutes)</label>
            <input
              className="ds-input w-32"
              type="number"
              min={0}
              placeholder="10"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div>
            <label className="ds-label block mb-2">Lesson content</label>
            <textarea
              className="ds-input min-h-[280px] resize-y font-mono text-sm leading-relaxed"
              placeholder="Descreva o conteúdo da aula. Use parágrafos e links conforme necessário."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="ds-label block mb-2">Rodapé da aula</label>
          <button
            type="button"
            onClick={() => setShowFooter((value) => !value)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              showFooter
                ? 'border-brand bg-brand/15 text-white'
                : 'border-ds-border bg-transparent text-ds-secondary hover:text-white hover:border-white/30'
            }`}
            aria-pressed={showFooter}
          >
            Adicionar rodapé
          </button>
          <p className="text-xs text-ds-muted mt-2">
            Exibe a imagem padrão e o aviso legal ao final do conteúdo da aula.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-ds-border">
        <div>
          {!isNew && lessonId && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 text-sm text-red-400 border border-red-500/40 rounded-full px-4 py-2 hover:bg-red-500/10"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href={editUrl} className="text-sm text-ds-secondary hover:text-white px-2">
            Cancel
          </Link>
          {isNew && (
            <button
              type="button"
              className="ds-btn-secondary"
              disabled={loading || !title.trim() || !moduleId}
              onClick={() => saveLesson(true)}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save and create another'}
            </button>
          )}
          <button
            type="button"
            className="ds-btn-brand"
            disabled={loading || !title.trim() || !moduleId}
            onClick={() => saveLesson(false)}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
