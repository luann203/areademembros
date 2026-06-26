import type { Prisma } from '@prisma/client'

export type LessonWithRelationsForPage = Prisma.LessonGetPayload<{
  include: {
    module: {
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: true }
            }
          }
        }
      }
    }
    progress: true
    comments: {
      include: { user: { select: { id: true; name: true; email: true } } }
    }
  }
}>
