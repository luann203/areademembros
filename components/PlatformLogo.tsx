import type { IntegrationPlatform } from '@/types/integration'

type PlatformLogoProps = {
  platform: IntegrationPlatform
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-10 text-sm',
  md: 'h-16 text-lg',
  lg: 'h-24 text-2xl',
}

export default function PlatformLogo({ platform, size = 'md' }: PlatformLogoProps) {
  return (
    <div
      className={`flex items-center justify-center font-bold tracking-tight ${sizeClasses[size]}`}
    >
      {platform.slug === 'hotmart' ? (
        <span className="flex items-center gap-2">
          <span className="text-[#F04E23] text-3xl">🔥</span>
          <span className="text-black font-bold lowercase">hotmart</span>
        </span>
      ) : (
        <span style={{ color: platform.brandColor }}>{platform.name}</span>
      )}
    </div>
  )
}
