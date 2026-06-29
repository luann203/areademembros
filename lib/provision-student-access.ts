import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generatePassword } from '@/lib/generate-password'
import {
  matchesIntegrationOffer,
  parseHotmartPurchase,
  parseIntegrationCourseIds,
} from '@/lib/hotmart-webhook'
import type { Integration } from '@prisma/client'

export type ProvisionResult = {
  ok: boolean
  reason?: string
  action?: 'enroll' | 'revoke'
  isNewUser?: boolean
  enrolledCourses?: string[]
  revokedCourses?: string[]
}

export async function provisionStudentAccess({
  email,
  name,
  courseIds,
}: {
  email: string
  name?: string
  courseIds: string[]
}): Promise<ProvisionResult> {
  if (courseIds.length === 0) {
    return { ok: false, reason: 'no_courses_linked' }
  }

  let user = await prisma.user.findUnique({ where: { email } })
  let isNewUser = false
  let plainPassword: string | null = null

  if (!user) {
    plainPassword = generatePassword(10)
    const hashed = await bcrypt.hash(plainPassword, 10)
    user = await prisma.user.create({
      data: {
        email,
        name: name?.trim() || email.split('@')[0] || 'Aluno',
        password: hashed,
        role: 'student',
      },
    })
    isNewUser = true
  } else if (name?.trim() && !user.name) {
    await prisma.user.update({
      where: { id: user.id },
      data: { name: name.trim() },
    })
  }

  const enrolledCourses: string[] = []

  for (const courseId of courseIds) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    })
    if (!course) continue

    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      create: { userId: user.id, courseId: course.id },
      update: {},
    })
    enrolledCourses.push(course.title)
  }

  if (enrolledCourses.length === 0) {
    return { ok: false, reason: 'courses_not_found' }
  }

  const loginUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  if (isNewUser && plainPassword) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Bem-vindo à área de membros',
        message: `Sua compra foi confirmada! Acesse ${loginUrl}/login com o e-mail ${email} e a senha: ${plainPassword}. Guarde esta senha em local seguro.`,
      },
    })
  } else {
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Novo curso liberado',
        message: `Seu acesso foi liberado para: ${enrolledCourses.join(', ')}. Entre em ${loginUrl}/login com seu e-mail e senha.`,
      },
    })
  }

  return { ok: true, action: 'enroll', isNewUser, enrolledCourses }
}

export async function revokeStudentAccess({
  email,
  courseIds,
}: {
  email: string
  courseIds: string[]
}): Promise<ProvisionResult> {
  if (courseIds.length === 0) {
    return { ok: false, reason: 'no_courses_linked' }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { ok: true, action: 'revoke', reason: 'user_not_found', revokedCourses: [] }
  }

  const revokedCourses: string[] = []

  for (const courseId of courseIds) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    })
    if (!course) continue

    const deleted = await prisma.enrollment.deleteMany({
      where: { userId: user.id, courseId: course.id },
    })
    if (deleted.count > 0) {
      revokedCourses.push(course.title)
    }
  }

  if (revokedCourses.length === 0) {
    return { ok: true, action: 'revoke', reason: 'no_enrollment', revokedCourses: [] }
  }

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: 'Acesso removido',
      message: `Seu acesso foi encerrado para: ${revokedCourses.join(', ')}. Em caso de dúvida, entre em contato com o suporte.`,
    },
  })

  return { ok: true, action: 'revoke', revokedCourses }
}

export async function processHotmartWebhook(
  integration: Integration,
  payload: unknown
): Promise<ProvisionResult> {
  const purchase = parseHotmartPurchase(payload)
  if (!purchase) {
    return { ok: false, reason: 'invalid_payload' }
  }

  if (!matchesIntegrationOffer(integration.offerId, purchase.offerCode)) {
    return { ok: false, reason: 'offer_mismatch' }
  }

  const courseIds = parseIntegrationCourseIds(integration.courseIds)

  if (purchase.shouldRevoke) {
    return revokeStudentAccess({
      email: purchase.email,
      courseIds,
    })
  }

  if (!purchase.shouldEnroll) {
    return { ok: false, reason: 'event_not_eligible' }
  }

  return provisionStudentAccess({
    email: purchase.email,
    name: purchase.name,
    courseIds,
  })
}
