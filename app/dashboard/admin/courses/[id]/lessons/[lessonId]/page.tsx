import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/require-admin'
import AdminEditLessonForm from '@/components/admin/AdminEditLessonForm'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: { id: string; lessonId: string }
  searchParams: { created?: string }
}

export default async function AdminEditLessonPage({ params, searchParams }: PageProps) {
  await requireAdminPage()

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' } } },
      },
    },
  })

  if (!course) notFound()

  const lesson = await prisma.lesson.findFirst({
    where: {
      id: params.lessonId,
      module: { courseId: params.id },
    },
  })

  if (!lesson) notFound()

  const modules = course.modules.map((module) => ({
    id: module.id,
    title: module.title,
    description: module.description,
    order: module.order,
    courseId: module.courseId,
    lessons: module.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      videoUrl: l.videoUrl,
      duration: l.duration,
      order: l.order,
      moduleId: l.moduleId,
      showFooter: l.showFooter,
    })),
  }))

  return (
    <div className="ds-page-shell">
      {searchParams.created === '1' && (
        <p className="mb-6 text-sm text-green-400 border border-green-500/30 bg-green-500/10 rounded-lg px-4 py-3">
          Aula criada com sucesso!
        </p>
      )}
      <AdminEditLessonForm
        courseId={course.id}
        courseTitle={course.title}
        modules={modules}
        lesson={{
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration,
          order: lesson.order,
          moduleId: lesson.moduleId,
          showFooter: lesson.showFooter,
        }}
      />
    </div>
  )
}
