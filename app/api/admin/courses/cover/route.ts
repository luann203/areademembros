import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'
import { requireAdminApi } from '@/lib/require-admin'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export async function POST(request: Request) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const formData = await request.formData()
  const file = formData.get('cover')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Cover image is required.' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Use JPG, PNG, WEBP or GIF.' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Image must be up to 5MB.' }, { status: 400 })
  }

  const extension = file.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
  const fileName = `${randomBytes(12).toString('hex')}.${extension}`
  const coversDir = path.join(process.cwd(), 'public', 'covers')
  const filePath = path.join(coversDir, fileName)

  await mkdir(coversDir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filePath, buffer)

  return NextResponse.json({ imageUrl: `/covers/${fileName}` })
}
