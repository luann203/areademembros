import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.lesson.updateMany({
    where: {
      module: { course: { title: 'Youtube Rewards' } },
    },
    data: { duration: null },
  })
  console.log(`${result.count} aulas com duração removida`)
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
