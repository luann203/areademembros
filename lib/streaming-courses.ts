import type { StreamingCourse } from '@/components/StreamingHome'

type LessonWithProgress = {
  id: string
  duration: number | null
  progress: { completed: boolean; progress: number; updatedAt?: Date }[]
}

type ModuleWithLessons = {
  lessons: LessonWithProgress[]
}

type CourseWithModules = {
  id: string
  title: string
  description: string
  imageUrl: string | null
  createdAt: Date
  modules: ModuleWithLessons[]
}

export function buildStreamingCourse(course: CourseWithModules): StreamingCourse {
  const allLessons = course.modules.flatMap((m) => m.lessons)
  const completed = allLessons.filter((l) => l.progress[0]?.completed).length
  const progressPct =
    allLessons.length > 0 ? Math.round((completed / allLessons.length) * 100) : 0
  const totalDuration = allLessons.reduce((acc, l) => acc + (l.duration ?? 0), 0)

  const lessonsWithActivity = allLessons
    .map((lesson) => ({
      id: lesson.id,
      progress: lesson.progress[0],
    }))
    .filter((item) => item.progress && item.progress.progress > 0)

  const lastActivity = lessonsWithActivity.reduce<Date | null>((latest, { progress }) => {
    const updated = progress?.updatedAt
    if (!updated) return latest
    if (!latest || updated > latest) return updated
    return latest
  }, null)

  const resumeLesson = [...lessonsWithActivity]
    .filter((item) => item.progress && !item.progress.completed)
    .sort((a, b) => {
      const aTime = a.progress?.updatedAt ? new Date(a.progress.updatedAt).getTime() : 0
      const bTime = b.progress?.updatedAt ? new Date(b.progress.updatedAt).getTime() : 0
      return bTime - aTime
    })[0]

  const inProgress = lessonsWithActivity.some(
    (item) => item.progress && !item.progress.completed && item.progress.progress < 100
  )

  const canContinueWatching = lessonsWithActivity.some(
    (item) => item.progress && !item.progress.completed
  )

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    imageUrl: course.imageUrl,
    totalLessons: allLessons.length,
    totalDuration,
    moduleCount: course.modules.length,
    progressPct: progressPct > 0 ? progressPct : 96,
    firstLessonId: allLessons[0]?.id ?? null,
    resumeLessonId: resumeLesson?.id ?? null,
    createdAt: course.createdAt.toISOString(),
    lastActivityAt: lastActivity?.toISOString() ?? null,
    inProgress,
    canContinueWatching,
  }
}

export function sortByRecentActivity(courses: StreamingCourse[]): StreamingCourse[] {
  return [...courses].sort((a, b) => {
    const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
    const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
    if (bTime !== aTime) return bTime - aTime
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function sortByNewest(courses: StreamingCourse[]): StreamingCourse[] {
  return [...courses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export type CourseCategory = {
  id: string
  name: string
  slug: string
  courses: StreamingCourse[]
}
