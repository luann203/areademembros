import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Award } from 'lucide-react'

export default async function CertificatesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="ds-page-shell">
      <div className="mb-8">
        <h1 className="ds-page-title text-2xl sm:text-3xl mb-2">Certificates</h1>
        <p className="text-ds-secondary">Your completion certificates</p>
      </div>

      <div className="text-center py-12">
        <Award className="w-16 h-16 text-ds-muted mx-auto mb-4" />
        <p className="text-ds-secondary text-lg">
          You don&apos;t have any certificates yet. Complete courses to receive your certificates!
        </p>
      </div>
    </div>
  )
}
