import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/require-admin'
import { slugify } from '@/lib/slugify'

export async function GET() {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { courses: true } } },
  })

  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const body = await request.json()
  const { name, order } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }

  const baseSlug = slugify(name.trim()) || 'category'
  let slug = baseSlug
  let suffix = 1

  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  const maxOrder = await prisma.category.aggregate({ _max: { order: true } })
  const nextOrder = typeof order === 'number' ? order : (maxOrder._max.order ?? 0) + 1

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      slug,
      order: nextOrder,
    },
    include: { _count: { select: { courses: true } } },
  })

  revalidateTag('categories')
  return NextResponse.json(category, { status: 201 })
}
