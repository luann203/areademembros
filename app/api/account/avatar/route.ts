import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveUserId } from '@/lib/resolve-user-id'

const MAX_SIZE = 2 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = await resolveUserId(session)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('avatar')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Avatar file is required.' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Use JPG, PNG, WEBP or GIF.' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Image must be up to 2MB.' }, { status: 400 })
  }

  const extension = file.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
  const fileName = `${userId}.${extension}`
  const avatarsDir = path.join(process.cwd(), 'public', 'avatars')
  const filePath = path.join(avatarsDir, fileName)

  await mkdir(avatarsDir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filePath, buffer)

  const avatarUrl = `/avatars/${fileName}?v=${Date.now()}`

  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
  })

  return NextResponse.json({ avatarUrl })
}
