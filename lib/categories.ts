import { prisma } from '@/lib/prisma'
import { EXPERT_COURSE_TITLES } from '@/lib/expert-courses'

export function courseIncludeForUser(userId: string) {
  return {
    modules: {
      orderBy: { order: 'asc' as const },
      include: {
        lessons: {
          orderBy: { order: 'asc' as const },
          include: {
            progress: {
              where: { userId },
              select: { completed: true, progress: true, updatedAt: true },
            },
          },
        },
      },
    },
  }
}

export async function bootstrapCategoriesIfMissing(): Promise<void> {
  try {
    const expert = await prisma.category.upsert({
      where: { slug: 'expert' },
      create: { name: 'Expert', slug: 'expert', order: 1 },
      update: { name: 'Expert', order: 1 },
    })

    for (const title of EXPERT_COURSE_TITLES) {
      await prisma.course.updateMany({
        where: { title },
        data: { categoryId: expert.id },
      })
    }
  } catch {
    // ignore
  }
}

export async function fetchHomeCategories(userId: string) {
  return prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      courses: {
        orderBy: { createdAt: 'desc' },
        include: courseIncludeForUser(userId),
      },
    },
  })
}
