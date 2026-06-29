import { ensureUserEnrolledInAllCourses } from '@/lib/bootstrap-course'

const syncedEnrollmentUserIds = new Set<string>()

export async function ensureUserEnrolledInAllCoursesOnce(userId: string): Promise<void> {
  if (userId.startsWith('magic-') || syncedEnrollmentUserIds.has(userId)) return
  await ensureUserEnrolledInAllCourses(userId)
  syncedEnrollmentUserIds.add(userId)
}
