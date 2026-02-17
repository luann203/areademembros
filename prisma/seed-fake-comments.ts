import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const FAKE_USERS = [
  { name: 'Sarah Mitchell', email: 'sarah.mitchell.fake@mail.com' },
  { name: 'James Wilson', email: 'james.wilson.fake@mail.com' },
  { name: 'Emily Davis', email: 'emily.davis.fake@mail.com' },
  { name: 'Michael Brown', email: 'michael.brown.fake@mail.com' },
  { name: 'Jessica Taylor', email: 'jessica.taylor.fake@mail.com' },
  { name: 'David Anderson', email: 'david.anderson.fake@mail.com' },
  { name: 'Ashley Thomas', email: 'ashley.thomas.fake@mail.com' },
  { name: 'Christopher Lee', email: 'christopher.lee.fake@mail.com' },
  { name: 'Amanda Clark', email: 'amanda.clark.fake@mail.com' },
  { name: 'Matthew Lewis', email: 'matthew.lewis.fake@mail.com' },
  { name: 'Jennifer Walker', email: 'jennifer.walker.fake@mail.com' },
  { name: 'Daniel Hall', email: 'daniel.hall.fake@mail.com' },
  { name: 'Stephanie Young', email: 'stephanie.young.fake@mail.com' },
  { name: 'Andrew King', email: 'andrew.king.fake@mail.com' },
  { name: 'Nicole Wright', email: 'nicole.wright.fake@mail.com' },
]

const COMMENTS_BY_LESSON: Record<string, string[]> = {
  'Start here': [
    'Great introduction! I had no idea about YSense before.\nNow I\'m excited to get started.',
    'Super clear explanation. Already signed up and it was super easy!',
    'Love how you explain everything step by step. Perfect for beginners.',
    'Finally found a legit way to earn online. Thank you for this!',
    'Registered in 5 minutes. The platform looks really professional and trustworthy.',
    'Amazing intro! Can\'t wait to start earning. Do you recommend dedicating time daily?',
    'I\'ve been looking for something like this for months.\nThe registration process is so simple.',
    'Already shared with my sister. We\'re both starting together!',
    'Perfect first lesson. Everything makes sense now.',
    'YSense looks promising. Excited to explore more in the next lessons.',
    'Quick question: is there a minimum to withdraw? Anyway, loved the video!',
    'So glad I found this course. The platform seems very trustworthy.',
    'Just finished registering. Everything was exactly as you showed. Thanks!',
    'Clear and objective. Exactly what I needed to get started.',
    'Fantastic! I\'m already thinking about how much I can earn. Great content!',
  ],
  'Meeting the tool': [
    'The dashboard is so organized! Found everything easily.',
    'YSense has more features than I imagined. Great overview of the platform!',
    'Loved seeing the platform in action.\nIt\'s very intuitive and easy to use.',
    'Already exploring and it\'s really easy to navigate. Thanks!',
    'The interface is clean and professional. Good first impression.',
    'Can you do more videos showing the different sections? Really helpful!',
    'I signed up yesterday and everything looks exactly like you showed. Perfect!',
    'The platform is way better than others I\'ve tried. Loving it so far.',
    'Great walkthrough. I feel confident to start now.',
    'Simple and direct. Exactly how I like to learn. Thumbs up!',
    'Already completed my first task. The tool is really easy to use!',
    'Impressed with the layout. Everything is well organized. Great lesson!',
  ],
  'Exploring the platform': [
    'This lesson opened my eyes! So many ways to earn. Thank you!',
    'I didn\'t know about the different activity types. Very informative!',
    'The tips for maximizing earnings are gold. Already applying them.',
    'Spent 30 min exploring and found so many opportunities. Loving it!',
    'Your explanation of each section was perfect. No doubts left.',
    'The platform has more options than I expected.\nGreat discovery!',
    'Applied your strategy and already see a difference. Thanks a lot!',
    'Clear and detailed. I now understand how to navigate everything.',
    'Best lesson so far! The earning potential is real.',
    'I was confused before, now everything makes sense. Awesome!',
    'Already earning more by following your tips. This works!',
    'The daily goals feature is my favorite. Keeps me motivated.',
    'Explored every section as you suggested. Found great surveys!',
    'Your breakdown of the platform is excellent. Very helpful.',
    'Spent the whole afternoon on YSense. The possibilities are huge!',
    'Simple tips that make a big difference. Thank you!',
    'I\'m organizing my routine based on this. Great content!',
    'The platform keeps surprising me. Loving this course!',
    'Everything you said matches what I see. Very reliable info.',
    'My earnings increased after this lesson. Recommend 100%!',
    'Perfect for understanding the full picture. Well explained!',
    'Now I know exactly where to focus. Game changer!',
    'Your exploration tips saved me hours. Worth every minute!',
    'The structure you showed helped me a lot. Thanks!',
    'Best overview I\'ve seen. Clear and actionable. Amazing!',
  ],
  'Important tips': [
    'These tips are worth gold! Already seeing results.',
    'The consistency tip changed everything for me. Thank you!',
    'Small details that make a huge difference.\nGreat lesson!',
    'I was making mistakes before. Your tips fixed that. Thanks!',
    'Applied everything and my profile improved. It works!',
    'Quick but super valuable. Every tip is useful.',
    'Your advice about the best times to do surveys really helped!',
    'Simple tips, big impact. Love it!',
  ],
  'Making the answers': [
    'Finally understood how to qualify for more surveys. Game changer!',
    'My approval rate increased a lot after this. Thank you!',
    'The honesty tip is key. I was getting disqualified before.',
    'Your examples made everything clear. Now I complete more surveys.',
    'Best lesson for earning more. The tips really work!',
    'I was answering wrong before. This fixed everything.',
    'The consistency in answers tip is genius. Thanks!',
    'My first withdrawal is coming thanks to this lesson.\nSo grateful!',
    'Clear strategies that anyone can follow. Excellent!',
    'Applied your method and qualified for way more surveys.',
    'The quality of answers really matters. Good to know!',
    'Started being more careful and it paid off. Great advice!',
    'Your step-by-step for surveys is perfect. No more confusion.',
    'I\'m earning 3x more after applying these tips. Incredible!',
    'Finally making real progress. This lesson was the key.',
    'Honest and practical advice. Exactly what I needed.',
    'The examples you gave helped me a lot. Thank you!',
    'Simple changes, big results. Loving this course!',
    'My survey completion rate improved so much. Thanks!',
    'Best practical lesson. Everything makes sense now. Recommend!',
  ],
  'Withdrawing your balance': [
    'Withdrew my first $20! Everything worked perfectly. Thank you!',
    'The withdrawal process is super simple. Did it in 5 minutes.',
    'Finally received my first payment. This course delivered!',
    'Your explanation of the options made it easy to choose. Thanks!',
    'Got my PayPal payment in 2 days. Everything as promised!',
    'Was nervous about withdrawing, but you explained everything.\nSuccess!',
    'Second withdrawal done. The process is really smooth.',
    'Received my first earnings today. So happy! Thanks for the guidance!',
    'The step-by-step was perfect. No issues at all.',
    'Withdrawal options are great. Chose PayPal and it worked!',
    'Finally cashing out after weeks of work. Worth it!',
    'Your tips about minimum amounts saved me. Thank you!',
    'First $50 in my account. This course changed everything!',
    'Withdrawal was faster than I expected. Very satisfied!',
    'Clear instructions, no confusion. Got my money!',
    'The security tips gave me peace of mind. Great lesson!',
    'Received payment. Everything you said was accurate. Thanks!',
    'Best feeling seeing the money arrive. Great final lesson!',
  ],
}

