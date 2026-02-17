'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import { Send, User } from 'lucide-react'
import { Comment, User as UserType } from '@prisma/client'

type CommentWithUser = Comment & {
  user: Pick<UserType, 'id' | 'name' | 'email'>
}

function getTimeAgo(date: Date | string) {
  const d = date instanceof Date ? date : new Date(date)
  return formatDistanceToNow(d, { addSuffix: true, locale: enUS })
}

export default function CommentSection({
  lessonId,
  comments: initialComments,
}: {
  lessonId: string
  comments: CommentWithUser[]
}) {
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')

  const getCommentTime = (c: CommentWithUser) =>
    c.createdAt instanceof Date ? c.createdAt.getTime() : new Date(c.createdAt).getTime()

  const sortedComments =
    sortBy === 'newest'
      ? [...comments].sort((a, b) => getCommentTime(b) - getCommentTime(a))
      : [...comments].sort((a, b) => getCommentTime(a) - getCommentTime(b))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Comentários desabilitados - não postar novos comentários
    return
  }

  return (
    <div className="space-y-4">
      {/* Formulário de Comentário */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment..."
          rows={3}
          className="w-full px-4 py-3 text-[14px] text-[#34495E] border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span>Post</span>
          </button>
        </div>
      </form>

      {/* Lista de Comentários - estilo Facebook */}
      <div className="divide-y divide-gray-200">
        {sortedComments.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-[14px]">
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
                  <User className="w-5 h-5 text-gray-500" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-0.5">
                    <span className="font-semibold text-[14px] text-[#050505]">
                      {comment.user.name || comment.user.email.split('@')[0]}
                    </span>
                    <span className="text-[14px] text-[#65676B]">
                      {getTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p
                    className="text-[14px] text-[#34495E] leading-[1.65] whitespace-pre-wrap break-words"
                    style={{
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                    }}
                  >
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
