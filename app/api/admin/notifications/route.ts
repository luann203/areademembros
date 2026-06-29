import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/require-admin'

export async function POST(request: Request) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const body = await request.json()
  const { title, message, target } = body

  if (!title?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Title and message are required.' }, { status: 400 })
  }

  const where =
    target === 'students'
      ? { role: 'student' }
      : target === 'all'
        ? {}
        : { role: 'student' }

  const users = await prisma.user.findMany({
    where,
    select: { id: true },
  })

  if (users.length === 0) {
    return NextResponse.json({ error: 'No recipients found.' }, { status: 400 })
  }

  await prisma.notification.createMany({
    data: users.map((user) => ({
      userId: user.id,
      title: title.trim(),
      message: message.trim(),
    })),
  })

  return NextResponse.json({ sent: users.length }, { status: 201 })
}
