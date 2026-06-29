import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/require-admin'
import { slugify } from '@/lib/slugify'

type RouteContext = { params: { id: string } }

export async function PATCH(request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const body = await request.json()
  const { name, order } = body

  const existing = await prisma.category.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Category not found.' }, { status: 404 })
  }

  const data: { name?: string; slug?: string; order?: number } = {}

  if (name?.trim()) {
    data.name = name.trim()
    const baseSlug = slugify(name.trim()) || existing.slug
    if (baseSlug !== existing.slug) {
      let slug = baseSlug
      let suffix = 1
      while (
        await prisma.category.findFirst({
          where: { slug, NOT: { id: params.id } },
        })
      ) {
        slug = `${baseSlug}-${suffix}`
        suffix += 1
      }
      data.slug = slug
    }
  }

  if (typeof order === 'number') {
    data.order = order
  }

  const category = await prisma.category.update({
    where: { id: params.id },
    data,
    include: { _count: { select: { courses: true } } },
  })

  revalidateTag('categories')
  return NextResponse.json(category)
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const existing = await prisma.category.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Category not found.' }, { status: 404 })
  }

  await prisma.category.delete({ where: { id: params.id } })
  revalidateTag('categories')
  return NextResponse.json({ ok: true })
}
