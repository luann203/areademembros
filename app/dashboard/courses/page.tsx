import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ensureBootstrapOnce } from '@/lib/bootstrap-course'
import { ensureUserEnrolledInAllCoursesOnce } from '@/lib/enrollment-sync'
import { fetchUserEnrollmentsWithCourses } from '@/lib/categories'
import { requireSessionUserId } from '@/lib/get-session-user'
import { buildStreamingCourse, sortByNewest } from '@/lib/streaming-courses'
import CoursePosterRow from '@/components/CoursePosterRow'
import CourseModulesList from '@/components/CourseModulesList'

export default async function ClassesPage({
  searchParams,
}: {
  searchParams?: { q?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = await requireSessionUserId(session)
  if (!userId) redirect('/login')

  await ensureBootstrapOnce()
  await ensureUserEnrolledInAllCoursesOnce(userId)

  const query = searchParams?.q?.trim().toLowerCase() ?? ''

  const enrollments = await fetchUserEnrollmentsWithCourses(userId)
  let courses = enrollments.map((e) => e.course)

  if (query) {
    courses = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.modules.some(
          (module) =>
            module.title.toLowerCase().includes(query) ||
            module.lessons.some(
              (lesson) =>
                lesson.title.toLowerCase().includes(query) ||
                lesson.description.toLowerCase().includes(query)
            )
        )
    )
  }

  const streamingCourses = sortByNewest(courses.map((course) => buildStreamingCourse(course)))

  return (
    <div className="ds-page-shell">
      <header className="mb-6 md:mb-8">
        <p className="ds-label mb-2">Prohub.</p>
        <h1 className="ds-page-title text-2xl sm:text-3xl mb-1">Classes</h1>
        <p className="text-ds-secondary text-sm sm:text-base">
          {query
            ? `Results for "${searchParams?.q?.trim()}"`
            : 'All your lessons in one place'}
        </p>
      </header>

      {streamingCourses.length > 0 && (
        <div className="mb-10">
          <CoursePosterRow title="All Courses" courses={streamingCourses} />
        </div>
      )}

      {courses.length === 0 ? (
        <p className="text-center py-12 text-ds-muted text-lg">
          {query ? 'No courses found for your search.' : 'You are not enrolled in any course yet.'}
        </p>
      ) : (
        <ul className="space-y-6 list-none p-0 m-0 max-w-6xl">
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
                  <div className="ds-card p-4 sm:p-6">
                    <h2 className="text-xl font-extrabold text-ds-primary mb-3 tracking-wide">
                      {course.title}
                    </h2>
                    <p className="text-ds-secondary text-sm leading-relaxed mb-4">
                      {course.description}
                    </p>
                    <p className="text-sm text-ds-muted mb-4">
                      {formatTime(totalMin)} · {allLessons.length} contents
                    </p>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-ds-muted mb-1">
                        <span>Progress</span>
                        <span className="text-ds-green font-semibold">{progressPct}%</span>
                      </div>
                      <div className="ds-progress-track h-2">
                        <div className="ds-progress-fill" style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>
                    {firstId ? (
                      <Link
                        href={`/dashboard/courses/${course.id}/lessons/${firstId}`}
                        className="ds-btn-primary w-full"
                      >
                        Start now
                      </Link>
                    ) : (
                      <span className="ds-btn-secondary w-full opacity-50 cursor-not-allowed">
                        Start now
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
