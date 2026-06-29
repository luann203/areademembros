'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import type { AdminCourseListItem } from '@/types/admin'

type AdminCoursesListProps = {
  courses: AdminCourseListItem[]
}

export default function AdminCoursesList({ courses: initialCourses }: AdminCoursesListProps) {
  const router = useRouter()
  const [courses, setCourses] = useState(initialCourses)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const deleteCourse = async (id: string, title: string) => {
    if (!confirm(`Excluir o curso "${title}" permanentemente? Todas as aulas e matrículas serão removidas.`)) {
      return
    }

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete course.')
      }
      setCourses((prev) => prev.filter((course) => course.id !== id))
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete course.')
    } finally {
      setDeletingId(null)
    }
  }
  return (
    <div className="ds-card overflow-hidden">
      <div className="px-6 py-4 border-b border-ds-border flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-white">
          {courses.length} course{courses.length === 1 ? '' : 's'}
        </h2>
        <Link href="/dashboard/admin/courses/new" className="ds-btn-brand text-xs px-4 py-2">
          <Plus className="w-4 h-4" />
          New course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-ds-secondary">
          No courses yet.{' '}
          <Link href="/dashboard/admin/courses/new" className="text-brand hover:underline">
            Create your first course
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-ds-border">
          {courses.map((course) => (
            <li key={course.id} className="px-6 py-4 flex items-center gap-4">
              <div className="w-12 h-16 rounded-md overflow-hidden bg-white/5 shrink-0 relative">
                {course.imageUrl ? (
                  <Image src={course.imageUrl} alt="" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-ds-muted">
                    —
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{course.title}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/dashboard/admin/courses/${course.id}/edit`}
                  className="ds-btn-secondary text-xs px-4 py-2"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => deleteCourse(course.id, course.title)}
                  disabled={deletingId === course.id}
                  className="inline-flex items-center justify-center p-2 rounded-full border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                  aria-label={`Delete ${course.title}`}
                >
                  {deletingId === course.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
