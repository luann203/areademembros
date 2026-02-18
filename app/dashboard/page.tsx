import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CourseCard from '@/components/CourseCard'
import type { Course } from '@prisma/client'
import type { Module } from '@prisma/client'
import { Play } from 'lucide-react'

type CourseWithModules = Course & {
  modules: (Module & { lessons: Array<{ id: string; duration: number | null }> })[]
  totalLessons: number
  totalDuration: number
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Buscar cursos que o usuário está inscrito (no Vercel pode não ter banco)
  let courses: Array<{
    id: string
    title: string
    description: string
    imageUrl: string | null
    duration: number | null
    modules: Array<{
      id: string
      lessons: Array<{ id: string; duration: number | null }>
    }>
  }> = []
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            modules: { include: { lessons: true } },
          },
        },
      },
    })
    courses = enrollments.map((e) => e.course)
  } catch (err) {
    // Sem banco (ex.: Vercel) – mostrar painel com lista vazia
    console.error('Dashboard: database unavailable', err)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] mb-1 md:mb-2">Contents</h1>
        <p className="text-gray-600 text-sm sm:text-base">Your available courses</p>
      </div>

      {courses.length === 0 ? (
        <div className="space-y-6">
          <p className="text-gray-500 text-base sm:text-lg text-center">
            You are not enrolled in any course yet.
          </p>
          <div className="max-w-md mx-auto">
            <Link
              href="/dashboard/demo-lesson"
              className="flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl border-2 font-semibold transition-colors text-[#6932CB] border-[#6932CB] hover:bg-[#6932CB] hover:text-white"
            >
              <Play className="w-5 h-5" />
              Ver aula demonstrativa
            </Link>
          </div>
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
                } as CourseWithModules}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
