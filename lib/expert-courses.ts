import { prisma } from '@/lib/prisma'

const VIDEO =
  'https://player-vz-2a60254c-033.tv.pandavideo.com.br/embed/?v=af2420bc-b8e3-47a8-b7d0-2b88e02ed034'

type ExpertCourseDef = {
  title: string
  imageUrl: string
  description: string
  duration: number
  moduleTitle: string
  lessons: { title: string; description: string; duration: number }[]
}

export const EXPERT_COURSES: ExpertCourseDef[] = [
  {
    title: 'Chin Filler',
    imageUrl: '/img1.png',
    description:
      'Técnicas avançadas de preenchimento e definição do queixo. Anatomia, produtos, protocolos e segurança.',
    duration: 45,
    moduleTitle: 'Fundamentals',
    lessons: [
      { title: 'Introduction to Chin Filler', description: 'Indicações, contraindicações e expectativas.', duration: 12 },
      { title: 'Anatomy & Injection Points', description: 'Anatomia mentoniana e pontos seguros de aplicação.', duration: 18 },
      { title: 'Protocols & Aftercare', description: 'Volume recomendado e cuidados pós-procedimento.', duration: 15 },
    ],
  },
  {
    title: 'Botulinum Toxin',
    imageUrl: '/img2.png',
    description:
      'Programa completo em toxina botulínica: anatomia facial, dosagem, protocolos e complicações.',
    duration: 52,
    moduleTitle: 'Theory & Practice',
    lessons: [
      { title: 'Botox Theory', description: 'Anatomia facial, tipos de toxina e planejamento.', duration: 20 },
      { title: 'Upper Face Protocols', description: 'Testa, glabela e região periorbital.', duration: 18 },
      { title: 'Complications & Safety', description: 'Prevenção e manejo de complicações.', duration: 14 },
    ],
  },
  {
    title: 'Lip Filler',
    imageUrl: '/capa.jpg',
    description:
      'Harmonização labial com ácido hialurônico: proporções, técnica, produtos e naturalidade.',
    duration: 48,
    moduleTitle: 'Lip Enhancement',
    lessons: [
      { title: 'Lip Anatomy', description: 'Proporções faciais e avaliação labial.', duration: 14 },
      { title: 'Injection Techniques', description: 'Técnicas de preenchimento e definição do contorno.', duration: 20 },
      { title: 'Correction & Dissolution', description: 'Correções, complicações e hialuronidase.', duration: 14 },
    ],
  },
  {
    title: 'Jawline Sculpting',
    imageUrl: '/login.jpg',
    description:
      'Contorno mandibular com preenchedores: definição, ângulo da mandíbula e perfil lateral.',
    duration: 40,
    moduleTitle: 'Jawline',
    lessons: [
      { title: 'Facial Profile Analysis', description: 'Avaliação de perfil e indicações de tratamento.', duration: 12 },
      { title: 'Mandibular Angle', description: 'Técnica de aplicação no ângulo da mandíbula.', duration: 16 },
      { title: 'Combined Protocols', description: 'Combinação com queixo e região submandibular.', duration: 12 },
    ],
  },
  {
    title: 'Skin Boosters',
    imageUrl: '/rodape.jpg',
    description:
      'Bioestimuladores e skinboosters para qualidade da pele: hidratação profunda e rejuvenescimento.',
    duration: 38,
    moduleTitle: 'Skin Quality',
    lessons: [
      { title: 'Product Overview', description: 'Tipos de skinboosters e mecanismos de ação.', duration: 10 },
      { title: 'Application Protocols', description: 'Técnicas de aplicação e planejamento por área.', duration: 16 },
      { title: 'Results & Maintenance', description: 'Expectativas, sessões e manutenção.', duration: 12 },
    ],
  },
  {
    title: 'PDO Threads',
    imageUrl: '/img1.png',
    description:
      'Fios de PDO para lifting não cirúrgico: tipos de fios, vetores, indicações e segurança.',
    duration: 55,
    moduleTitle: 'Thread Lifting',
    lessons: [
      { title: 'Thread Types', description: 'Monofilamento, espiculados e bidirecionais.', duration: 18 },
      { title: 'Vector Planning', description: 'Planejamento de vetores e marcação facial.', duration: 20 },
      { title: 'Post-Procedure Care', description: 'Cuidados pós-procedimento e complicações.', duration: 17 },
    ],
  },
  {
    title: 'Chemical Peels',
    imageUrl: '/img2.png',
    description:
      'Peelings químicos por profundidade: indicações, protocolos, peeling médio e superficial.',
    duration: 42,
    moduleTitle: 'Peels',
    lessons: [
      { title: 'Peel Classification', description: 'Superficial, médio e profundo — quando indicar.', duration: 14 },
      { title: 'Application Technique', description: 'Preparação da pele e aplicação segura.', duration: 16 },
      { title: 'Recovery & Results', description: 'Pós-peeling, fotoproteção e resultados esperados.', duration: 12 },
    ],
  },
]

export const EXPERT_COURSE_TITLES = EXPERT_COURSES.map((c) => c.title)

async function enrollAllStudents(courseId: string) {
  const students = await prisma.user.findMany({
    where: { role: 'student' },
    select: { id: true },
  })
  for (const student of students) {
    if (!student.id) continue
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: student.id, courseId } },
      create: { userId: student.id, courseId },
      update: {},
    })
  }
}

function buildCourseData(def: ExpertCourseDef) {
  return {
    title: def.title,
    imageUrl: def.imageUrl,
    description: def.description,
    duration: def.duration,
    modules: {
      create: [
        {
          title: def.moduleTitle,
          description: def.description,
          order: 1,
          lessons: {
            create: def.lessons.map((lesson, index) => ({
              title: lesson.title,
              description: lesson.description,
              order: index + 1,
              duration: lesson.duration,
              videoUrl: VIDEO,
            })),
          },
        },
      ],
    },
  }
}

export async function bootstrapExpertCoursesIfMissing(): Promise<void> {
  try {
    for (const def of EXPERT_COURSES) {
      const existing = await prisma.course.findFirst({
        where: { title: def.title },
        select: { id: true, imageUrl: true },
      })

      if (existing) {
        if (existing.imageUrl !== def.imageUrl) {
          await prisma.course.update({
            where: { id: existing.id },
            data: { imageUrl: def.imageUrl },
          })
        }
        continue
      }

      const course = await prisma.course.create({ data: buildCourseData(def) })
      if (course.id) await enrollAllStudents(course.id)
    }
  } catch {
    // ignore
  }
}
