import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/require-admin'
import AdminEditLessonForm from '@/components/admin/AdminEditLessonForm'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: { id: string }
  searchParams: { moduleId?: string }
}

export default async function AdminNewLessonPage({ params, searchParams }: PageProps) {
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

  if (course.modules.length === 0) {
    redirect(`/dashboard/admin/courses/${course.id}/edit`)
  }

  const defaultModuleId =
    searchParams.moduleId && course.modules.some((m) => m.id === searchParams.moduleId)
      ? searchParams.moduleId
      : course.modules[0].id

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
      <AdminEditLessonForm
        courseId={course.id}
        courseTitle={course.title}
        modules={modules}
        defaultModuleId={defaultModuleId}
        isNew
      />
    </div>
  )
}
