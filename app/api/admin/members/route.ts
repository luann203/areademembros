import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/require-admin'
import { generatePassword } from '@/lib/generate-password'
import { syncMemberEnrollments } from '@/lib/admin-members'

export async function GET(request: NextRequest) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')?.trim()

  const where: Record<string, unknown> = { role: 'student' }

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ]
  }

  const members = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      accessEndsAt: true,
      createdAt: true,
      _count: { select: { enrollments: true } },
    },
  })

  const total = await prisma.user.count({ where: { role: 'student' } })

  return NextResponse.json({
    members: members.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      avatarUrl: member.avatarUrl,
      accessEndsAt: member.accessEndsAt?.toISOString() ?? null,
      createdAt: member.createdAt.toISOString(),
      enrollmentCount: member._count.enrollments,
    })),
    total,
  })
}

export async function POST(request: Request) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  const body = await request.json()
  const { email, name, accessEndsAt, courseIds } = body

  const normalizedEmail = String(email || '')
    .trim()
    .toLowerCase()
  if (!normalizedEmail) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    return NextResponse.json({ error: 'This email is already registered.' }, { status: 409 })
  }

  const plainPassword = generatePassword(10)
  const hashed = await bcrypt.hash(plainPassword, 10)

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: name?.trim() || normalizedEmail.split('@')[0] || 'Aluno',
      password: hashed,
      role: 'student',
      accessEndsAt: accessEndsAt ? new Date(accessEndsAt) : null,
    },
  })

  const ids = Array.isArray(courseIds) ? courseIds.filter((id) => typeof id === 'string') : []
  if (ids.length > 0) {
    await syncMemberEnrollments(user.id, ids)
  }

  const loginUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: 'Bem-vindo à área de membros',
      message: `Sua conta foi criada! Acesse ${loginUrl}/login com o e-mail ${user.email} e a senha: ${plainPassword}. Guarde esta senha em local seguro.`,
    },
  })

  return NextResponse.json(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      temporaryPassword: plainPassword,
    },
    { status: 201 }
  )
}
