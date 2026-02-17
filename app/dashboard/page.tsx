import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CourseCard from '@/components/CourseCard'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Buscar cursos que o usuário está inscrito
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: true,
            },
          },
        },
      },
    },
  })

  const courses = enrollments.map((enrollment) => enrollment.course)

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] mb-1 md:mb-2">Contents</h1>
        <p className="text-gray-600 text-sm sm:text-base">Your available courses</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-500 text-base sm:text-lg">You are not enrolled in any course yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {courses.map((course) => {
            const totalLessons = course.modules.reduce(
              (acc, module) => acc + module.lessons.length,
              0
            )
            const totalDuration = course.modules.reduce(
              (acc, module) =>
                acc +
                module.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0),
              0
            )

            return (
              <CourseCard
                key={course.id}
                course={{
                  ...course,
                  totalLessons,
                  totalDuration,
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
