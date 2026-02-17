import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MessageSquare } from 'lucide-react'

export default async function CommentsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Comments</h1>
        <p className="text-gray-600">All your comments</p>
      </div>

      <div className="text-center py-12">
        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">
          You haven&apos;t made any comments yet. Start interacting in the lessons!
        </p>
      </div>
    </div>
  )
}
