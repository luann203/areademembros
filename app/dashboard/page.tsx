import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { bootstrapCourseIfEmpty, ensureUserEnrolledInYoutubeCourse } from '@/lib/bootstrap-course'
import CourseCard from '@/components/CourseCard'

export default async function ContentsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  await bootstrapCourseIfEmpty()

  let userId = session.user.id
  if (session.user.email) {
    const byEmail = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase().trim() },
      select: { id: true },
    })
    if (byEmail) userId = byEmail.id
  }

  await ensureUserEnrolledInYoutubeCourse(userId)

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          modules: { include: { lessons: { select: { id: true, duration: true } } } },
        },
      },
    },
  })

  const courses = enrollments.map((e) => e.course)

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] mb-1 md:mb-2">
          Contents
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Your available courses
        </p>
      </header>

      {courses.length === 0 ? (
        <p className="text-center py-8 sm:py-12 text-gray-500 text-base sm:text-lg">
          You are not enrolled in any course yet.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 list-none p-0 m-0">
          {courses.map((course) => {
            const totalLessons = course.modules.reduce(
              (acc, m) => acc + m.lessons.length,
              0
            )
            const totalDuration = course.modules.reduce(
              (acc, m) =>
                acc + m.lessons.reduce((s, l) => s + (l.duration ?? 0), 0),
              0
            )
            return (
              <li key={course.id}>
                <CourseCard
                  course={{
                    ...course,
                    totalLessons,
                    totalDuration,
                  }}
                />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
