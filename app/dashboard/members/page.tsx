import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/require-admin'

export default async function MembersRedirectPage() {
  const session = await getAdminSession()
  if (session) {
    redirect('/dashboard/admin/members')
  }
  redirect('/dashboard')
}
