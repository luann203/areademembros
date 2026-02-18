import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CourseModulesList from '@/components/CourseModulesList'

export default async function ClassesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  let courses: Array<{
    id: string
    title: string
    description: string
    modules: Array<{
      id: string
      title: string
      description: string | null
      lessons: Array<{
        id: string
        title: string
        duration: number | null
        progress: Array<{ completed: boolean; progress: number }>
      }>
    }>
  }> = []
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: {
                    progress: { where: { userId: session.user.id } },
                  },
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })
    courses = enrollments.map((e) => e.course)
  } catch (err) {
    console.error('Courses page: database unavailable', err)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] mb-1 md:mb-2">Classes</h1>
        <p className="text-gray-600 text-sm sm:text-base">Lessons from your courses</p>
      </div>

      {courses.length === 0 ? (
        <div className="space-y-6">
          <p className="text-gray-500 text-lg text-center">
            You are not enrolled in any course yet.
          </p>
          <div className="max-w-md mx-auto">
            <Link
              href="/dashboard/demo-lesson"
              className="flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl border-2 font-semibold transition-colors text-[#6932CB] border-[#6932CB] hover:bg-[#6932CB] hover:text-white"
            >
              Ver aula demonstrativa
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {courses.map((course) => {
            const allLessons = course.modules.flatMap((m) => m.lessons)
            const completedLessons = allLessons.filter((l) =>
              l.progress.some((p) => p.completed)
            )
            const courseProgress =
              allLessons.length > 0
                ? Math.round(
                    (completedLessons.length / allLessons.length) * 100
                  )
                : 0
            const totalMinutes = allLessons.reduce(
              (acc, l) => acc + (l.duration ?? 0),
              0
            )
            const formatTotalDuration = (minutes: number) => {
              const h = Math.floor(minutes / 60)
              const m = minutes % 60
              if (h > 0) return `${h}h ${m}m`
              return `${m}m`
            }
            const firstLessonId = allLessons[0]?.id

            const modulesForClient = course.modules.map((m) => ({
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
              <div key={course.id} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Caixinha do curso */}
                <div className="lg:col-span-1 order-2 lg:order-1">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[#212529] mb-3">
                      {course.title}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span>{formatTotalDuration(totalMinutes)}</span>
                      <span>{allLessons.length} contents</span>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{courseProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${courseProgress}%`,
                            backgroundColor: '#6932CB',
                          }}
                        />
                      </div>
                    </div>
                    {firstLessonId ? (
                      <Link
                        href={`/dashboard/courses/${course.id}/lessons/${firstLessonId}`}
                        className="block w-full text-center py-3 px-4 border-2 rounded-lg font-semibold transition-colors bg-white hover:bg-gray-50"
                        style={{
                          borderColor: '#6932CB',
                          color: '#6932CB',
                        }}
                      >
                        start now
                      </Link>
                    ) : (
                      <span className="block w-full text-center py-3 px-4 border border-gray-300 text-gray-400 font-semibold rounded-lg cursor-not-allowed">
                        start now
                      </span>
                    )}
                  </div>
                </div>

                {/* Lista de aulas */}
                <div className="lg:col-span-2 order-1 lg:order-2">
                  <CourseModulesList
                    courseId={course.id}
                    modules={modulesForClient}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
