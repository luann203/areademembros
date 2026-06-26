import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { bootstrapCourseIfEmpty, bootstrapCatalogCoursesIfMissing, ensureUserEnrolledInAllCourses } from '@/lib/bootstrap-course'
import { bootstrapCategoriesIfMissing, courseIncludeForUser, fetchHomeCategories } from '@/lib/categories'
import { resolveUserId } from '@/lib/resolve-user-id'
import { buildStreamingCourse, type CourseCategory } from '@/lib/streaming-courses'
import StreamingHome from '@/components/StreamingHome'

export default async function ContentsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  await bootstrapCourseIfEmpty()
  await bootstrapCatalogCoursesIfMissing()

  const userId = await resolveUserId(session)
  if (!userId) redirect('/login')

  await ensureUserEnrolledInAllCourses(userId)

  let enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: { include: courseIncludeForUser(userId) },
    },
  })

  if (enrollments.length === 0) {
    await ensureUserEnrolledInAllCourses(userId)
    enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: { include: courseIncludeForUser(userId) },
      },
    })
  }

  const courses = enrollments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(({ course }) => buildStreamingCourse(course))

  const rawCategories = await fetchHomeCategories(userId)
  const categories: CourseCategory[] = rawCategories
    .filter((category) => category.courses.length > 0)
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      courses: category.courses.map((course) => buildStreamingCourse(course)),
    }))

  return <StreamingHome courses={courses} categories={categories} />
}
