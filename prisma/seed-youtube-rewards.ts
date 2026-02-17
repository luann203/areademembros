import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const LESSON_DURATIONS: Record<string, number> = {
  'Start here': 5,
  'Meeting the tool': 8,
  'Exploring the platform': 10,
  'Important tips': 7,
  'Making the answers': 9,
  'Withdrawing your balance': 6,
}

const YOUTUBE_REWARDS_LESSONS = [
  {
    title: 'Start here',
    videoUrl:
      'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=af2420bc-b8e3-47a8-b7d0-2b88e02ed034',
    description: `Hello, welcome back my friend! 😁
First, let's learn about an amazing platform called YSense, the platform we call "the magic tool."
YSense is a platform that allows users to earn dollars by answering surveys and polls, as well as other small tasks and reviews of products and services.
In this module, we'll explore this tool and understand how to maximize your earnings with it. We'll also understand how much you can earn with it and how much time you need to dedicate each day to make the most of this opportunity.
Let's start by learning how to register, complete activities, and also learn how to withdraw your earnings safely and privately.`,
    order: 1,
  },
  {
    title: 'Meeting the tool',
    videoUrl:
      'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=c9c522bc-c0d8-489a-b97a-1eacdf6ad5e2',
    description: `Hello, welcome back, my friend! 😁
In this class, we'll learn about the platform and explore the features of this incredible tool that allows us to earn dollars without leaving home.
Here's the link to access the YSense platform:
* https://www.ysense.com`,
    order: 2,
  },
  {
    title: 'Exploring the platform',
    videoUrl:
      'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=e2de14ac-4bf1-4d39-96c4-4d44c21b2a55',
    description: `Hello, welcome back my friend! 😁
First, let's learn about an amazing platform called YSense, the platform we call "the magic tool."
YSense is a platform that allows users to earn dollars by answering surveys and polls, as well as other small tasks and reviews of products and services.
In this module, we'll explore this tool and understand how to maximize your earnings with it. We'll also understand how much you can earn with it and how much time you need to dedicate each day to make the most of this opportunity.
Let's start by learning how to register, complete activities, and also learn how to withdraw your earnings safely and privately.`,
    order: 3,
  },
  {
    title: 'Important tips',
    videoUrl:
      'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=62253e67-d9a5-4a3c-820e-91e8374e7eea',
    description: `Hello, welcome back my friend! 😁
First, let's learn about an amazing platform called YSense, the platform we call "the magic tool."
YSense is a platform that allows users to earn dollars by answering surveys and polls, as well as other small tasks and reviews of products and services.
In this module, we'll explore this tool and understand how to maximize your earnings with it. We'll also understand how much you can earn with it and how much time you need to dedicate each day to make the most of this opportunity.
Let's start by learning how to register, complete activities, and also learn how to withdraw your earnings safely and privately.`,
    order: 4,
  },
  {
    title: 'Making the answers',
    videoUrl:
      'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=7b574450-75af-4016-a2f2-f70f7db27846',
    description: `Hello, welcome back my friend! 😁
First, let's learn about an amazing platform called YSense, the platform we call "the magic tool."
YSense is a platform that allows users to earn dollars by answering surveys and polls, as well as other small tasks and reviews of products and services.
In this module, we'll explore this tool and understand how to maximize your earnings with it. We'll also understand how much you can earn with it and how much time you need to dedicate each day to make the most of this opportunity.
Let's start by learning how to register, complete activities, and also learn how to withdraw your earnings safely and privately.`,
    order: 5,
  },
  {
    title: 'Withdrawing your balance',
    videoUrl:
      'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=4d1b0217-d1e6-48b0-8a99-b8cdef8094bc',
    description: `Hello, welcome back my friend! 😁
First, let's learn about an amazing platform called YSense, the platform we call "the magic tool."
YSense is a platform that allows users to earn dollars by answering surveys and polls, as well as other small tasks and reviews of products and services.
In this module, we'll explore this tool and understand how to maximize your earnings with it. We'll also understand how much you can earn with it and how much time you need to dedicate each day to make the most of this opportunity.
Let's start by learning how to register, complete activities, and also learn how to withdraw your earnings safely and privately.`,
    order: 6,
  },
]

async function main() {
  const courseIds = (await prisma.course.findMany({ select: { id: true } })).map(
    (c) => c.id
  )
  if (courseIds.length === 0) {
    console.log('Nenhum curso encontrado para remover.')
  } else {
    const moduleIds = (
      await prisma.module.findMany({
        where: { courseId: { in: courseIds } },
        select: { id: true },
      })
    ).map((m) => m.id)
    const lessonIds = (
      await prisma.lesson.findMany({
        where: { moduleId: { in: moduleIds } },
        select: { id: true },
      })
    ).map((l) => l.id)

    const deletedComments = await prisma.comment.deleteMany({
      where: { lessonId: { in: lessonIds } },
    })
    console.log('Comentários removidos:', deletedComments.count)

    const deletedProgress = await prisma.lessonProgress.deleteMany({
      where: { lessonId: { in: lessonIds } },
    })
    console.log('Progresso removido:', deletedProgress.count)

    const deletedEnrollments = await prisma.enrollment.deleteMany({
      where: { courseId: { in: courseIds } },
    })
    console.log('Inscrições removidas:', deletedEnrollments.count)

    await prisma.lesson.deleteMany({
      where: { moduleId: { in: moduleIds } },
    })
    await prisma.module.deleteMany({
      where: { courseId: { in: courseIds } },
    })
    const deletedCourses = await prisma.course.deleteMany({})
    console.log('Cursos removidos:', deletedCourses.count)
  }

  // 5. Criar curso Youtube Rewards com um único módulo e as 6 aulas
  const course = await prisma.course.create({
    data: {
      title: 'Youtube Rewards',
      imageUrl: '/capa.jpg',
      description:
        'Aprenda a ganhar dólares com a plataforma YSense: pesquisas, tarefas e resgates. Do cadastro ao saque, com dicas para maximizar seus ganhos.',
      duration: Object.values(LESSON_DURATIONS).reduce((a, b) => a + b, 0),
      modules: {
        create: [
          {
            title: 'Youtube Rewards',
            description: 'Módulo principal do curso Youtube Rewards',
            order: 1,
            lessons: {
              create: YOUTUBE_REWARDS_LESSONS.map((lesson) => ({
                title: lesson.title,
                description: lesson.description,
                order: lesson.order,
                duration: LESSON_DURATIONS[lesson.title] ?? null,
                ...(lesson.videoUrl && { videoUrl: lesson.videoUrl }),
              })),
            },
          },
        ],
      },
    },
  })

  console.log('Curso criado:', course.title, '(id:', course.id, ')')

  // 6. Inscrever todos os alunos existentes no novo curso
  const users = await prisma.user.findMany({ where: { role: 'student' } })
  for (const user of users) {
    await prisma.enrollment.create({
      data: { userId: user.id, courseId: course.id },
    })
  }
  console.log('Alunos inscritos no novo curso:', users.length)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
