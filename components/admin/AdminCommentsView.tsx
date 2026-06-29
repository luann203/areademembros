'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check,
  Eye,
  Loader2,
  MessageSquare,
  Search,
  ThumbsDown,
  Trash2,
  X,
} from 'lucide-react'
import type { AdminCommentRecord } from '@/types/admin'

type Tab = 'unread' | 'approved' | 'rejected' | 'pending'

type CourseOption = { id: string; title: string }
type LessonOption = { id: string; title: string; courseId: string }

type AdminCommentsViewProps = {
  courses: CourseOption[]
  lessons: LessonOption[]
  initialTab: Tab
  initialComments: AdminCommentRecord[]
  initialCounts: { unread: number; approved: number; rejected: number; pending: number }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function AdminCommentsView({
  courses,
  lessons,
  initialTab,
  initialComments,
  initialCounts,
}: AdminCommentsViewProps) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>(initialTab)
  const [comments, setComments] = useState(initialComments)
  const [counts, setCounts] = useState(initialCounts)
  const [courseId, setCourseId] = useState('')
  const [lessonId, setLessonId] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'pending', label: 'Pending approval', count: counts.pending },
    { id: 'unread', label: 'Unread', count: counts.unread },
    { id: 'approved', label: 'Approved', count: counts.approved },
    { id: 'rejected', label: 'Rejected', count: counts.rejected },
  ]

  const filteredLessons = courseId
    ? lessons.filter((l) => l.courseId === courseId)
    : lessons

  const loadComments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ tab })
      if (courseId) params.set('courseId', courseId)
      if (lessonId) params.set('lessonId', lessonId)
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`/api/admin/comments?${params}`)
      if (!res.ok) return
      const data = await res.json()
      setComments(data.comments)
      setCounts(data.counts)
    } finally {
      setLoading(false)
    }
  }, [tab, courseId, lessonId, search])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const setActiveTab = (next: Tab) => {
    setTab(next)
    router.replace(`/dashboard/admin/comments?tab=${next}`, { scroll: false })
  }

  const updateComment = async (id: string, body: Record<string, unknown>) => {
    setActionId(id)
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) return
      await loadComments()
    } finally {
      setActionId(null)
    }
  }

  const deleteComment = async (id: string) => {
    if (!confirm('Delete this comment permanently?')) return
    setActionId(id)
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
      if (!res.ok) return
      await loadComments()
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="ds-page-shell">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <p className="ds-label mb-2">Prohub.</p>
          <h1 className="ds-page-title text-2xl sm:text-3xl">Comments</h1>
        </div>
        <div className="ds-search w-full sm:w-72">
          <Search className="w-4 h-4 shrink-0" />
          <input
            placeholder="Search comment"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="flex flex-wrap gap-6 border-b border-ds-border mb-6">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              tab === item.id
                ? 'border-purple-500 text-white'
                : 'border-transparent text-ds-secondary hover:text-white'
            }`}
          >
            {item.label}{' '}
            <span
              className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                tab === item.id ? 'bg-purple-500/20 text-purple-300' : 'bg-white/10'
              }`}
            >
              {item.count}
            </span>
          </button>
        ))}
      </div>

      <div className="ds-card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-ds-border flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap gap-3">
            <select
              className="ds-input w-auto min-w-[140px]"
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value)
                setLessonId('')
              }}
            >
              <option value="">All courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <select
              className="ds-input w-auto min-w-[140px]"
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
            >
              <option value="">All lessons</option>
              {filteredLessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-ds-muted">
            {loading ? 'Loading...' : `Displaying ${comments.length} items`}
          </span>
        </div>

        {comments.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="w-12 h-12 text-ds-muted mx-auto mb-3" />
            <p className="text-sm text-ds-secondary">No comments in this filter.</p>
          </div>
        ) : (
          <ul className="divide-y divide-ds-border">
            {comments.map((comment) => (
              <li key={comment.id} className="px-4 sm:px-6 py-5">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-ds-secondary">
                    {(comment.user.name || comment.user.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <p className="text-sm">
                        <span className="font-semibold text-white">
                          {comment.user.name || comment.user.email}
                        </span>{' '}
                        <span className="text-ds-secondary">posted in</span>{' '}
                        <span className="text-blue-400 font-medium">
                          {comment.lesson.title}
                        </span>
                      </p>
                      <span className="text-xs text-ds-muted shrink-0">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-white/90 mb-4 leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                      {comment.content}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <button
                        type="button"
                        className="text-ds-secondary hover:text-white"
                        onClick={() => updateComment(comment.id, { read: true })}
                        disabled={actionId === comment.id}
                      >
                        {actionId === comment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        className="text-ds-secondary hover:text-green-400 flex items-center gap-1"
                        onClick={() => updateComment(comment.id, { status: 'approved' })}
                        disabled={actionId === comment.id}
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        type="button"
                        className="text-ds-secondary hover:text-orange-400 flex items-center gap-1"
                        onClick={() => updateComment(comment.id, { status: 'rejected' })}
                        disabled={actionId === comment.id}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        type="button"
                        className="text-ds-secondary hover:text-red-400"
                        onClick={() => deleteComment(comment.id)}
                        disabled={actionId === comment.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {comment.status !== 'approved' && (
                        <span className="px-2 py-0.5 rounded bg-white/10 text-ds-muted capitalize">
                          {comment.status}
                        </span>
                      )}
                      {!comment.read && (
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                          unread
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
