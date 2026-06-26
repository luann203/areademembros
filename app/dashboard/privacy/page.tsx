import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function PrivacyPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="max-w-3xl">
      <header className="mb-6 md:mb-8">
        <p className="ds-label mb-2">Prohub.</p>
        <h1 className="ds-page-title text-2xl sm:text-3xl">Privacy Policies</h1>
      </header>

      <div className="ds-card p-6 space-y-4 text-sm text-ds-secondary leading-relaxed">
        <p>
          We respect your privacy and are committed to protecting your personal data in accordance
          with applicable legislation.
        </p>
        <p>
          Information such as name, email, and course progress is used to provide access to content,
          personalize your experience, and improve our services.
        </p>
        <p>
          We do not sell your personal data. You may request access, correction, or deletion of your
          information by contacting our support team.
        </p>
      </div>
    </div>
  )
}
