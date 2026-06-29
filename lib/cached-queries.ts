import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

async function loadCategoryMeta() {
  return prisma.category.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, name: true, slug: true, order: true },
  })
}

export const getCachedCategoryMeta = unstable_cache(loadCategoryMeta, ['category-meta'], {
  revalidate: 300,
  tags: ['categories'],
})
