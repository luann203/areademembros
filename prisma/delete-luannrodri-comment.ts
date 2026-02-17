import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.comment.deleteMany({
    where: {
      OR: [
        { user: { email: { contains: 'luannrodri', mode: 'insensitive' } } },
        { user: { name: { contains: 'luannrodri', mode: 'insensitive' } } },
      ],
    },
  })
  console.log(`${result.count} comentário(s) do luannrodri removido(s)`)
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
