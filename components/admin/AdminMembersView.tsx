'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  KeyRound,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  User,
} from 'lucide-react'
import { resolveAvatarUrl } from '@/lib/default-avatar'
import type { AdminMemberRecord } from '@/types/admin'

type CourseOption = { id: string; title: string }

type AdminMembersViewProps = {
  initialMembers: AdminMemberRecord[]
  initialTotal: number
  courses: CourseOption[]
}

function formatTableDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function AdminMembersView({
  initialMembers,
  initialTotal,
  courses,
}: AdminMembersViewProps) {
  const router = useRouter()
  const [members, setMembers] = useState(initialMembers)
  const [total, setTotal] = useState(initialTotal)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    accessEndsAt: '',
    courseIds: [] as string[],
  })
  const menuRef = useRef<HTMLDivElement>(null)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      const res = await fetch(`/api/admin/members?${params}`)
      if (!res.ok) return
      const data = await res.json()
      setMembers(data.members)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMembers()
    }, 300)
    return () => clearTimeout(timer)
  }, [loadMembers])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const resendPassword = async (member: AdminMemberRecord) => {
    setMenuOpenId(null)
    if (!confirm(`Reenviar nova senha para ${member.email}?`)) return
    setActionId(member.id)
    try {
      const res = await fetch(`/api/admin/members/${member.id}/resend-password`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to resend password.')
      alert(`Nova senha enviada na área de notificações do aluno.\n\nSenha: ${data.password}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to resend password.')
    } finally {
      setActionId(null)
    }
  }

  const createMember = async () => {
    setCreateError('')
    setCreateLoading(true)
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create member.')

      setCreateOpen(false)
      setNewMember({ name: '', email: '', accessEndsAt: '', courseIds: [] })
      alert(`Membro criado!\n\nE-mail: ${data.email}\nSenha: ${data.temporaryPassword}`)
      router.refresh()
      await loadMembers()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Unexpected error.')
    } finally {
      setCreateLoading(false)
    }
  }

  const toggleCourse = (courseId: string) => {
    setNewMember((prev) => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId],
    }))
  }

  return (
    <div className="ds-page-shell">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <p className="ds-label mb-2">Prohub.</p>
          <h1 className="ds-page-title text-2xl sm:text-3xl">Members</h1>
        </div>
        <button type="button" className="ds-btn-brand self-start" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          New member
        </button>
      </header>

      <div className="flex flex-wrap gap-6 border-b border-ds-border mb-6">
        <button
          type="button"
          className="pb-3 text-sm font-medium border-b-2 border-purple-500 text-white"
        >
          All{' '}
          <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-purple-500/20 text-purple-300">
            {total}
          </span>
        </button>
      </div>

      <div className="ds-card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-ds-border flex flex-wrap items-center gap-3 justify-between">
          <div className="ds-search w-full sm:w-72">
            <Search className="w-4 h-4 shrink-0" />
            <input
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="text-xs text-ds-muted">
            {loading ? 'Loading...' : `Displaying ${members.length} of ${total} members`}
          </span>
        </div>

        {members.length === 0 ? (
          <div className="py-16 text-center text-sm text-ds-secondary">No members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-ds-border text-left text-ds-muted">
                  <th className="px-4 sm:px-6 py-3 font-medium">Full name</th>
                  <th className="px-4 py-3 font-medium">Email address</th>
                  <th className="px-4 py-3 font-medium">Registration date</th>
                  <th className="px-4 py-3 font-medium">End date</th>
                  <th className="px-4 sm:px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ds-border">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 shrink-0">
                          <Image
                            src={resolveAvatarUrl(member.avatarUrl)}
                            alt=""
                            width={36}
                            height={36}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-white truncate">
                          {member.name || member.email.split('@')[0]}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-ds-secondary">{member.email}</td>
                    <td className="px-4 py-4 text-ds-secondary whitespace-nowrap">
                      {formatTableDate(member.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-ds-secondary whitespace-nowrap">
                      {formatTableDate(member.accessEndsAt)}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/admin/members/${member.id}`}
                          className="inline-flex items-center justify-center p-2 rounded-lg border border-ds-border text-ds-secondary hover:text-white hover:bg-white/5"
                          aria-label="Edit member"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <div className="relative" ref={menuOpenId === member.id ? menuRef : undefined}>
                          <button
                            type="button"
                            onClick={() =>
                              setMenuOpenId((id) => (id === member.id ? null : member.id))
                            }
                            disabled={actionId === member.id}
                            className="inline-flex items-center justify-center p-2 rounded-lg border border-ds-border text-ds-secondary hover:text-white hover:bg-white/5 disabled:opacity-50"
                            aria-label="More actions"
                          >
                            {actionId === member.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="w-4 h-4" />
                            )}
                          </button>
                          {menuOpenId === member.id && (
                            <div className="absolute right-0 mt-2 w-48 ds-dropdown py-1 z-20">
                              <button
                                type="button"
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ds-secondary hover:bg-white/5 hover:text-white text-left"
                                onClick={() => resendPassword(member)}
                              >
                                <KeyRound className="w-4 h-4" />
                                Re-send password
                              </button>
                              <Link
                                href={`/dashboard/admin/members/${member.id}`}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ds-secondary hover:bg-white/5 hover:text-white"
                                onClick={() => setMenuOpenId(null)}
                              >
                                <User className="w-4 h-4" />
                                View profile
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !createLoading && setCreateOpen(false)}
          />
          <div className="relative ds-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-ds-border">
              <h3 className="ds-section-title text-base">New member</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              {createError && <p className="text-sm text-red-400">{createError}</p>}
              <div>
                <label className="ds-label block mb-2">Full name</label>
                <input
                  className="ds-input"
                  value={newMember.name}
                  onChange={(e) => setNewMember((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Member name"
                />
              </div>
              <div>
                <label className="ds-label block mb-2">Email</label>
                <input
                  className="ds-input"
                  type="email"
                  required
                  value={newMember.email}
                  onChange={(e) => setNewMember((p) => ({ ...p, email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="ds-label block mb-2">End date (optional)</label>
                <input
                  className="ds-input"
                  type="datetime-local"
                  value={newMember.accessEndsAt}
                  onChange={(e) => setNewMember((p) => ({ ...p, accessEndsAt: e.target.value }))}
                />
              </div>
              <div>
                <label className="ds-label block mb-2">Courses</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-ds-border rounded-lg p-3">
                  {courses.length === 0 ? (
                    <p className="text-xs text-ds-muted">No courses available.</p>
                  ) : (
                    courses.map((course) => (
                      <label key={course.id} className="flex items-center gap-2 text-sm text-ds-secondary">
                        <input
                          type="checkbox"
                          checked={newMember.courseIds.includes(course.id)}
                          onChange={() => toggleCourse(course.id)}
                        />
                        {course.title}
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-ds-border">
              <button
                type="button"
                className="flex-1 ds-btn-secondary justify-center"
                disabled={createLoading}
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 ds-btn-brand justify-center"
                disabled={createLoading || !newMember.email.trim()}
                onClick={createMember}
              >
                {createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
