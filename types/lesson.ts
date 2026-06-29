import type { Prisma } from '@prisma/client'

export type LessonWithRelationsForPage = Prisma.LessonGetPayload<{
  include: {
    module: {
      include: {
        course: {
          select: { id: true; title: true }
        }
      }
    }
    progress: true
  }
}>
