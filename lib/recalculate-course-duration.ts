import { prisma } from '@/lib/prisma'

export async function recalculateCourseDuration(courseId: string): Promise<void> {
  const lessons = await prisma.lesson.findMany({
    where: { module: { courseId } },
    select: { duration: true },
  })

  const total = lessons.reduce((acc, lesson) => acc + (lesson.duration ?? 0), 0)

  await prisma.course.update({
    where: { id: courseId },
    data: { duration: total > 0 ? total : null },
  })
}
