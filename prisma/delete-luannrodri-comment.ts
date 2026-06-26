import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Buscar usuários que contenham 'luannrodri' no email ou nome (case-insensitive)
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: 'luannrodri' } },
        { name: { contains: 'luannrodri' } },
      ],
    },
  })

  if (users.length === 0) {
    console.log('Nenhum usuário encontrado com "luannrodri"')
    return
  }

  const userIds = users.map((u) => u.id)
  const result = await prisma.comment.deleteMany({
    where: {
      userId: { in: userIds },
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
