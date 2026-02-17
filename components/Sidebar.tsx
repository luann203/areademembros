'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Mail, Play, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

const menuItems = [
  { href: '/dashboard', label: 'Contents', icon: LayoutDashboard },
  { href: '/dashboard/courses', label: 'Classes', icon: BookOpen },
  { href: '/dashboard/contact', label: 'Contact', icon: Mail },
]

export default function Sidebar() {
  const pathname = usePathname()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <div
      className="w-14 md:w-64 text-white min-h-screen flex flex-col flex-shrink-0"
      style={{ backgroundColor: '#221E36' }}
    >
      <div className="p-3 md:p-6 border-b border-white/10 flex justify-center md:justify-start">
        <Link
          href="/dashboard"
          className="flex items-center space-x-2"
          title="Prohub."
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#6932CB' }}
          >
            <Play className="w-4 h-4 text-white fill-white" strokeWidth={3} />
          </div>
          <span className="text-xl font-bold hidden md:inline">Prohub.</span>
        </Link>
      </div>

      <nav className="flex-1 p-2 md:p-4 space-y-1 md:space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center justify-center md:justify-start space-x-3 px-2 md:px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
              style={isActive ? { backgroundColor: '#6932CB' } : {}}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium hidden md:inline">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-2 md:p-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleSignOut}
          title="Sign out"
          className="w-full flex items-center justify-center md:justify-start space-x-3 px-2 md:px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium hidden md:inline">Sign out</span>
        </button>
      </div>
    </div>
  )
}
