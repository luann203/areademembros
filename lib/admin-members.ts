import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generatePassword } from '@/lib/generate-password'

export async function resendMemberPassword(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  })

  if (!user || user.role === 'admin') {
    throw new Error('Member not found.')
  }

  const plainPassword = generatePassword(10)
  const hashed = await bcrypt.hash(plainPassword, 10)

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  })

  const loginUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: 'Nova senha de acesso',
      message: `Sua senha foi redefinida. Acesse ${loginUrl}/login com o e-mail ${user.email} e a senha: ${plainPassword}. Guarde esta senha em local seguro.`,
    },
  })

  return plainPassword
}

export async function syncMemberEnrollments(userId: string, courseIds: string[]) {
  const uniqueIds = Array.from(new Set(courseIds.filter(Boolean)))

  const existing = await prisma.enrollment.findMany({
    where: { userId },
    select: { courseId: true },
  })

  const existingIds = new Set(existing.map((e) => e.courseId))
  const toAdd = uniqueIds.filter((id) => !existingIds.has(id))
  const toRemove = Array.from(existingIds).filter((id) => !uniqueIds.includes(id))

  if (toRemove.length > 0) {
    await prisma.enrollment.deleteMany({
      where: { userId, courseId: { in: toRemove } },
    })
  }

  if (toAdd.length > 0) {
    await prisma.enrollment.createMany({
      data: toAdd.map((courseId) => ({ userId, courseId })),
      skipDuplicates: true,
    })
  }
}
