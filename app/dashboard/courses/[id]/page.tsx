import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveUserId } from '@/lib/resolve-user-id'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import CourseModulesList from '@/components/CourseModulesList'
import type { CourseWithModules } from '@/types/course'

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const userId = await resolveUserId(session)
  if (!userId) {
    redirect('/login')
  }

  let course: CourseWithModules | null = null
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: params.id,
        },
      },
    })

    if (!enrollment) {
      redirect('/dashboard')
    }

    course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                progress: {
                  where: { userId },
                },
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    })
  } catch (err) {
    console.error('Course detail: database unavailable', err)
    redirect('/dashboard')
  }

  if (!course) {
    redirect('/dashboard')
  }

  const allLessons = course.modules.flatMap((m) => m.lessons)
  const completedLessons = allLessons.filter((l) =>
    l.progress.some((p) => p.completed)
  )
  const courseProgress =
    allLessons.length > 0
      ? Math.round((completedLessons.length / allLessons.length) * 100)
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

  const firstLessonId = allLessons[0]?.id

  return (
    <div className="max-w-6xl ds-page-shell">
      <div className="flex items-center gap-2 text-xs sm:text-sm text-ds-muted mb-4 sm:mb-6 overflow-x-auto min-w-0">
        <Link href="/dashboard" className="hover:text-ds-green shrink-0">
          Contents
        </Link>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <span className="truncate">{course.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="w-full max-w-[430px] lg:max-w-none mx-auto ds-card overflow-hidden lg:sticky lg:top-6">
            {course.imageUrl && (
              <div className="relative w-full bg-gray-100" style={{ aspectRatio: '430 / 215' }}>
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 430px"
                />
              </div>
            )}
            <div className="p-4 sm:p-6 box-border">
            <h2 className="text-lg sm:text-xl font-extrabold text-ds-primary mb-2 sm:mb-3 tracking-wide">
              {course.title}
            </h2>
            <p className="text-ds-secondary text-sm leading-relaxed mb-4">
              {course.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-ds-muted mb-4">
                <span>{formatTotalDuration(totalMinutes)}</span>
                <span>{allLessons.length} contents</span>
              </div>
              <div className="mb-4">
              <div className="flex justify-between text-xs text-ds-muted mb-1">
                <span>Progress</span>
                <span className="text-ds-green font-semibold">{courseProgress}%</span>
              </div>
              <div className="ds-progress-track h-2 mb-4">
                <div className="ds-progress-fill" style={{ width: `${courseProgress}%` }} />
              </div>
            </div>
            {firstLessonId ? (
              <Link
                href={`/dashboard/courses/${course.id}/lessons/${firstLessonId}`}
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
          </div>
        </div>

        <div className="lg:col-span-2 order-1 lg:order-2">
          <CourseModulesList courseId={course.id} modules={modulesForClient} />
        </div>
      </div>
    </div>
  )
}
