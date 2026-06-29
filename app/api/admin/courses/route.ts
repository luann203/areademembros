import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/require-admin'

export async function GET() {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, imageUrl: true },
  })

  return NextResponse.json(courses)
}

export async function POST(request: Request) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const body = await request.json()
  const { title, description, salesPageUrl, categoryId, imageUrl } = body

  if (!title?.trim() || !description?.trim()) {
    return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 })
  }

  const course = await prisma.course.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      salesPageUrl: salesPageUrl?.trim() || null,
      categoryId: categoryId || null,
      imageUrl: imageUrl || null,
      showInShowcase: true,
      enableCommentModeration: true,
      modules: {
        create: {
          title: 'Module 1',
          description: 'Default module',
          order: 1,
          lessons: {
            create: {
              title: 'Welcome',
              description: 'First lesson of the course',
              order: 1,
            },
          },
        },
      },
    },
  })

  return NextResponse.json(course, { status: 201 })
}
