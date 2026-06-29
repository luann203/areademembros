'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Upload, Loader2, CheckCircle2 } from 'lucide-react'
import type { CategoryRecord } from '@/types/admin'

type AdminNewCourseFormProps = {
  categories: CategoryRecord[]
}

export default function AdminNewCourseForm({ categories }: AdminNewCourseFormProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [salesPageUrl, setSalesPageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ title: string; id: string } | null>(null)

  const resetForm = () => {
    setTitle('')
    setSalesPageUrl('')
    setDescription('')
    setCategoryId('')
    setCoverPreview(null)
    setCoverFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(null)
    setLoading(true)

    try {
      let imageUrl: string | null = null

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
        imageUrl = coverData.imageUrl
      }

      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          salesPageUrl,
          categoryId: categoryId || null,
          imageUrl,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create course.')
      }

      const course = await res.json()
      const createdTitle = course.title || title.trim()
      resetForm()
      setSuccess({ title: createdTitle, id: course.id })
      router.refresh()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-12">
      <div>
        <h2 className="ds-section-title mb-3">Course details</h2>
        <p className="text-sm text-ds-secondary leading-relaxed">
          Choose an attractive name, insert the URL of the sales page, describe the unique
          promise of the course in a clear and impactful way.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="ds-card p-6 space-y-5">
        {success && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-300">Curso criado com sucesso!</p>
              <p className="text-sm text-green-200/90 mt-1">
                <strong>{success.title}</strong> foi cadastrado. Agora adicione módulos e aulas na
                página de edição.
              </p>
              <Link
                href={`/dashboard/admin/courses/${success.id}/edit`}
                className="inline-flex mt-3 text-sm font-semibold text-green-300 hover:text-green-200 underline"
              >
                Editar curso e adicionar aulas →
              </Link>
            </div>
          </div>
        )}

        <div>
          <label className="ds-label block mb-2">Course name</label>
          <input
            className="ds-input"
            placeholder="Choose a name that attracts your buyers"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="ds-label block mb-2">Sales page URL</label>
          <input
            className="ds-input"
            type="url"
            placeholder="https://meusite.com.br/landing-page"
            value={salesPageUrl}
            onChange={(e) => setSalesPageUrl(e.target.value)}
          />
        </div>

        <div>
          <label className="ds-label block mb-2">Describe your course expectations</label>
          <textarea
            className="ds-input min-h-[120px] resize-y"
            placeholder="Explain your product and its benefits clearly and briefly."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="ds-label block mb-2">Cover image</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleCoverChange}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border border-dashed border-ds-border rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-colors"
          >
            {coverPreview ? (
              <div className="relative w-full max-w-[200px] aspect-[708/1494] rounded-lg overflow-hidden">
                <Image src={coverPreview} alt="Cover preview" fill className="object-cover" />
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-ds-muted" />
                <span className="text-sm text-ds-secondary">
                  Click to upload course cover (JPG, PNG, WEBP — max 5MB)
                </span>
              </>
            )}
          </button>
        </div>

        <div>
          <label className="ds-label block mb-2">Category in showcase</label>
          <select
            className="ds-input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="pt-2">
          <button type="submit" className="ds-btn-brand w-full sm:w-auto" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create course'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
