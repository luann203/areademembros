import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ContactSection from '@/components/ContactSection'

export default async function ContactPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="max-w-4xl ds-page-shell">
      <header className="mb-6 md:mb-8">
        <p className="ds-label mb-2">Prohub.</p>
        <h1 className="ds-page-title text-2xl sm:text-3xl mb-1">Contact</h1>
        <p className="text-ds-secondary text-sm sm:text-base">Get in touch with our support team.</p>
      </header>

      <ContactSection />
    </div>
  )
}
