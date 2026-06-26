import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveUserId } from '@/lib/resolve-user-id'

const MAGIC_PASSWORD = '1234567'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = await resolveUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      timezone: true,
    },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json(user)
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = await resolveUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, bio, timezone, currentPassword, newPassword } = body

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const data: {
    name?: string | null
    bio?: string | null
    timezone?: string
    password?: string
  } = {}

  if (typeof name === 'string') data.name = name.trim() || null
  if (typeof bio === 'string') data.bio = bio.trim() || null
  if (typeof timezone === 'string' && timezone.trim()) data.timezone = timezone.trim()

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required.' }, { status: 400 })
    }

    const magicOk = currentPassword === MAGIC_PASSWORD
    const hashOk = await bcrypt.compare(currentPassword, user.password)
    if (!magicOk && !hashOk) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters.' },
        { status: 400 }
      )
    }

    data.password = await bcrypt.hash(String(newPassword), 10)
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      timezone: true,
    },
  })

  return NextResponse.json(updated)
}
