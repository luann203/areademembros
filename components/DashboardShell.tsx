'use client'

import { Suspense, useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import DashboardHeader from '@/components/DashboardHeader'

const SIDEBAR_COLLAPSED_WIDTH = 72
const SIDEBAR_EXPANDED_WIDTH = 240
const HEADER_HEIGHT = 56

type DashboardShellProps = {
  isAdmin: boolean
  user: {
    name: string | null
    email: string
    avatarUrl: string | null
  }
  children: React.ReactNode
}

export default function DashboardShell({
  isAdmin,
  user,
  children,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('dashboard-sidebar-collapsed')
    if (stored !== null) {
      setCollapsed(stored === 'true')
    } else {
      setCollapsed(window.innerWidth < 768)
    }
    setReady(true)
  }, [])

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('dashboard-sidebar-collapsed', String(next))
      return next
    })
  }

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH

  return (
    <div className="flex min-h-screen bg-ds-bg">
      <Sidebar isAdmin={isAdmin} collapsed={collapsed} />
      <div
        className="flex-1 min-w-0 flex flex-col transition-[margin-left] duration-200 ease-out"
        style={{ marginLeft: ready ? sidebarWidth : SIDEBAR_COLLAPSED_WIDTH }}
      >
        <Suspense
          fallback={
            <div
              className="fixed top-0 right-0 z-50 bg-ds-bg/90 border-b border-ds-border"
              style={{ left: sidebarWidth, height: HEADER_HEIGHT }}
            />
          }
        >
          <DashboardHeader
            user={user}
            sidebarWidth={sidebarWidth}
            onToggleSidebar={toggleSidebar}
            collapsed={collapsed}
          />
        </Suspense>
        <main
          className="flex-1 min-w-0 overflow-auto px-4 md:px-7 pb-8"
          style={{ paddingTop: HEADER_HEIGHT + 16 }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
