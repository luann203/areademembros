'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, KeyRound, Loader2, Trash2 } from 'lucide-react'
import { resolveAvatarUrl } from '@/lib/default-avatar'
import type { AdminMemberDetail } from '@/types/admin'

type CourseOption = { id: string; title: string }

type AdminMemberProfileViewProps = {
  member: AdminMemberDetail
  courses: CourseOption[]
}

function toLocalInput(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function AdminMemberProfileView({ member, courses }: AdminMemberProfileViewProps) {
  const router = useRouter()
  const [name, setName] = useState(member.name ?? '')
  const [email, setEmail] = useState(member.email)
  const [accessEndsAt, setAccessEndsAt] = useState(toLocalInput(member.accessEndsAt))
  const [courseIds, setCourseIds] = useState(
    member.enrollments.map((enrollment) => enrollment.courseId)
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const toggleCourse = (courseId: string) => {
    setCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    )
  }

  const save = async () => {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          accessEndsAt: accessEndsAt || null,
          courseIds,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save member.')
      setSuccess('Member updated successfully.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
    } finally {
      setLoading(false)
    }
  }

  const resendPassword = async () => {
    if (!confirm(`Reenviar nova senha para ${email}?`)) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/members/${member.id}/resend-password`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to resend password.')
      alert(`Nova senha enviada na área de notificações.\n\nSenha: ${data.password}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
    } finally {
      setLoading(false)
    }
  }

  const deleteMember = async () => {
    if (!confirm(`Excluir permanentemente ${email}?`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete member.')
      }
      router.push('/dashboard/admin/members')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
      setLoading(false)
    }
  }

  return (
    <div className="ds-page-shell space-y-6">
      <Link
        href="/dashboard/admin/members"
        className="inline-flex items-center gap-2 text-sm text-ds-secondary hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to members
      </Link>

      <header className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 shrink-0">
          <Image
            src={resolveAvatarUrl(member.avatarUrl)}
            alt=""
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="ds-label mb-2">Prohub.</p>
          <h1 className="ds-page-title text-2xl sm:text-3xl">
            {member.name || member.email.split('@')[0]}
          </h1>
          <p className="text-sm text-ds-secondary mt-1">{member.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="ds-btn-secondary text-sm" onClick={resendPassword} disabled={loading}>
            <KeyRound className="w-4 h-4" />
            Re-send password
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-red-400 border border-red-500/40 rounded-full px-4 py-2 hover:bg-red-500/10"
            onClick={deleteMember}
            disabled={loading}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </header>

      <div className="ds-card p-6 space-y-5">
        {success && (
          <p className="text-sm text-green-400 border border-green-500/30 bg-green-500/10 rounded-lg px-4 py-3">
            {success}
          </p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="ds-label block mb-2">Full name</label>
            <input className="ds-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="ds-label block mb-2">Email</label>
            <input
              className="ds-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="ds-label block mb-2">Registration date</label>
            <input className="ds-input opacity-60" readOnly value={member.createdAt.slice(0, 16).replace('T', ' ')} />
          </div>
          <div>
            <label className="ds-label block mb-2">End date</label>
            <input
              className="ds-input"
              type="datetime-local"
              value={accessEndsAt}
              onChange={(e) => setAccessEndsAt(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="ds-label block mb-2">Courses</label>
          <p className="text-xs text-ds-muted mb-3">
            Marque os cursos que este membro pode acessar. Desmarque para remover o acesso.
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto border border-ds-border rounded-lg p-4">
            {courses.length === 0 ? (
              <p className="text-sm text-ds-muted">No courses available.</p>
            ) : (
              courses.map((course) => (
                <label
                  key={course.id}
                  className="flex items-center gap-3 text-sm text-ds-secondary py-1"
                >
                  <input
                    type="checkbox"
                    checked={courseIds.includes(course.id)}
                    onChange={() => toggleCourse(course.id)}
                  />
                  <span className="text-white">{course.title}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="button" className="ds-btn-brand" disabled={loading} onClick={save}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