const COUNTS: Record<string, number> = {
  'Start here': 15,
  'Meeting the tool': 12,
  'Exploring the platform': 25,
  'Important tips': 8,
  'Making the answers': 20,
  'Withdrawing your balance': 18,
}

async function main() {
  const password = await bcrypt.hash('fake123', 10)
  const users: { id: string }[] = []

  for (const u of FAKE_USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, password, name: u.name, role: 'student' },
    })
    users.push({ id: user.id })
  }

  console.log(`${users.length} usuários fake criados/verificados`)

  const course = await prisma.course.findFirst({
    where: { title: 'Youtube Rewards' },
    include: {
      modules: {
        include: {
          lessons: { orderBy: { order: 'asc' } },
        },
      },
    },
  })

  if (!course) {
    throw new Error('Curso Youtube Rewards não encontrado')
  }

  const lessons = course.modules.flatMap((m) => m.lessons)
  const lessonIds = lessons.map((l) => l.id)
  await prisma.comment.deleteMany({ where: { lessonId: { in: lessonIds } } })
  console.log('Comentários anteriores removidos')

  let totalComments = 0

  for (const lesson of lessons) {
    const comments = COMMENTS_BY_LESSON[lesson.title] ?? []
    const count = COUNTS[lesson.title] ?? 0
    const toInsert = comments.slice(0, count)

    const baseDate = new Date()
    for (let i = 0; i < toInsert.length; i++) {
      const user = users[i % users.length]
      const daysAgo = 3 + i * 4 + Math.floor(Math.random() * 3)
      const createdAt = new Date(baseDate)
      createdAt.setDate(createdAt.getDate() - daysAgo)
      createdAt.setHours(
        createdAt.getHours() - Math.floor(Math.random() * 8),
        Math.floor(Math.random() * 60)
      )
      await prisma.comment.create({
        data: {
          content: toInsert[i],
          userId: user.id,
          lessonId: lesson.id,
          createdAt,
          updatedAt: createdAt,
        },
      })
    }
    totalComments += toInsert.length
    console.log(`"${lesson.title}": ${toInsert.length} comentários`)
  }

  console.log(`Total: ${totalComments} comentários inseridos`)
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
