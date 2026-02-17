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
  const [openIds, setOpenIds] = useState<Set<string>>(
    new Set(modules.map((m) => m.id))
  )

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
          <div
            key={module.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
          >
            <button
              type="button"
              onClick={() => toggle(module.id)}
              className="w-full flex items-center justify-between px-3 sm:px-4 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 touch-manipulation"
            >
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
                <span className="font-semibold text-gray-900 text-sm sm:text-base">{module.title}</span>
              </div>
            </button>
            {isOpen && (
              <div className="divide-y divide-gray-100">
                {module.lessons.map((lesson, index) => {
                  const isCompleted = lesson.progress[0]?.completed ?? false
                  return (
                    <Link
                      key={lesson.id}
                      href={`/dashboard/courses/${courseId}/lessons/${lesson.id}`}
                      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3 pl-10 sm:pl-11 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
                    >
                      <Play
                        className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                        style={{ color: '#6932CB' }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 sm:line-clamp-1">
                          LESSON {String(index + 1).padStart(2, '0')} - {lesson.title}
                        </span>
                      </div>
                      {lesson.duration != null && (
                        <span className="text-xs sm:text-sm text-gray-500 tabular-nums shrink-0">
                          {formatDuration(lesson.duration)}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => e.preventDefault()}
                        className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-amber-500"
                        aria-label="Favorite"
                      >
                        <Star
                          className={`w-5 h-5 ${isCompleted ? 'fill-amber-400 text-amber-500' : ''}`}
                        />
                      </button>
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
