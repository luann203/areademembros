import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveUserId } from '@/lib/resolve-user-id'
import {
  getPublicAvatarUrl,
  isSupabaseStorageConfigured,
  supabaseAdmin,
} from '@/lib/supabase'
import { extensionForImageType, validateImageMagicBytes } from '@/lib/validate-file'

const MAX_SIZE = 2 * 1024 * 1024

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

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Image must be up to 2MB.' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const detectedType = validateImageMagicBytes(buffer)

  if (!detectedType) {
    return NextResponse.json({ error: 'Invalid file type. Use JPG, PNG or WEBP.' }, { status: 400 })
  }

  const extension = extensionForImageType(detectedType)
  const fileName = `${userId}-${Date.now()}.${extension}`
  let avatarUrl: string

  if (isSupabaseStorageConfigured() && supabaseAdmin) {
    const { error } = await supabaseAdmin.storage.from('avatars').upload(fileName, buffer, {
      contentType: detectedType,
      upsert: true,
    })

    if (error) {
      console.error('[avatar] Supabase upload failed:', error)
      return NextResponse.json({ error: 'Failed to upload avatar.' }, { status: 500 })
    }

    avatarUrl = getPublicAvatarUrl(fileName)
  } else {
    const avatarsDir = path.join(process.cwd(), 'public', 'avatars')
    const legacyName = `${userId}.${extension}`
    const filePath = path.join(avatarsDir, legacyName)

    await mkdir(avatarsDir, { recursive: true })
    await writeFile(filePath, buffer)
    avatarUrl = `/avatars/${legacyName}?v=${Date.now()}`
  }

  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
  })

  return NextResponse.json({ avatarUrl })
}
