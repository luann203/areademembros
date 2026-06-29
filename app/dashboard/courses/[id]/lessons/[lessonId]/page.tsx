import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireSessionUserId } from '@/lib/get-session-user'
import LessonContent from '@/components/LessonContent'
import type { LessonWithRelationsForPage } from '@/types/lesson'

export default async function LessonPage({
  params,
}: {
  params: { id: string; lessonId: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = await requireSessionUserId(session)
  if (!userId) redirect('/login')

  let lesson: LessonWithRelationsForPage | null = null
  let previousLesson: { id: string; title: string; moduleId: string } | null = null
  let nextLesson: { id: string; title: string; moduleId: string } | null = null

  try {
    const [enrollment, lessonData, navModules] = await Promise.all([
      prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: params.id,
          },
        },
        select: { id: true },
      }),
      prisma.lesson.findUnique({
        where: { id: params.lessonId },
        include: {
          module: {
            include: {
              course: {
                select: { id: true, title: true },
              },
            },
          },
          progress: {
            where: { userId },
          },
        },
      }),
      prisma.module.findMany({
        where: { courseId: params.id },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          lessons: {
            orderBy: { order: 'asc' },
            select: { id: true, title: true },
          },
        },
      }),
    ])

    if (!enrollment) {
      redirect('/dashboard')
    }

    lesson = lessonData

    if (!lesson || lesson.module.course.id !== params.id) {
      redirect(`/dashboard/courses/${params.id}`)
    }

    const allLessons = navModules.flatMap((m) =>
      m.lessons.map((l) => ({ ...l, moduleId: m.id }))
    )
    const currentIndex = allLessons.findIndex((l) => l.id === lesson!.id)
    previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
    nextLesson =
      currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
  } catch (err) {
    console.error('Lesson page: database unavailable', err)
    redirect('/dashboard')
  }

  return (
    <LessonContent
      lesson={lesson!}
      courseId={params.id}
      previousLesson={previousLesson}
      nextLesson={nextLesson}
      userId={userId}
    />
  )
}
