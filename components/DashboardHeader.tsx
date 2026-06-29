'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Bell, ChevronDown, LogOut, Menu, Search, User } from 'lucide-react'
import { signOut } from 'next-auth/react'
import type { NotificationItem } from '@/types/account'
import { resolveAvatarUrl } from '@/lib/default-avatar'

const HEADER_HEIGHT = 56

type HeaderUser = {
  name: string | null
  email: string
  avatarUrl: string | null
}

type DashboardHeaderProps = {
  user: HeaderUser
  sidebarWidth: number
  collapsed: boolean
  onToggleSidebar: () => void
}

export default function DashboardHeader({
  user,
  sidebarWidth,
  collapsed,
  onToggleSidebar,
}: DashboardHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    setSearchQuery(searchParams.get('q') ?? '')
  }, [searchParams])

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
    setNotifications([])
  }

  const dismissNotification = async (id: string) => {
    const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }
  }

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const q = searchQuery.trim()
    if (q) {
      router.push(`/dashboard/courses?q=${encodeURIComponent(q)}`)
      return
    }
    router.push('/dashboard/courses')
  }

  return (
    <header
      className="fixed top-0 right-0 z-50 flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-7 bg-ds-bg/90 backdrop-blur-md border-b border-ds-border transition-[left] duration-200 ease-out"
      style={{ left: sidebarWidth, height: HEADER_HEIGHT }}
    >
      <button
        type="button"
        onClick={onToggleSidebar}
        className="p-2 rounded-ds-md text-ds-secondary hover:bg-white/5 hover:text-ds-primary transition-colors flex-shrink-0"
        aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
        aria-expanded={!collapsed}
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <form
          onSubmit={handleSearch}
          className="ds-search w-36 sm:w-48 md:w-64 min-w-0"
          role="search"
        >
          <Search className="w-4 h-4 flex-shrink-0" aria-hidden />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            aria-label="Search courses"
          />
        </form>

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
                    Limpar todas
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
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => dismissNotification(notification.id)}
                      className="w-full min-w-0 text-left px-4 py-3 border-b border-ds-border last:border-0 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <p className="text-sm font-medium text-ds-primary break-words">
                        {notification.title}
                      </p>
                      <p className="text-xs text-ds-secondary mt-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                        {notification.message}
                      </p>
                    </button>
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
