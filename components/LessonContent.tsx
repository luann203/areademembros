'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react'
import ReactPlayer from 'react-player'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import CommentSection from './CommentSection'
import { Lesson, Module, Comment, User, LessonProgress } from '@prisma/client'

type LessonWithRelations = Lesson & {
  module: Module & {
    course: {
      id: string
      title: string
    }
  }
  progress: LessonProgress[]
  comments: (Comment & {
    user: Pick<User, 'id' | 'name' | 'email'>
  })[]
}

type LessonWithModule = {
  id: string
  title: string
  moduleId: string
}

// Formata a descrição: parágrafos, negrito em termos-chave, blocos de contato
function LessonDescription({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim())
  const boldRegex = /(\S+@\S+\.\S+|YSense|Sincerely,|Rewards Team|https?:\/\/[^\s]+|\*[^*]+\*)/gi

  const renderFormattedText = (content: string) => {
    const parts = content.split(boldRegex)
    return parts.map((part, j) => {
      if (!part) return null
      const isEmail = /\S+@\S+\.\S+/.test(part)
      const isUrl = /^https?:\/\//i.test(part)
      const isBold =
        isEmail ||
        isUrl ||
        /^YSense$/i.test(part) ||
        /^Sincerely,$/.test(part) ||
        /^Rewards Team$/i.test(part) ||
        (part.startsWith('*') && part.endsWith('*'))
      const formatted =
        part.startsWith('*') && part.endsWith('*') ? part.slice(1, -1) : part

      if (isUrl) {
        return (
          <a
            key={j}
            href={formatted}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#2C3E50] hover:underline break-all"
          >
            {formatted}
          </a>
        )
      }
      if (isEmail) {
        return (
          <a
            key={j}
            href={`mailto:${formatted}`}
            className="font-medium text-[#2C3E50] hover:underline"
          >
            {formatted}
          </a>
        )
      }
      return isBold ? (
        <strong key={j} className="font-medium text-[#2C3E50]">
          {formatted}
        </strong>
      ) : (
        <span key={j}>{formatted}</span>
      )
    })
  }

  return (
    <div
      className="text-[14px] text-[#34495E] font-normal leading-[1.65] space-y-6"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}
    >
      {paragraphs.map((paragraph, i) => {
        const trimmed = paragraph.trim()
        const isContactBlock =
          trimmed.includes('@') && trimmed.includes('.com') && trimmed.length < 80
        const isSignOff =
          /^Sincerely,/i.test(trimmed) || /^Rewards Team$/i.test(trimmed)

        if (isContactBlock) {
          return (
            <div
              key={i}
              className="text-[14px] text-[#34495E] leading-[1.65]"
            >
              <p>
                {trimmed.split(/\n/).map((line, k) => (
                  <span key={k}>
                    {k > 0 && <br />}
                    {renderFormattedText(line)}
                  </span>
                ))}
              </p>
            </div>
          )
        }

        if (isSignOff) {
          return (
            <p key={i} className="text-[13px] text-[#34495E] italic leading-[1.6]">
              {renderFormattedText(trimmed)}
            </p>
          )
        }

        return (
          <p key={i} className="whitespace-pre-line">
            {trimmed.split(/\n/).map((line, k) => (
              <span key={k}>
                {k > 0 && <br />}
                {renderFormattedText(line)}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

export default function LessonContent({
  lesson,
  courseId,
  previousLesson,
  nextLesson,
  userId,
}: {
  lesson: LessonWithRelations
  courseId: string
  previousLesson: LessonWithModule | null
  nextLesson: LessonWithModule | null
  userId: string
}) {
  const [progress, setProgress] = useState(lesson.progress[0]?.progress || 0)
  const [completed, setCompleted] = useState(lesson.progress[0]?.completed || false)
  const [rating, setRating] = useState<number | null>(null)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)

  const handleProgress = async (played: number) => {
    const newProgress = played * 100
    if (Math.abs(newProgress - progress) > 5) {
      // Atualizar apenas se a diferença for significativa (5%)
      setProgress(newProgress)
      await updateProgress(newProgress, false)
    }
  }

  const handleEnded = async () => {
    setProgress(100)
    setCompleted(true)
    await updateProgress(100, true)
  }

  const updateProgress = async (newProgress: number, isCompleted: boolean) => {
    try {
      await fetch(`/api/lessons/${lesson.id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress: newProgress,
          completed: isCompleted,
        }),
      })
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error)
    }
  }

  const handleMarkComplete = async () => {
    setIsMarkingComplete(true)
    try {
      await updateProgress(100, true)
      setCompleted(true)
      setProgress(100)
    } catch (error) {
      console.error('Erro ao marcar como concluída:', error)
    } finally {
      setIsMarkingComplete(false)
    }
  }

  const handleRating = async (value: number) => {
    setRating(value)
    // Aqui você pode adicionar uma API call para salvar a avaliação
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 overflow-x-auto min-w-0">
          <Link href="/dashboard" className="hover:text-primary-600">
            Contents
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            href={`/dashboard/courses/${courseId}`}
            className="hover:text-primary-600"
          >
            {lesson.module.course.title}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span>{lesson.module.title}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Conteúdo Principal */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 min-w-0">
          {/* Player de Vídeo */}
          <div className="rounded-lg overflow-hidden bg-black">
            {lesson.videoUrl ? (
              lesson.videoUrl.includes('pandavideo') ? (
                <div>
                  <div
                    className="relative w-full bg-black"
                    style={{ paddingTop: '56.25%' }}
                  >
                    <iframe
                      src={lesson.videoUrl}
                      className="absolute top-0 left-0 w-full h-full border-0"
                      style={{ width: '100%', height: '100%' }}
                      allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
                      allowFullScreen
                      title="Lesson video"
                      loading="eager"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                </div>
              ) : (
                <div className="aspect-video">
                  <ReactPlayer
                    url={lesson.videoUrl}
                    width="100%"
                    height="100%"
                    controls
                    onProgress={({ played }) => handleProgress(played)}
                    onEnded={handleEnded}
                    config={{
                      file: {
                        attributes: {
                          controlsList: 'nodownload',
                        },
                      },
                    }}
                  />
                </div>
              )
            ) : (
              <div className="aspect-video flex items-center justify-center text-white">
                <p>Video not available</p>
              </div>
            )}
          </div>

          {/* Título e descrição */}
          <div className="mt-4 sm:mt-6 md:mt-8">
            <h1
              className="text-xl sm:text-2xl md:text-[28px] font-bold tracking-tight mb-4 sm:mb-6 normal-case"
              style={{
                color: '#2C3E50',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
              }}
            >
              {lesson.title.charAt(0).toUpperCase() +
                lesson.title.slice(1).toLowerCase()}
            </h1>
            <LessonDescription text={lesson.description} />
          </div>

          {/* Seção de Comentários */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mt-6 sm:mt-10">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Comments</h2>
            <CommentSection lessonId={lesson.id} comments={lesson.comments} />
          </div>
        </div>

        {/* Sidebar Direita */}
        <div className="lg:col-span-1 order-first lg:order-last">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-8 space-y-4 sm:space-y-6">
            {/* Avaliação */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                How would you rate this content?
              </h3>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleRating(value)}
                    className={`text-2xl transition-transform hover:scale-110 ${
                      rating && rating >= value ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    {value <= 2 ? '😢' : value === 3 ? '😐' : '😊'}
                  </button>
                ))}
              </div>
            </div>

            {/* Marcar como Concluída */}
            <div>
              <button
                onClick={handleMarkComplete}
                disabled={completed || isMarkingComplete}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  completed
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                {completed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Completed</span>
                  </>
                ) : (
                  <span>
                    {isMarkingComplete ? 'Marking...' : 'Mark as completed'}
                  </span>
                )}
              </button>
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Navegação entre Aulas */}
            <div className="flex gap-2 pt-2">
              {previousLesson ? (
                <Link
                  href={`/dashboard/courses/${courseId}/lessons/${previousLesson.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 sm:px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Previous</span>
                </Link>
              ) : (
                <span className="flex-1" />
              )}
              {nextLesson ? (
                <Link
                  href={`/dashboard/courses/${courseId}/lessons/${nextLesson.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 sm:px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                </Link>
              ) : (
                <span className="flex-1" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
