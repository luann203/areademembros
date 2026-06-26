import type { Prisma } from '@prisma/client'

export type CourseWithModules = Prisma.CourseGetPayload<{
  include: {
    modules: {
      include: {
        lessons: {
          include: { progress: true }
        }
      }
    }
  }
}>
