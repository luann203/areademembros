import { requireAdminPage } from '@/lib/require-admin'
import AdminNotificationsForm from '@/components/admin/AdminNotificationsForm'

export const dynamic = 'force-dynamic'

export default async function AdminNotificationsPage() {
  await requireAdminPage()

  return (
    <div className="ds-page-shell">
      <header className="mb-8">
        <p className="ds-label mb-2">Prohub.</p>
        <h1 className="ds-page-title text-2xl sm:text-3xl">Notifications</h1>
      </header>
      <AdminNotificationsForm />
    </div>
  )
}
