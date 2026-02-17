import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import LessonContent from '@/components/LessonContent'

export default async function LessonPage({
  params,
}: {
  params: { id: string; lessonId: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Verificar se o usuário está inscrito no curso
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: params.id,
      },
    },
  })

  if (!enrollment) {
    redirect('/dashboard')
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              modules: {
                include: {
                  lessons: {
                    orderBy: { order: 'asc' },
                  },
                },
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      },
      progress: {
        where: {
          userId: session.user.id,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!lesson || lesson.module.course.id !== params.id) {
    redirect(`/dashboard/courses/${params.id}`)
  }

  // Encontrar aula anterior e próxima
  const allLessons = lesson.module.course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleId: m.id }))
  )
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id)
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  return (
    <LessonContent
      lesson={lesson}
      courseId={params.id}
      previousLesson={previousLesson}
      nextLesson={nextLesson}
      userId={session.user.id}
    />
  )
}
