import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/require-admin'
import AdminCategoriesView from '@/components/admin/AdminCategoriesView'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  await requireAdminPage()

  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { courses: true } } },
  })

  return (
    <div className="ds-page-shell">
      <header className="mb-8">
        <p className="ds-label mb-2">Prohub.</p>
        <h1 className="ds-page-title text-2xl sm:text-3xl">Categories</h1>
      </header>
      <AdminCategoriesView initialCategories={categories} />
    </div>
  )
}
