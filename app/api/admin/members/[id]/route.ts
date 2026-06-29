import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/require-admin'
import { syncMemberEnrollments } from '@/lib/admin-members'

type RouteContext = { params: { id: string } }

export async function GET(_request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      accessEndsAt: true,
      createdAt: true,
      role: true,
      enrollments: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          courseId: true,
          createdAt: true,
          course: { select: { title: true } },
        },
      },
    },
  })

  if (!user || user.role === 'admin') {
    return NextResponse.json({ error: 'Member not found.' }, { status: 404 })
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    accessEndsAt: user.accessEndsAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    role: user.role,
    enrollments: user.enrollments.map((enrollment) => ({
      id: enrollment.id,
      courseId: enrollment.courseId,
      courseTitle: enrollment.course.title,
      createdAt: enrollment.createdAt.toISOString(),
    })),
  })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const existing = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, role: true, email: true },
  })

  if (!existing || existing.role === 'admin') {
    return NextResponse.json({ error: 'Member not found.' }, { status: 404 })
  }

  const body = await request.json()
  const { name, email, accessEndsAt, courseIds } = body

  const data: {
    name?: string
    email?: string
    accessEndsAt?: Date | null
  } = {}

  if (name !== undefined) data.name = name?.trim() ? name.trim() : null
  if (email !== undefined) {
    const normalized = String(email).trim().toLowerCase()
    if (!normalized) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }
    if (normalized !== existing.email) {
      const taken = await prisma.user.findUnique({ where: { email: normalized } })
      if (taken) {
        return NextResponse.json({ error: 'This email is already in use.' }, { status: 409 })
      }
      data.email = normalized
    }
  }
  if (accessEndsAt !== undefined) {
    data.accessEndsAt = accessEndsAt ? new Date(accessEndsAt) : null
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
  })

  if (Array.isArray(courseIds)) {
    await syncMemberEnrollments(
      params.id,
      courseIds.filter((id) => typeof id === 'string')
    )
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    accessEndsAt: user.accessEndsAt?.toISOString() ?? null,
  })
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const existing = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, role: true },
  })

  if (!existing || existing.role === 'admin') {
    return NextResponse.json({ error: 'Member not found.' }, { status: 404 })
  }

  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
