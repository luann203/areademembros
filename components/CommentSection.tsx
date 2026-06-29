'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from '@/lib/format-date'
import { Loader2, Send, User } from 'lucide-react'
import { Comment, User as UserType } from '@prisma/client'

type CommentWithUser = Comment & {
  user: Pick<UserType, 'id' | 'name' | 'email'>
}

function getTimeAgo(date: Date | string) {
  const d = date instanceof Date ? date : new Date(date)
  return formatDistanceToNow(d)
}

export default function CommentSection({ lessonId }: { lessonId: string }) {
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [pendingNotice, setPendingNotice] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')

  useEffect(() => {
    let cancelled = false
    setLoadingComments(true)

    fetch(`/api/lessons/${lessonId}/comments`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) {
          setComments(Array.isArray(data) ? data : [])
        }
      })
      .catch(() => {
        if (!cancelled) setComments([])
      })
      .finally(() => {
        if (!cancelled) setLoadingComments(false)
      })

    return () => {
      cancelled = true
    }
  }, [lessonId])

  const getCommentTime = (c: CommentWithUser) =>
    c.createdAt instanceof Date ? c.createdAt.getTime() : new Date(c.createdAt).getTime()

  const sortedComments =
    sortBy === 'newest'
      ? [...comments].sort((a, b) => getCommentTime(b) - getCommentTime(a))
      : [...comments].sort((a, b) => getCommentTime(a) - getCommentTime(b))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError('')
    setPendingNotice('')

    try {
      const res = await fetch(`/api/lessons/${lessonId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to post comment.')
      }

      setNewComment('')
      setPendingNotice(
        'Your comment was sent and is awaiting approval. It will appear here once approved.'
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Formulário de Comentário */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {pendingNotice && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
            {pendingNotice}
          </div>
        )}
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment..."
          rows={3}
          className="ds-input w-full min-h-[88px] resize-y"
          required
        />
        <div className="flex items-center justify-between gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            className="ds-input w-auto text-sm py-1.5"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="ds-btn-brand"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
          </button>
        </div>
      </form>

      {/* Lista de Comentários */}
      <div className="divide-y divide-ds-border">
        {loadingComments ? (
          <p className="text-ds-muted text-center py-8 text-[14px] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading comments...
          </p>
        ) : sortedComments.length === 0 ? (
          <p className="text-ds-muted text-center py-8 text-[14px]">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          sortedComments.map((comment) => (
            <div key={comment.id} className="py-5 first:pt-0">
              <div className="flex gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: '#E4E6EB' }}
                >
                  <User className="w-5 h-5 text-ds-muted" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-0.5">
                    <span className="font-semibold text-sm text-ds-primary">
                      {comment.user.name || comment.user.email.split('@')[0]}
                    </span>
                    <span className="text-sm text-ds-muted">
                      {getTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-ds-secondary leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
