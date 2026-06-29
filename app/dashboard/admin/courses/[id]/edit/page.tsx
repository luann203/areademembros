import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/require-admin'
import AdminEditCourseView from '@/components/admin/AdminEditCourseView'
import type { AdminCourseDetail } from '@/types/admin'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: { id: string }
}

export default async function AdminEditCoursePage({ params }: PageProps) {
  await requireAdminPage()

  const [course, categories] = await Promise.all([
    prisma.course.findUnique({
      where: { id: params.id },
      include: {
        category: { select: { id: true, name: true } },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: { orderBy: { order: 'asc' } },
          },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { courses: true } } },
    }),
  ])

  if (!course) notFound()

  const serialized: AdminCourseDetail = {
    id: course.id,
    title: course.title,
    acronym: course.acronym,
    description: course.description,
    salesPageUrl: course.salesPageUrl,
    imageUrl: course.imageUrl,
    duration: course.duration,
    categoryId: course.categoryId,
    showInShowcase: course.showInShowcase,
    enableCommentModeration: course.enableCommentModeration,
    category: course.category,
    modules: course.modules.map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      order: module.order,
      courseId: module.courseId,
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        order: lesson.order,
        moduleId: lesson.moduleId,
        showFooter: lesson.showFooter,
      })),
    })),
  }

  return (
    <div className="ds-page-shell">
      <AdminEditCourseView course={serialized} categories={categories} />
    </div>
  )
}
