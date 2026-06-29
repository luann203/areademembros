export type CommentStatus = 'pending' | 'approved' | 'rejected'

export type AdminCommentRecord = {
  id: string
  content: string
  status: CommentStatus
  read: boolean
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  lesson: {
    id: string
    title: string
    module: {
      course: {
        id: string
        title: string
      }
    }
  }
}

export type AdminMemberRecord = {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
  accessEndsAt: string | null
  createdAt: string
  enrollmentCount: number
}

export type AdminMemberDetail = {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
  accessEndsAt: string | null
  createdAt: string
  role: string
  enrollments: { id: string; courseId: string; courseTitle: string; createdAt: string }[]
}

export type CategoryRecord = {
  id: string
  name: string
  slug: string
  order: number
  _count?: { courses: number }
}

export type ReportCourseRow = {
  id: string
  title: string
  completions: number
  comments: number
  ratings: number
  averageRating: number
  npsScore: number
}

export type ReportActivityPoint = {
  date: string
  completions: number
  comments: number
  ratings: number
}

export type AdminCourseListItem = {
  id: string
  title: string
  imageUrl: string | null
  createdAt?: string
}

export type AdminLessonRecord = {
  id: string
  title: string
  description: string
  videoUrl: string | null
  duration: number | null
  showFooter: boolean
  order: number
  moduleId: string
}

export type AdminModuleRecord = {
  id: string
  title: string
  description: string | null
  order: number
  courseId: string
  lessons: AdminLessonRecord[]
}

export type AdminCourseDetail = {
  id: string
  title: string
  acronym: string | null
  description: string
  salesPageUrl: string | null
  imageUrl: string | null
  duration: number | null
  categoryId: string | null
  showInShowcase: boolean
  enableCommentModeration: boolean
  category: { id: string; name: string } | null
  modules: AdminModuleRecord[]
}
