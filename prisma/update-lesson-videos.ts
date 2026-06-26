import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const LESSON_VIDEOS: Record<string, string> = {
  'Start here':
    'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=af2420bc-b8e3-47a8-b7d0-2b88e02ed034',
  'Meeting the tool':
    'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=c9c522bc-c0d8-489a-b97a-1eacdf6ad5e2',
  'Exploring the platform':
    'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=e2de14ac-4bf1-4d39-96c4-4d44c21b2a55',
  'Important tips':
    'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=62253e67-d9a5-4a3c-820e-91e8374e7eea',
  'Making the answers':
    'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=7b574450-75af-4016-a2f2-f70f7db27846',
  'Withdrawing your balance':
    'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=4d1b0217-d1e6-48b0-8a99-b8cdef8094bc',
}

async function main() {
  for (const [title, videoUrl] of Object.entries(LESSON_VIDEOS)) {
    const result = await prisma.lesson.updateMany({
      where: { title },
      data: { videoUrl },
    })
    console.log(`"${title}": ${result.count} updated`)
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
