import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CORRECT_DESCRIPTION =
  'Aprenda a ganhar dólares com a plataforma YSense: pesquisas, tarefas e resgates. Do cadastro ao saque, com dicas para maximizar seus ganhos.'

async function main() {
  const updated = await prisma.course.updateMany({
    where: { title: 'Youtube Rewards' },
    data: { description: CORRECT_DESCRIPTION },
  })
  console.log('Curso(s) Youtube Rewards atualizado(s):', updated.count)
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
