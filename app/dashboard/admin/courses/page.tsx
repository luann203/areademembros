import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/require-admin'
import AdminCoursesList from '@/components/admin/AdminCoursesList'

export const dynamic = 'force-dynamic'

export default async function AdminCoursesPage() {
  await requireAdminPage()

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, imageUrl: true, createdAt: true },
  })

  return (
    <div className="ds-page-shell">
      <header className="mb-8">
        <p className="ds-label mb-2">Prohub.</p>
        <h1 className="ds-page-title text-2xl sm:text-3xl">Courses</h1>
      </header>
      <AdminCoursesList
        courses={courses.map((course) => ({
          ...course,
          createdAt: course.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
