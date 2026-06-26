import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'admin',
    },
  })

  // Criar usuário aluno de exemplo
  const studentPassword = await bcrypt.hash('aluno123', 10)
  const student = await prisma.user.upsert({
    where: { email: 'aluno@example.com' },
    update: {},
    create: {
      email: 'aluno@example.com',
      password: studentPassword,
      name: 'Aluno Exemplo',
      role: 'student',
    },
  })

  console.log('Usuários criados:', { admin, student })

  // Criar curso de exemplo
  const course = await prisma.course.create({
    data: {
      title: 'Botox Expert: Online Program',
      description:
        'Treinamento online completo em toxina botulínica. Aprenda anatomia facial, aplicação prática, protocolos de injeção, dosagem e manejo de complicações.',
      duration: 240, // 4 horas
      modules: {
        create: [
          {
            title: 'Theory',
            description: 'Fundamentos teóricos da toxina botulínica',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'BOTOX THEORY',
                  description:
                    'Aprenda anatomia facial, função muscular e fundamentos da toxina botulínica. Entenda indicações, contraindicações, tipos de produtos, cálculo de dosagem e como planejar tratamentos seguros e eficazes para redução de rugas.',
                  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // URL de exemplo
                  duration: 63,
                  order: 1,
                },
              ],
            },
          },
          {
            title: 'Practical Application',
            description: 'Aplicação prática das técnicas',
            order: 2,
            lessons: {
              create: [
                {
                  title: 'BOTOX PREPARATION',
                  description:
                    'Aprenda como preparar adequadamente o ambiente e os materiais necessários para a aplicação de toxina botulínica.',
                  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  duration: 25,
                  order: 1,
                },
                {
                  title: 'BOTOX MARKING',
                  description:
                    'Técnicas de marcação e identificação dos pontos de injeção para resultados precisos e seguros.',
                  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  duration: 20,
                  order: 2,
                },
                {
                  title: 'BOTOX APPLICATION',
                  description:
                    'Demonstração prática completa da aplicação de toxina botulínica com técnicas profissionais.',
                  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  duration: 35,
                  order: 3,
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log('Curso criado:', course)

  // Inscrever aluno no curso
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course.id,
    },
  })

  console.log('Aluno inscrito no curso')

  // Criar mais um curso de exemplo
  const course2 = await prisma.course.create({
    data: {
      title: 'Lip Filler Expert: Online Program',
      description:
        'Treinamento avançado online em preenchimento labial cobrindo anatomia, técnicas de injeção, tipos de produtos e manejo de complicações.',
      duration: 180,
      modules: {
        create: [
          {
            title: 'Fundamentals',
            description: 'Fundamentos do preenchimento labial',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'LIP ANATOMY',
                  description:
                    'Anatomia detalhada dos lábios e estruturas relacionadas para aplicação segura.',
                  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  duration: 45,
                  order: 1,
                },
                {
                  title: 'PRODUCT SELECTION',
                  description:
                    'Como escolher o produto adequado para cada tipo de tratamento.',
                  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  duration: 30,
                  order: 2,
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log('Segundo curso criado:', course2)

  // Inscrever aluno no segundo curso também
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course2.id,
    },
  })

  console.log('Aluno inscrito no segundo curso')
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
