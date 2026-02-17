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
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] mb-1 md:mb-2">Contact</h1>
        <p className="text-gray-600 text-sm sm:text-base">Get in touch with our support team.</p>
      </div>

      <ContactSection />
    </div>
  )
}
