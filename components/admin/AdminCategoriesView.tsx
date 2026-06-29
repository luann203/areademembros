'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Pencil, Trash2, Plus } from 'lucide-react'
import type { CategoryRecord } from '@/types/admin'

type AdminCategoriesViewProps = {
  initialCategories: CategoryRecord[]
}

export default function AdminCategoriesView({ initialCategories }: AdminCategoriesViewProps) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create category.')
      }
      const category = await res.json()
      setCategories((prev) => [...prev, category])
      setName('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update category.')
      }
      const updated = await res.json()
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
      setEditingId(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Courses will be unlinked.')) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete category.')
      }
      setCategories((prev) => prev.filter((c) => c.id !== id))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-12">
      <div>
        <h2 className="ds-section-title mb-3">Showcase categories</h2>
        <p className="text-sm text-ds-secondary leading-relaxed">
          Organize your courses into categories displayed on the student home page.
        </p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleCreate} className="ds-card p-6">
          <label className="ds-label block mb-2">New category</label>
          <div className="flex gap-3">
            <input
              className="ds-input flex-1"
              placeholder="e.g. Expert, Beginner, Advanced"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button type="submit" className="ds-btn-brand shrink-0" disabled={loading}>
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </form>

        <div className="ds-card overflow-hidden">
          <div className="px-6 py-4 border-b border-ds-border">
            <h3 className="text-sm font-semibold text-white">
              {categories.length} categor{categories.length === 1 ? 'y' : 'ies'}
            </h3>
          </div>
          <ul className="divide-y divide-ds-border">
            {categories.length === 0 && (
              <li className="px-6 py-8 text-center text-sm text-ds-secondary">
                No categories yet. Create your first one above.
              </li>
            )}
            {categories.map((category) => (
              <li key={category.id} className="px-6 py-4 flex items-center gap-4">
                {editingId === category.id ? (
                  <>
                    <input
                      className="ds-input flex-1"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="ds-btn-primary text-xs px-4 py-2"
                      onClick={() => handleUpdate(category.id)}
                      disabled={loading}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="ds-btn-secondary text-xs px-4 py-2"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{category.name}</p>
                      <p className="text-xs text-ds-muted mt-0.5">
                        {category.slug} · {category._count?.courses ?? 0} course(s)
                      </p>
                    </div>
                    <button
                      type="button"
                      className="p-2 text-ds-secondary hover:text-white"
                      onClick={() => {
                        setEditingId(category.id)
                        setEditName(category.name)
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="p-2 text-ds-secondary hover:text-red-400"
                      onClick={() => handleDelete(category.id)}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {loading && (
          <p className="text-sm text-ds-secondary flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </p>
        )}
      </div>
    </div>
  )
}
