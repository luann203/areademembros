import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { progress, completed } = await request.json()

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return NextResponse.json(
        { error: 'Progress must be a number between 0 and 100' },
        { status: 400 }
      )
    }

    // Verificar se a aula existe
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId },
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Criar ou atualizar progresso
    const lessonProgress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: params.lessonId,
        },
      },
      update: {
        progress: Math.min(100, Math.max(0, progress)),
        completed: completed === true,
      },
      create: {
        userId: session.user.id,
        lessonId: params.lessonId,
        progress: Math.min(100, Math.max(0, progress)),
        completed: completed === true,
      },
    })

    return NextResponse.json(lessonProgress)
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error)
      return NextResponse.json(
      { error: 'Error updating progress' },
      { status: 500 }
    )
  }
}
