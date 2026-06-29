import Link from 'next/link'
import Image from 'next/image'
import { Play, Info } from 'lucide-react'
import CoursePosterRow from '@/components/CoursePosterRow'
import type { CourseCategory, StreamingCourse } from '@/types/streaming'

export type { StreamingCourse, CourseCategory }

type StreamingHomeProps = {
  courses: StreamingCourse[]
  categories: CourseCategory[]
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function CourseImage({
  course,
  gradient = 'linear-gradient(135deg, #0d1a0d 0%, #1a3018 100%)',
}: {
  course: StreamingCourse
  gradient?: string
}) {
  if (course.imageUrl) {
    return (
      <Image
        src={course.imageUrl}
        alt={course.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 600px"
      />
    )
  }
  return (
    <div className="absolute inset-0" style={{ background: gradient }} />
  )
}

function HeroCard({ course }: { course: StreamingCourse }) {
  const lessonId = course.resumeLessonId ?? course.firstLessonId
  const href = lessonId
    ? `/dashboard/courses/${course.id}/lessons/${lessonId}`
    : `/dashboard/courses/${course.id}`

  return (
    <Link href={href} className="ds-hero-card block w-full relative">
      <div className="absolute inset-0">
        <CourseImage course={course} />
        <div className="absolute inset-0" style={{ background: 'var(--overlay-hero)' }} />
      </div>
      <div className="relative z-10 h-full min-h-[280px] flex flex-col justify-end p-5 sm:p-6">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          {course.title}
        </h2>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="ds-badge-match">{course.progressPct}% Match</span>
          <span className="text-ds-secondary text-xs">{formatDuration(course.totalDuration)}</span>
          <span className="text-ds-muted text-xs">•</span>
          <span className="text-ds-secondary text-xs">{course.moduleCount} Modules</span>
          <span className="text-ds-muted text-xs">•</span>
          <span className="text-ds-secondary text-xs">HD</span>
        </div>
        <p className="ds-genre-dot mb-3 line-clamp-2 max-w-lg">
          Course<span className="sep">•</span>
          {course.totalLessons} Lessons<span className="sep">•</span>
          Learning
        </p>
        <p className="text-ds-secondary text-xs sm:text-sm leading-relaxed line-clamp-2 max-w-xl mb-4">
          {course.description}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="ds-btn-primary">
            <Play className="w-4 h-4 fill-black" />
            Play
          </span>
          <span className="ds-btn-secondary">
            <Info className="w-4 h-4" />
            More Info
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function StreamingHome({ courses, categories }: StreamingHomeProps) {
  if (courses.length === 0 && categories.length === 0) {
    return (
      <p className="text-center py-16 text-ds-muted text-lg">
        You are not enrolled in any course yet.
      </p>
    )
  }

  const inProgress = sortByRecentActivity(courses.filter((c) => c.canContinueWatching))
  const continueCourse = inProgress[0] ?? courses[0]

  return (
    <div className="space-y-10">
      {continueCourse && (
        <section>
          <h2 className="ds-section-header">
            Continue Watching <span className="arrow">›</span>
          </h2>
          <HeroCard course={continueCourse} />
        </section>
      )}

      {categories.map((category) => (
        <CoursePosterRow
          key={category.id}
          title={category.name}
          courses={category.courses}
          href="/dashboard/courses"
          showNav
        />
      ))}
    </div>
  )
}

function sortByRecentActivity(courses: StreamingCourse[]) {
  return [...courses].sort((a, b) => {
    const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
    const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
    return bTime - aTime
  })
}
