import Link from 'next/link'
import Image from 'next/image'
import { Clock, BookOpen } from 'lucide-react'
import { Course } from '@prisma/client'
import { Module } from '@prisma/client'

type CourseWithModules = Course & {
  modules: (Module & {
    lessons: Array<{ duration: number | null }>
  })[]
  totalLessons: number
  totalDuration: number
}

export default function CourseCard({ course }: { course: CourseWithModules }) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <Link href={`/dashboard/courses/${course.id}`}>
      <div className="w-full max-w-[430px] mx-auto md:max-w-none md:mx-0 bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer border border-gray-100">
        <div
          className="relative w-full flex items-center justify-center bg-[#6932CB]"
          style={{ aspectRatio: '430 / 215' }}
        >
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 430px"
            />
          ) : (
            <BookOpen className="w-16 h-16 text-white opacity-60" strokeWidth={1.5} />
          )}
        </div>
        <div className="p-4 sm:p-6 box-border">
          <h3 className="text-lg font-bold text-[#212529] mb-2 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">
            {course.description}
          </p>
          <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-2 shrink-0">
              <BookOpen className="w-4 h-4 flex-shrink-0" aria-hidden />
              <span className="whitespace-nowrap">{course.totalLessons} lessons</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Clock className="w-4 h-4 flex-shrink-0" aria-hidden />
              <span className="whitespace-nowrap">{formatDuration(course.totalDuration)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
