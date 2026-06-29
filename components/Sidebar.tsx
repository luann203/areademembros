'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import {
  Home,
  Award,
  User,
  Mail,
  Plug,
  PlusCircle,
  BookOpen,
  Tags,
  Bell,
  MessageSquare,
  BarChart3,
  Users,
} from 'lucide-react'

const SIDEBAR_COLLAPSED_WIDTH = 72
const SIDEBAR_EXPANDED_WIDTH = 240

const mainItems = [
  { href: '/dashboard', label: 'Start', icon: Home, exact: true },
  { href: '/dashboard/certificates', label: 'Certificates', icon: Award },
  { href: '/dashboard/account', label: 'My Account', icon: User },
  { href: '/dashboard/contact', label: 'Contact', icon: Mail },
]

const adminItems = [
  { href: '/dashboard/admin/categories', label: 'Categories', icon: Tags },
  { href: '/dashboard/admin/courses/new', label: 'New Course', icon: PlusCircle },
  { href: '/dashboard/admin/courses', label: 'Course', icon: BookOpen },
  { href: '/dashboard/admin/members', label: 'Members', icon: Users },
  { href: '/dashboard/admin/comments', label: 'Comments', icon: MessageSquare },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Plug },
  { href: '/dashboard/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/admin/reports', label: 'Reports', icon: BarChart3 },
]

const footerItems = [
  { href: '/dashboard/courses', label: 'Classes' },
  { href: '/dashboard/terms', label: 'Terms of Use' },
  { href: '/dashboard/privacy', label: 'Privacy Policies' },
]

type SidebarProps = {
  isAdmin?: boolean
  collapsed?: boolean
}

function NavBadge({ count, collapsed }: { count: number; collapsed: boolean }) {
  if (count <= 0) return null

  if (collapsed) {
    return (
      <span className="absolute top-1.5 right-1.5 min-w-[8px] h-2 px-0.5 rounded-full bg-brand border border-ds-sidebar" />
    )
  }

  return (
    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-[10px] font-bold text-white leading-none shrink-0">
      {count > 9 ? '9+' : count}
    </span>
  )
}

export default function Sidebar({ isAdmin = false, collapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH
  const [badges, setBadges] = useState<Record<string, number>>({})

  const loadBadges = useCallback(async () => {
    if (!isAdmin) {
      setBadges({})
      return
    }

    try {
      const res = await fetch('/api/admin/menu-badges')
      if (!res.ok) return
      const data = await res.json()
      setBadges(data.badges ?? {})
    } catch {
      // ignore
    }
  }, [isAdmin])

  useEffect(() => {
    loadBadges()
  }, [loadBadges, pathname])

  useEffect(() => {
    if (!isAdmin) return
    const interval = setInterval(loadBadges, 60000)
    return () => clearInterval(interval)
  }, [isAdmin, loadBadges])

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname?.startsWith(`${href}/`)
  }

  const getBadge = (href: string) => badges[href] ?? 0

  return (
    <aside
      className="fixed top-0 left-0 z-40 flex flex-col flex-shrink-0 ds-sidebar-glass h-screen transition-[width] duration-200 ease-out overflow-hidden"
      style={{ width }}
    >
      <div className={`pt-6 pb-4 ${collapsed ? 'px-0 flex justify-center' : 'px-4'}`}>
        <Link href="/dashboard" className="block" title="Prohub.">
          {collapsed ? (
            <span className="text-xl font-black text-brand">P</span>
          ) : (
            <span className="text-2xl font-black tracking-tight text-brand">PROHUB</span>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4">
        {mainItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              className={`ds-nav-item ${collapsed ? 'justify-center px-0' : 'justify-start'} ${
                active ? 'ds-nav-item-active' : ''
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            {!collapsed && <p className="ds-nav-group-label">Admin</p>}
            {adminItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              const badge = getBadge(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={item.label}
                  className={`ds-nav-item relative ${collapsed ? 'justify-center px-0' : 'justify-start'} ${
                    active ? 'ds-nav-item-active' : ''
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      {badge > 0 && <NavBadge count={badge} collapsed={false} />}
                      <span className="flex-1 min-w-0">{item.label}</span>
                    </>
                  )}
                  {collapsed && <NavBadge count={badge} collapsed />}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {!collapsed && (
        <div className="mt-auto border-t border-ds-border px-4 pt-5 pb-6">
          <ul className="space-y-3">
            {footerItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`ds-sidebar-footer-link ${
                    pathname === item.href ? 'ds-sidebar-footer-link-active' : ''
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
