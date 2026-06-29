import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/require-admin'

export default async function CommentsRedirectPage() {
  const session = await getAdminSession()
  if (session) {
    redirect('/dashboard/admin/comments')
  }
  redirect('/dashboard')
}
