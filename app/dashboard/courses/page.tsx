import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { bootstrapCourseIfEmpty, ensureUserEnrolledInYoutubeCourse } from '@/lib/bootstrap-course'
import CourseModulesList from '@/components/CourseModulesList'

export default async function ClassesPage() {
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
          modules: {
            orderBy: { order: 'asc' },
            include: {
              lessons: {
                orderBy: { order: 'asc' },
                include: {
                  progress: { where: { userId }, select: { completed: true, progress: true } },
                },
              },
            },
          },
        },
      },
    },
  })

  const courses = enrollments.map((e) => e.course)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] mb-1 md:mb-2">
          Classes
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          All your lessons in one place
        </p>
      </header>

      {courses.length === 0 ? (
        <p className="text-center py-12 text-gray-500 text-lg">
          You are not enrolled in any course yet.
        </p>
      ) : (
        <ul className="space-y-6 sm:space-y-8 list-none p-0 m-0">
          {courses.map((course) => {
            const allLessons = course.modules.flatMap((m) => m.lessons)
            const completed = allLessons.filter((l) =>
              l.progress.some((p) => p.completed)
            )
            const progressPct =
              allLessons.length > 0
                ? Math.round((completed.length / allLessons.length) * 100)
                : 0
            const totalMin = allLessons.reduce((acc, l) => acc + (l.duration ?? 0), 0)
            const firstId = allLessons[0]?.id

            const formatTime = (min: number) => {
              const h = Math.floor(min / 60)
              const m = min % 60
              return h > 0 ? `${h}h ${m}m` : `${m}m`
            }

            const modulesForList = course.modules.map((m) => ({
              id: m.id,
              title: m.title,
              description: m.description,
              lessons: m.lessons.map((l) => ({
                id: l.id,
                title: l.title,
                duration: l.duration,
                progress: l.progress,
              })),
            }))

            return (
              <li key={course.id} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <aside className="lg:col-span-1 order-2 lg:order-1">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[#212529] mb-3">
                      {course.title}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {course.description}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {formatTime(totalMin)} · {allLessons.length} contents
                    </p>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#6932CB] transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                    {firstId ? (
                      <Link
                        href={`/dashboard/courses/${course.id}/lessons/${firstId}`}
                        className="block w-full text-center py-3 px-4 border-2 rounded-lg font-semibold border-[#6932CB] text-[#6932CB] hover:bg-[#6932CB] hover:text-white transition-colors"
                      >
                        start now
                      </Link>
                    ) : (
                      <span className="block w-full text-center py-3 px-4 border border-gray-300 text-gray-400 font-semibold rounded-lg">
                        start now
                      </span>
                    )}
                  </div>
                </aside>
                <div className="lg:col-span-2 order-1 lg:order-2">
                  <CourseModulesList courseId={course.id} modules={modulesForList} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
