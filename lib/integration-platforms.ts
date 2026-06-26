import type { IntegrationPlatform } from '@/types/integration'

export const INTEGRATION_PLATFORMS: IntegrationPlatform[] = [
  {
    slug: 'hotmart',
    name: 'Hotmart',
    category: 'payment',
    categoryLabel: 'Payment Method',
    brandColor: '#F04E23',
    textColor: '#FFFFFF',
  },
]

export function getPlatformBySlug(slug: string): IntegrationPlatform | undefined {
  return INTEGRATION_PLATFORMS.find((p) => p.slug === slug)
}

export function getPlatformName(slug: string): string {
  return getPlatformBySlug(slug)?.name ?? slug
}
