'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Award,
  User,
  Mail,
} from 'lucide-react'

const mainItems = [
  { href: '/dashboard', label: 'Start', icon: Home, exact: true },
  { href: '/dashboard/certificates', label: 'Certificates', icon: Award },
  { href: '/dashboard/account', label: 'My Account', icon: User },
  { href: '/dashboard/contact', label: 'Contact', icon: Mail },
]

const footerItems = [
  { href: '/dashboard/courses', label: 'Search' },
  { href: '/dashboard/terms', label: 'Terms of Use' },
  { href: '/dashboard/privacy', label: 'Privacy Policies' },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname?.startsWith(`${href}/`)
  }

  return (
    <aside className="w-[72px] md:w-[var(--sidebar-width)] min-h-screen flex flex-col flex-shrink-0 ds-sidebar-glass fixed md:sticky top-0 z-50 h-screen">
      <div className="px-4 pt-6 pb-4">
        <Link href="/dashboard" className="block" title="Prohub.">
          <span className="hidden md:inline text-2xl font-black tracking-tight text-brand">
            PROHUB
          </span>
          <span className="md:hidden text-xl font-black text-brand">P</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {mainItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              className={`ds-nav-item justify-center md:justify-start ${
                active ? 'ds-nav-item-active' : ''
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="hidden md:block mt-auto border-t border-ds-border px-4 pt-5 pb-6">
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
    </aside>
  )
}
