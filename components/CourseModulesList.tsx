'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Play, Star } from 'lucide-react'

type Lesson = {
  id: string
  title: string
  duration: number | null
  progress: Array<{ completed: boolean; progress: number }>
}

type Module = {
  id: string
  title: string
  description: string | null
  lessons: Lesson[]
}

type Props = {
  courseId: string
  modules: Module[]
}

function formatDuration(minutes: number) {
  const m = Math.floor(minutes)
  if (m >= 60) {
    const h = Math.floor(m / 60)
    const min = m % 60
    return min > 0 ? `${h}h ${min}m` : `${h}h`
  }
  return `${m} min`
}

export default function CourseModulesList({ courseId, modules }: Props) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(modules.map((m) => m.id)))

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-2">
      {modules.map((module) => {
        const isOpen = openIds.has(module.id)
        return (
          <div key={module.id} className="ds-card overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(module.id)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-white/5 transition-colors border-b border-ds-border"
            >
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-ds-muted flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-ds-muted flex-shrink-0" />
                )}
                <span className="font-semibold text-ds-primary text-sm sm:text-base">
                  {module.title}
                </span>
              </div>
            </button>
            {isOpen && (
              <div className="divide-y divide-ds-border">
                {module.lessons.map((lesson, index) => {
                  const isCompleted = lesson.progress[0]?.completed ?? false
                  return (
                    <Link
                      key={lesson.id}
                      href={`/dashboard/courses/${courseId}/lessons/${lesson.id}`}
                      className="flex items-center gap-3 px-4 py-3 pl-10 hover:bg-white/5 transition-colors"
                    >
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-brand fill-brand" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-ds-primary line-clamp-2 sm:line-clamp-1">
                          LESSON {String(index + 1).padStart(2, '0')} - {lesson.title}
                        </span>
                      </div>
                      {lesson.duration != null && (
                        <span className="text-xs text-ds-muted tabular-nums shrink-0">
                          {formatDuration(lesson.duration)}
                        </span>
                      )}
                      <Star
                        className={`w-4 h-4 shrink-0 ${
                          isCompleted ? 'fill-ds-green text-ds-green' : 'text-ds-muted'
                        }`}
                        aria-hidden
                      />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
