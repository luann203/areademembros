'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  ExternalLink,
} from 'lucide-react'
import type { AdminCourseDetail, CategoryRecord } from '@/types/admin'

type AdminEditCourseViewProps = {
  course: AdminCourseDetail
  categories: CategoryRecord[]
}

export default function AdminEditCourseView({ course: initialCourse, categories }: AdminEditCourseViewProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [course, setCourse] = useState(initialCourse)
  const [title, setTitle] = useState(initialCourse.title)
  const [salesPageUrl, setSalesPageUrl] = useState(initialCourse.salesPageUrl ?? '')
  const [description, setDescription] = useState(initialCourse.description)
  const [categoryId, setCategoryId] = useState(initialCourse.categoryId ?? '')
  const [imageUrl, setImageUrl] = useState(initialCourse.imageUrl)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  const [moduleTitle, setModuleTitle] = useState('')
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [editingModuleTitle, setEditingModuleTitle] = useState('')
  const [openModuleIds, setOpenModuleIds] = useState<Set<string>>(
    new Set(initialCourse.modules.map((m) => m.id))
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const toggleModule = (id: string) => {
    setOpenModuleIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const refreshCourse = async () => {
    const res = await fetch(`/api/admin/courses/${course.id}`)
    if (!res.ok) return
    const data = await res.json()
    setCourse(data)
    setOpenModuleIds(new Set(data.modules.map((m: { id: string }) => m.id)))
    router.refresh()
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      let nextImageUrl = imageUrl

      if (coverFile) {
        const formData = new FormData()
        formData.append('cover', coverFile)
        const coverRes = await fetch('/api/admin/courses/cover', {
          method: 'POST',
          body: formData,
        })
        if (!coverRes.ok) {
          const data = await coverRes.json()
          throw new Error(data.error || 'Failed to upload cover.')
        }
        const coverData = await coverRes.json()
        nextImageUrl = coverData.imageUrl
        setImageUrl(nextImageUrl)
        setCoverFile(null)
        setCoverPreview(null)
      }

      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          salesPageUrl,
          categoryId: categoryId || null,
          imageUrl: nextImageUrl,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save course.')
      }

      setSuccess('Curso salvo com sucesso!')
      await refreshCourse()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!moduleTitle.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/courses/${course.id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: moduleTitle }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create module.')
      }
      setModuleTitle('')
      setSuccess('Módulo criado!')
      await refreshCourse()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateModule = async (moduleId: string) => {
    if (!editingModuleTitle.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/modules/${moduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingModuleTitle }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update module.')
      }
      setEditingModuleId(null)
      setSuccess('Módulo atualizado!')
      await refreshCourse()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Excluir este módulo e todas as aulas dentro dele?')) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/modules/${moduleId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete module.')
      }
      setSuccess('Módulo excluído.')
      await refreshCourse()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
    } finally {
      setLoading(false)
    }
  }

  const coverDisplay = coverPreview || imageUrl

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="ds-label mb-2">Prohub.</p>
          <h1 className="ds-page-title text-2xl sm:text-3xl">Edit course</h1>
          <p className="text-sm text-ds-secondary mt-2">{course.title}</p>
        </div>
        <Link
          href={`/dashboard/courses/${course.id}`}
          className="ds-btn-secondary self-start text-sm"
          target="_blank"
        >
          <ExternalLink className="w-4 h-4" />
          View as student
        </Link>
      </header>

      {(success || error) && (
        <div className="space-y-2">
          {success && (
            <p className="text-sm text-green-400 border border-green-500/30 bg-green-500/10 rounded-lg px-4 py-3">
              {success}
            </p>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-10 items-start">
        {/* Coluna esquerda — Course details */}
        <section className="space-y-5">
          <div>
            <h2 className="ds-section-title mb-2">Course details</h2>
            <p className="text-sm text-ds-secondary leading-relaxed">
              Atualize nome, descrição, categoria e configurações do curso.
            </p>
          </div>

          <form onSubmit={handleSaveCourse} className="ds-card p-6 space-y-5">
            <div>
              <label className="ds-label block mb-2">Course name</label>
              <input className="ds-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <label className="ds-label block mb-2">Sales page URL</label>
              <input className="ds-input" type="url" value={salesPageUrl} onChange={(e) => setSalesPageUrl(e.target.value)} />
            </div>

            <div>
              <label className="ds-label block mb-2">Description</label>
              <textarea
                className="ds-input min-h-[120px] resize-y"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="ds-label block mb-2">Course cover</label>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleCoverChange} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border border-dashed border-ds-border rounded-lg p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
              >
                {coverDisplay ? (
                  <div className="relative w-16 h-24 rounded overflow-hidden shrink-0">
                    <Image src={coverDisplay} alt="Cover" fill className="object-cover" unoptimized={!!coverPreview} />
                  </div>
                ) : (
                  <Upload className="w-6 h-6 text-ds-muted shrink-0" />
                )}
                <span className="text-sm text-ds-secondary">Clique para trocar a capa do curso</span>
              </button>
            </div>

            <div>
              <label className="ds-label block mb-2">Category</label>
              <select className="ds-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="ds-btn-brand w-full sm:w-auto" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save course'}
            </button>
          </form>
        </section>

        {/* Coluna direita — Modules & lessons */}
        <section className="space-y-5">
          <div>
            <h2 className="ds-section-title mb-2">Modules & lessons</h2>
            <p className="text-sm text-ds-secondary leading-relaxed">
              Crie módulos e adicione aulas com título, descrição e vídeo.
            </p>
          </div>

          <div className="space-y-4">
            <form onSubmit={handleCreateModule} className="ds-card p-4 flex gap-3">
              <input
                className="ds-input flex-1"
                placeholder="Nome do novo módulo (ex: Theory, Practice)"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
              />
              <button type="submit" className="ds-btn-brand shrink-0" disabled={loading}>
                <Plus className="w-4 h-4" />
                Add module
              </button>
            </form>

            {course.modules.length === 0 ? (
              <div className="ds-card px-6 py-10 text-center text-sm text-ds-secondary">
                Nenhum módulo ainda. Crie o primeiro acima.
              </div>
            ) : (
              <div className="space-y-3">
                {course.modules.map((module) => {
                  const isOpen = openModuleIds.has(module.id)
                  return (
                    <div key={module.id} className="ds-card overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-ds-border">
                        <button type="button" onClick={() => toggleModule(module.id)} className="p-1 text-ds-muted">
                          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>

                        {editingModuleId === module.id ? (
                          <div className="flex flex-1 gap-2 min-w-0">
                            <input
                              className="ds-input flex-1 min-w-0"
                              value={editingModuleTitle}
                              onChange={(e) => setEditingModuleTitle(e.target.value)}
                              autoFocus
                            />
                            <button type="button" className="ds-btn-primary text-xs px-3 shrink-0" onClick={() => handleUpdateModule(module.id)} disabled={loading}>
                              Save
                            </button>
                            <button type="button" className="ds-btn-secondary text-xs px-3 shrink-0" onClick={() => setEditingModuleId(null)}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 font-semibold text-sm text-white truncate">{module.title}</span>
                            <button
                              type="button"
                              className="p-2 text-ds-secondary hover:text-white shrink-0"
                              onClick={() => {
                                setEditingModuleId(module.id)
                                setEditingModuleTitle(module.title)
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="p-2 text-ds-secondary hover:text-red-400 shrink-0"
                              onClick={() => handleDeleteModule(module.id)}
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>

                      {isOpen && (
                        <div className="divide-y divide-ds-border">
                          {module.lessons.map((lesson, index) => (
                            <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 pl-10">
                              <span className="flex-1 text-sm text-white min-w-0 truncate">
                                AULA {String(index + 1).padStart(2, '0')} — {lesson.title}
                              </span>
                              <Link
                                href={`/dashboard/admin/courses/${course.id}/lessons/${lesson.id}`}
                                className="ds-btn-secondary text-xs px-3 py-1.5 shrink-0"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                Edit
                              </Link>
                            </div>
                          ))}
                          <div className="px-4 py-3 pl-10">
                            <Link
                              href={`/dashboard/admin/courses/${course.id}/lessons/new?moduleId=${module.id}`}
                              className="inline-flex items-center gap-2 text-sm text-brand hover:underline"
                            >
                              <Plus className="w-4 h-4" />
                              Add lesson
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
