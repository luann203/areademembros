import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const LESSON_DESCRIPTIONS: Record<string, string> = {
  'Start here': `Hello, welcome back my friend! 😁
First, let's learn about an amazing platform called YSense, the platform we call "the magic tool."
YSense is a platform that allows users to earn dollars by answering surveys and polls, as well as other small tasks and reviews of products and services.
In this module, we'll explore this tool and understand how to maximize your earnings with it. We'll also understand how much you can earn with it and how much time you need to dedicate each day to make the most of this opportunity.
Let's start by learning how to register, complete activities, and also learn how to withdraw your earnings safely and privately.`,
  'Meeting the tool': `Hello, welcome back, my friend! 😁
In this class, we'll learn about the platform and explore the features of this incredible tool that allows us to earn dollars without leaving home.
Here's the link to access the YSense platform:
* https://www.ysense.com`,
  'Exploring the platform': `Hello, welcome back my friend! 😁
First, let's learn about an amazing platform called YSense, the platform we call "the magic tool."
YSense is a platform that allows users to earn dollars by answering surveys and polls, as well as other small tasks and reviews of products and services.
In this module, we'll explore this tool and understand how to maximize your earnings with it. We'll also understand how much you can earn with it and how much time you need to dedicate each day to make the most of this opportunity.
Let's start by learning how to register, complete activities, and also learn how to withdraw your earnings safely and privately.`,
  'Important tips': `Hello, welcome back my friend! 😁
First, let's learn about an amazing platform called YSense, the platform we call "the magic tool."
YSense is a platform that allows users to earn dollars by answering surveys and polls, as well as other small tasks and reviews of products and services.
In this module, we'll explore this tool and understand how to maximize your earnings with it. We'll also understand how much you can earn with it and how much time you need to dedicate each day to make the most of this opportunity.
Let's start by learning how to register, complete activities, and also learn how to withdraw your earnings safely and privately.`,
  'Making the answers': `Hello, welcome back my friend! 😁
First, let's learn about an amazing platform called YSense, the platform we call "the magic tool."
YSense is a platform that allows users to earn dollars by answering surveys and polls, as well as other small tasks and reviews of products and services.
In this module, we'll explore this tool and understand how to maximize your earnings with it. We'll also understand how much you can earn with it and how much time you need to dedicate each day to make the most of this opportunity.
Let's start by learning how to register, complete activities, and also learn how to withdraw your earnings safely and privately.`,
  'Withdrawing your balance': `Hello, welcome back my friend! 😁
First, let's learn about an amazing platform called YSense, the platform we call "the magic tool."
YSense is a platform that allows users to earn dollars by answering surveys and polls, as well as other small tasks and reviews of products and services.
In this module, we'll explore this tool and understand how to maximize your earnings with it. We'll also understand how much you can earn with it and how much time you need to dedicate each day to make the most of this opportunity.
Let's start by learning how to register, complete activities, and also learn how to withdraw your earnings safely and privately.`,
}

async function main() {
  for (const [title, description] of Object.entries(LESSON_DESCRIPTIONS)) {
    const result = await prisma.lesson.updateMany({
      where: { title },
      data: { description },
    })
    console.log(`"${title}": ${result.count} atualizada(s)`)
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
