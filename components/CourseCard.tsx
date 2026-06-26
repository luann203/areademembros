import Link from 'next/link'
import Image from 'next/image'
import { Clock, BookOpen, Play } from 'lucide-react'
import { Course } from '@prisma/client'
import { Module } from '@prisma/client'

type CourseWithModules = Course & {
  modules: (Module & {
    lessons: Array<{ duration: number | null }>
  })[]
  totalLessons: number
  totalDuration: number
}

export default function CourseCard({ course }: { course: CourseWithModules }) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  return (
    <Link href={`/dashboard/courses/${course.id}`} className="group block">
      <article className="ds-card overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
        <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 430px"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0d1a0d 0%, #1a3018 100%)' }}
            >
              <BookOpen className="w-16 h-16 text-white/30" strokeWidth={1.5} />
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{ background: 'var(--overlay-card)' }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <span className="ds-badge-match">Course</span>
            <h3 className="text-base font-extrabold text-white mt-2 line-clamp-2 tracking-wide">
              {course.title}
            </h3>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-ds-secondary text-xs leading-relaxed line-clamp-3">
            {course.description}
          </p>
          <div className="flex items-center justify-between gap-3 text-xs text-ds-muted">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" aria-hidden />
              <span>{course.totalLessons} lessons</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden />
              <span>{formatDuration(course.totalDuration)}</span>
            </div>
          </div>
          <span className="ds-btn-primary w-full text-center">
            <Play className="w-4 h-4 fill-black" />
            Play
          </span>
        </div>
      </article>
    </Link>
  )
}
