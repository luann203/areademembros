import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function TermsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="max-w-3xl">
      <header className="mb-6 md:mb-8">
        <p className="ds-label mb-2">Prohub.</p>
        <h1 className="ds-page-title text-2xl sm:text-3xl">Terms of Use</h1>
      </header>

      <div className="ds-card p-6 space-y-4 text-sm text-ds-secondary leading-relaxed">
        <p>
          By accessing and using this platform, you agree to comply with these terms of use and all
          applicable laws and regulations.
        </p>
        <p>
          Course content is provided for educational purposes. Reproduction, distribution, or
          commercial use without authorization is not permitted.
        </p>
        <p>
          We may update these terms at any time. Continued use of the platform after changes
          constitutes acceptance of the updated terms.
        </p>
      </div>
    </div>
  )
}
