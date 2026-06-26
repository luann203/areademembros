'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { StreamingCourse } from '@/components/StreamingHome'

const POSTER_GRADIENTS = [
  'linear-gradient(135deg, #0d1a0d 0%, #1a3018 100%)',
  'linear-gradient(135deg, #0a0f1a 0%, #0d1f3d 100%)',
  'linear-gradient(135deg, #1a0a0a 0%, #3d0505 100%)',
  'linear-gradient(135deg, #1a1508 0%, #3d2e05 100%)',
  'linear-gradient(135deg, #0f0a1a 0%, #2d0d3d 100%)',
  'linear-gradient(135deg, #0a1a18 0%, #053d35 100%)',
]

function gradientForCourse(courseId: string) {
  let hash = 0
  for (let i = 0; i < courseId.length; i++) {
    hash = courseId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return POSTER_GRADIENTS[Math.abs(hash) % POSTER_GRADIENTS.length]
}

function PosterImage({ course }: { course: StreamingCourse }) {
  if (course.imageUrl) {
    return (
      <Image
        src={course.imageUrl}
        alt={course.title}
        fill
        className="object-cover"
        sizes="236px"
      />
    )
  }
  return (
    <div className="absolute inset-0" style={{ background: gradientForCourse(course.id) }} />
  )
}

function PosterCard({ course }: { course: StreamingCourse }) {
  const href = course.firstLessonId
    ? `/dashboard/courses/${course.id}/lessons/${course.firstLessonId}`
    : `/dashboard/courses/${course.id}`

  const tags = [
    `${course.moduleCount} ${course.moduleCount === 1 ? 'Module' : 'Modules'}`,
    `${course.totalLessons} ${course.totalLessons === 1 ? 'Lesson' : 'Lessons'}`,
  ].join(' • ')

  return (
    <article className="ds-poster-item">
      <Link href={href} className="ds-poster-card block relative group">
        <PosterImage course={course} />
        <div className="ds-poster-overlay" aria-hidden />
        <div className="absolute top-3 left-3 z-10 flex items-center gap-0.5">
          <span className="ds-poster-badge-fa">FA</span>
          <span className="ds-poster-badge-course">COURSE</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 text-left">
          {course.inProgress && (
            <div className="ds-progress-track h-1 mb-3 rounded-full">
              <div className="ds-progress-fill" style={{ width: `${course.progressPct}%` }} />
            </div>
          )}
          <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-white leading-snug line-clamp-2">
            {course.title}
          </h3>
          <p className="text-[11px] text-ds-secondary mt-1.5 line-clamp-1">{tags}</p>
        </div>
      </Link>
    </article>
  )
}

type CoursePosterRowProps = {
  title: string
  courses: StreamingCourse[]
  href?: string
  showNav?: boolean
}

export default function CoursePosterRow({
  title,
  courses,
  href,
  showNav = false,
}: CoursePosterRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (courses.length === 0) return null

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const item = el.querySelector('.ds-poster-item') as HTMLElement | null
    const gap = 14
    const step = item ? item.offsetWidth + gap : 250
    el.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' })
  }

  const heading = href ? (
    <Link href={href} className="ds-section-header group">
      {title} <span className="arrow">›</span>
    </Link>
  ) : (
    <h2 className="ds-section-header">
      {title} <span className="arrow">›</span>
    </h2>
  )

  return (
    <section>
      <div className="ds-poster-row-header">
        {heading}
        {showNav && (
          <div className="ds-carousel-nav">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="ds-carousel-btn"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="ds-carousel-btn"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div ref={scrollRef} className="ds-poster-scroll">
        {courses.map((course) => (
          <PosterCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  )
}
