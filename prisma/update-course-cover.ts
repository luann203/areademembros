import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.course.updateMany({
    where: { title: 'Youtube Rewards' },
    data: { imageUrl: '/capa.jpg' },
  })
  console.log('Curso(s) atualizado(s) com capa:', result.count)
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
