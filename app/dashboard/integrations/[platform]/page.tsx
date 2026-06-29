import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/require-admin'
import { getPlatformBySlug } from '@/lib/integration-platforms'
import IntegrationConfigForm from '@/components/IntegrationConfigForm'
import type { IntegrationRecord } from '@/types/integration'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: { platform: string }
  searchParams: { id?: string }
}

export default async function IntegrationPlatformPage({ params, searchParams }: PageProps) {
  await requireAdminPage()

  const platform = getPlatformBySlug(params.platform)
  if (!platform) notFound()

  const [courses, existingRow] = await Promise.all([
    prisma.course.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    }),
    searchParams.id
      ? prisma.integration.findUnique({ where: { id: searchParams.id } })
      : prisma.integration.findFirst({
          where: { platform: params.platform },
          orderBy: { createdAt: 'desc' },
        }),
  ])

  let existing: IntegrationRecord | null = null
  if (existingRow) {
    existing = {
      ...existingRow,
      createdAt: existingRow.createdAt.toISOString(),
      updatedAt: existingRow.updatedAt.toISOString(),
    }
  }

  return (
    <IntegrationConfigForm platform={platform} courses={courses} existing={existing} />
  )
}
