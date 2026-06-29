export type StreamingCourse = {
  id: string
  title: string
  description: string
  imageUrl: string | null
  totalLessons: number
  totalDuration: number
  moduleCount: number
  progressPct: number
  firstLessonId: string | null
  resumeLessonId: string | null
  createdAt: string
  lastActivityAt: string | null
  inProgress: boolean
  canContinueWatching: boolean
}

export type CourseCategory = {
  id: string
  name: string
  slug: string
  courses: StreamingCourse[]
}
