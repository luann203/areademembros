'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bell, ChevronDown, LogOut, User } from 'lucide-react'
import { signOut } from 'next-auth/react'
import type { NotificationItem } from '@/types/account'
import { resolveAvatarUrl } from '@/lib/default-avatar'

type HeaderUser = {
  name: string | null
  email: string
  avatarUrl: string | null
}

type DashboardHeaderProps = {
  user: HeaderUser
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const menuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]))
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-end gap-2 sm:gap-3 px-4 md:px-7 py-3 min-h-[56px] bg-ds-bg/85 backdrop-blur-md">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((open) => !open)
              setMenuOpen(false)
            }}
            className="relative p-2 rounded-ds-md text-ds-secondary hover:bg-white/5 hover:text-ds-primary transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] ds-dropdown">
              <div className="flex items-center justify-between px-4 py-3 border-b border-ds-border">
                <h3 className="ds-section-title text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs font-medium text-ds-green hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-sm text-ds-muted text-center">
                    No notifications yet.
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 border-b border-ds-border last:border-0 ${
                        notification.read ? '' : 'bg-white/5'
                      }`}
                    >
                      <p className="text-sm font-medium text-ds-primary">{notification.title}</p>
                      <p className="text-xs text-ds-secondary mt-1">{notification.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => {
              setMenuOpen((open) => !open)
              setNotificationsOpen(false)
            }}
            className="flex items-center gap-2 p-1.5 pr-2 rounded-ds-md hover:bg-white/5 transition-colors"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-ds-surface border border-ds-border flex items-center justify-center flex-shrink-0">
              <Image
                src={resolveAvatarUrl(user.avatarUrl)}
                alt={user.name || user.email}
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <ChevronDown className="w-4 h-4 text-ds-muted hidden sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 ds-dropdown py-1">
              <div className="px-4 py-3 border-b border-ds-border">
                <p className="text-sm font-semibold text-ds-primary truncate">
                  {user.name || 'My account'}
                </p>
                <p className="text-xs text-ds-muted truncate">{user.email}</p>
              </div>
              <Link
                href="/dashboard/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-ds-secondary hover:bg-white/5 hover:text-ds-primary"
              >
                <User className="w-4 h-4" />
                My account
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-brand hover:bg-white/5"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
