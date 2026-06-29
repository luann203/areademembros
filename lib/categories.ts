import { prisma } from '@/lib/prisma'
import { EXPERT_COURSE_TITLES } from '@/lib/expert-courses'
import { buildStreamingCourse } from '@/lib/streaming-courses'
import type { CourseCategory } from '@/types/streaming'

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

    await prisma.course.updateMany({
      where: { title: { in: EXPERT_COURSE_TITLES } },
      data: { categoryId: expert.id },
    })
  } catch {
    // ignore
  }
}

export async function fetchCategoryMeta() {
  return prisma.category.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, name: true, slug: true, order: true },
  })
}

export async function fetchUserEnrollmentsWithCourses(userId: string) {
  return prisma.enrollment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      course: {
        include: {
          category: { select: { id: true, name: true, slug: true, order: true } },
          ...courseIncludeForUser(userId),
        },
      },
    },
  })
}

type CourseForCategory = Parameters<typeof buildStreamingCourse>[0] & {
  categoryId: string | null
  createdAt: Date
}

export function buildCategoriesFromCourses(
  categoryMeta: { id: string; name: string; slug: string }[],
  courses: CourseForCategory[]
): CourseCategory[] {
  const streamingById = new Map(
    courses.map((course) => [course.id, buildStreamingCourse(course)])
  )

  return categoryMeta
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      courses: courses
        .filter((course) => course.categoryId === category.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((course) => streamingById.get(course.id)!)
        .filter(Boolean),
    }))
    .filter((category) => category.courses.length > 0)
}
