import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const START_HERE_DESCRIPTION = `Hello, welcome back my friend! 😁
First, let's learn about an amazing platform called YSense, the platform we call "the magic tool."
YSense is a platform that allows users to earn dollars by answering surveys and polls, as well as other small tasks and reviews of products and services.
In this module, we'll explore this tool and understand how to maximize your earnings with it. We'll also understand how much you can earn with it and how much time you need to dedicate each day to make the most of this opportunity.
Let's start by learning how to register, complete activities, and also learn how to withdraw your earnings safely and privately.`

const PANDA_VIDEO =
  'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=af2420bc-b8e3-47a8-b7d0-2b88e02ed034'

async function main() {
  const startHereUpdated = await prisma.lesson.updateMany({
    where: { title: 'Start here' },
    data: {
      description: START_HERE_DESCRIPTION,
      videoUrl: PANDA_VIDEO,
    },
  })
  console.log('Aula "Start here" atualizada:', startHereUpdated.count)

  const course = await prisma.course.findFirst({
    where: { title: 'Youtube Rewards' },
    select: { id: true },
  })
  if (course) {
    const moduleIds = (
      await prisma.module.findMany({
        where: { courseId: course.id },
        select: { id: true },
      })
    ).map((m) => m.id)
    const allLessons = await prisma.lesson.updateMany({
      where: { moduleId: { in: moduleIds } },
      data: { videoUrl: PANDA_VIDEO },
    })
    console.log('Todas as aulas do Youtube Rewards com vídeo:', allLessons.count)
  }
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
