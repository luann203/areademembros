import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ensureBootstrapOnce } from '@/lib/bootstrap-course'
import { ensureUserEnrolledInAllCoursesOnce } from '@/lib/enrollment-sync'
import {
  buildCategoriesFromCourses,
  fetchUserEnrollmentsWithCourses,
} from '@/lib/categories'
import { getCachedCategoryMeta } from '@/lib/cached-queries'
import { requireSessionUserId } from '@/lib/get-session-user'
import { buildStreamingCourse } from '@/lib/streaming-courses'
import StreamingHome from '@/components/StreamingHome'

export default async function ContentsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = await requireSessionUserId(session)
  if (!userId) redirect('/login')

  await ensureBootstrapOnce()
  await ensureUserEnrolledInAllCoursesOnce(userId)

  const [enrollments, categoryMeta] = await Promise.all([
    fetchUserEnrollmentsWithCourses(userId),
    getCachedCategoryMeta(),
  ])

  const courses = enrollments.map(({ course }) => buildStreamingCourse(course))
  const categories = buildCategoriesFromCourses(
    categoryMeta,
    enrollments.map(({ course }) => course)
  )

  return <StreamingHome courses={courses} categories={categories} />
}
