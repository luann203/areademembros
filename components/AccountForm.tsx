'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { TIMEZONE_OPTIONS, type UserProfile } from '@/types/account'
import { resolveAvatarUrl } from '@/lib/default-avatar'

type AccountFormProps = {
  profile: UserProfile
}

export default function AccountForm({ profile }: AccountFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(profile.name ?? '')
  const [email] = useState(profile.email)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [timezone, setTimezone] = useState(profile.timezone)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const res = await fetch('/api/account/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to upload avatar')
      }

      const data = await res.json()
      setAvatarUrl(data.avatarUrl)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword && newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim(),
          timezone,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update account')
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('Account updated successfully.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update account')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setName(profile.name ?? '')
    setBio(profile.bio ?? '')
    setTimezone(profile.timezone)
    setAvatarUrl(profile.avatarUrl)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-10">
        <div>
          <h2 className="text-lg font-semibold text-ds-primary mb-2">My profile</h2>
          <p className="text-sm text-ds-secondary leading-relaxed">
            Tell your classmates a little about yourself. This information will be visible on your profile.
          </p>
        </div>

        <div className="ds-card p-5 sm:p-6 space-y-5">
          <div>
            <label htmlFor="full-name" className="block text-sm font-medium text-ds-secondary mb-2">
              Full name
            </label>
            <input
              id="full-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="ds-input"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ds-secondary mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="ds-input bg-ds-bg/50"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-ds-secondary mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="ds-input resize-none"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-ds-secondary mb-3">Avatar</span>
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-ds-surface border border-ds-border flex items-center justify-center">
                <Image
                  src={resolveAvatarUrl(avatarUrl)}
                  alt={name || email}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-md hover:opacity-90 disabled:opacity-50"
                aria-label="Change avatar"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            {uploadingAvatar && (
              <p className="text-xs text-ds-secondary mt-2">Uploading photo...</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-10">
        <div>
          <h2 className="text-lg font-semibold text-ds-primary mb-2">Time zone</h2>
          <p className="text-sm text-ds-secondary leading-relaxed">
            Adjust the date and time to your local time zone.
          </p>
        </div>

        <div className="ds-card p-5 sm:p-6">
          <label htmlFor="timezone" className="block text-sm font-medium text-ds-secondary mb-2">
            Time zone
          </label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="ds-input bg-white"
          >
            {TIMEZONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-10">
        <div>
          <h2 className="text-lg font-semibold text-ds-primary mb-2">Change password</h2>
          <p className="text-sm text-ds-secondary leading-relaxed">
            Leave blank if you don&apos;t want to change it.
          </p>
        </div>

        <div className="ds-card p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-ds-secondary mb-2">
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="ds-input"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-ds-secondary mb-2">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="ds-input"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-ds-secondary mb-2">
              Confirm your new password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="ds-input"
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleCancel}
          className="px-5 py-2.5 text-sm font-medium text-ds-secondary hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="ds-btn-brand px-6"
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </div>
    </form>
  )
}
