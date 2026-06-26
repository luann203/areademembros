import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Duração de cada aula em minutos. Ajuste os valores conforme a duração real dos vídeos.
const LESSON_DURATIONS: Record<string, number> = {
  'Start here': 5,
  'Meeting the tool': 8,
  'Exploring the platform': 10,
  'Important tips': 7,
  'Making the answers': 9,
  'Withdrawing your balance': 6,
}

async function main() {
  for (const [title, duration] of Object.entries(LESSON_DURATIONS)) {
    const result = await prisma.lesson.updateMany({
      where: { title },
      data: { duration },
    })
    console.log(`"${title}": ${duration} min → ${result.count} updated`)
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
