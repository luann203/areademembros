/**
 * Se o banco não tiver nenhum curso, cria o curso Youtube Rewards
 * (6 aulas, vídeos Panda + descrições) e o usuário aluno@example.com inscrito.
 */
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const LESSON_DURATIONS: Record<string, number> = {
  'Start here': 5,
  'Meeting the tool': 8,
  'Exploring the platform': 10,
  'Important tips': 7,
  'Making the answers': 9,
  'Withdrawing your balance': 6,
}

const LESSONS = [
  { title: 'Start here', videoUrl: 'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=af2420bc-b8e3-47a8-b7d0-2b88e02ed034', description: `Hello, welcome back my friend! 😁\nFirst, let's learn about an amazing platform called YSense, the platform we call "the magic tool."\nYSense is a platform that allows users to earn dollars by answering surveys and polls, as well as other small tasks and reviews of products and services.\nIn this module, we'll explore this tool and understand how to maximize your earnings with it. We'll also understand how much you can earn with it and how much time you need to dedicate each day to make the most of this opportunity.\nLet's start by learning how to register, complete activities, and also learn how to withdraw your earnings safely and privately.`, order: 1 },
  { title: 'Meeting the tool', videoUrl: 'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=c9c522bc-c0d8-489a-b97a-1eacdf6ad5e2', description: `Hello, welcome back, my friend! 😁\nIn this class, we'll learn about the platform and explore the features of this incredible tool that allows us to earn dollars without leaving home.\nHere's the link to access the YSense platform:\n* https://www.ysense.com`, order: 2 },
  { title: 'Exploring the platform', videoUrl: 'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=e2de14ac-4bf1-4d39-96c4-4d44c21b2a55', description: `Hello, welcome back my friend! 😁\nFirst, let's learn about an amazing platform called YSense, the platform we call "the magic tool."\nYSense is a platform that allows users to earn dollars by answering surveys and polls, as well as other small tasks and reviews of products and services.\nIn this module, we'll explore this tool and understand how to maximize your earnings with it. We'll also understand how much you can earn with it and how much time you need to dedicate each day to make the most of this opportunity.\nLet's start by learning how to register, complete activities, and also learn how to withdraw your earnings safely and privately.`, order: 3 },
  { title: 'Important tips', videoUrl: 'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=62253e67-d9a5-4a3c-820e-91e8374e7eea', description: `Hello, welcome back my friend! 😁\nFirst, let's learn about an amazing platform called YSense, the platform we call "the magic tool."\nYSense is a platform that allows users to earn dollars by answering surveys and polls, as well as other small tasks and reviews of products and services.\nIn this module, we'll explore this tool and understand how to maximize your earnings with it. We'll also understand how much you can earn with it and how much time you need to dedicate each day to make the most of this opportunity.\nLet's start by learning how to register, complete activities, and also learn how to withdraw your earnings safely and privately.`, order: 4 },
  { title: 'Making the answers', videoUrl: 'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=7b574450-75af-4016-a2f2-f70f7db27846', description: `Hello, welcome back my friend! 😁\nFirst, let's learn about an amazing platform called YSense, the platform we call "the magic tool."\nYSense is a platform that allows users to earn dollars by answering surveys and polls, as well as other small tasks and reviews of products and services.\nIn this module, we'll explore this tool and understand how to maximize your earnings with it. We'll also understand how much you can earn with it and how much time you need to dedicate each day to make the most of this opportunity.\nLet's start by learning how to register, complete activities, and also learn how to withdraw your earnings safely and privately.`, order: 5 },
  { title: 'Withdrawing your balance', videoUrl: 'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=4d1b0217-d1e6-48b0-8a99-b8cdef8094bc', description: `Hello, welcome back my friend! 😁\nFirst, let's learn about an amazing platform called YSense, the platform we call "the magic tool."\nYSense is a platform that allows users to earn dollars by answering surveys and polls, as well as other small tasks and reviews of products and services.\nIn this module, we'll explore this tool and understand how to maximize your earnings with it. We'll also understand how much you can earn with it and how much time you need to dedicate each day to make the most of this opportunity.\nLet's start by learning how to register, complete activities, and also learn how to withdraw your earnings safely and privately.`, order: 6 },
]

export async function bootstrapCourseIfEmpty(): Promise<void> {
  try {
    const any = await prisma.course.findMany({ take: 1, select: { id: true } })
    if (any.length > 0) return

    const duration = Object.values(LESSON_DURATIONS).reduce((a, b) => a + b, 0)
    const course = await prisma.course.create({
      data: {
        title: 'Youtube Rewards',
        imageUrl: '/capa.jpg',
        description: 'Aprenda a ganhar dólares com a plataforma YSense: pesquisas, tarefas e resgates. Do cadastro ao saque, com dicas para maximizar seus ganhos.',
        duration,
        modules: {
          create: [{
            title: 'Youtube Rewards',
            description: 'Módulo principal do curso Youtube Rewards',
            order: 1,
            lessons: {
              create: LESSONS.map((l) => ({
                title: l.title,
                description: l.description,
                order: l.order,
                duration: LESSON_DURATIONS[l.title] ?? null,
                videoUrl: l.videoUrl,
              })),
            },
          }],
        },
      },
    })

    const courseId = (course as { id?: string }).id
    if (!courseId) return

    let user = await prisma.user.findUnique({ where: { email: 'aluno@example.com' }, select: { id: true } })
    if (!user) {
      const hashed = await bcrypt.hash('1234567', 10)
      const created = await prisma.user.create({
        data: { email: 'aluno@example.com', password: hashed, name: 'Aluno', role: 'student' },
        select: { id: true },
      })
      user = (created as { id?: string }).id ? created : null
    }
    if (user) {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: (user as { id: string }).id, courseId } },
        create: { userId: (user as { id: string }).id, courseId },
        update: {},
      })
    }

    const allUsers = await prisma.user.findMany({ where: { role: 'student' }, select: { id: true } })
    for (const u of allUsers) {
      const uid = (u as { id: string }).id
      if (!uid) continue
      try {
        await prisma.enrollment.upsert({
          where: { userId_courseId: { userId: uid, courseId } },
          create: { userId: uid, courseId },
          update: {},
        })
      } catch {
        // já inscrito
      }
    }
  } catch {
    // ignore (ex.: mock Prisma no Vercel)
  }
}

/**
 * Garante que o usuário está inscrito no curso Youtube Rewards (se existir).
 * Assim o curso aparece em Contents e as aulas em Classes para qualquer login.
 */
export async function ensureUserEnrolledInYoutubeCourse(userId: string): Promise<void> {
  try {
    const course = await prisma.course.findFirst({
      where: { title: 'Youtube Rewards' },
      select: { id: true },
    })
    if (!course?.id) return

    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId: course.id } },
      create: { userId, courseId: course.id },
      update: {},
    })
  } catch {
    // ignore (ex.: mock Prisma no Vercel)
  }
}
