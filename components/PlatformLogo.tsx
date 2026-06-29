import Image from 'next/image'
import type { IntegrationPlatform } from '@/types/integration'

type PlatformLogoProps = {
  platform: IntegrationPlatform
  size?: 'sm' | 'md' | 'lg'
}

const imageHeight = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
}

export default function PlatformLogo({ platform, size = 'md' }: PlatformLogoProps) {
  return (
    <div className="flex items-center justify-center">
      {platform.slug === 'hotmart' ? (
        <Image
          src="/Logo_hotmart.png?v=2"
          alt="Hotmart"
          width={180}
          height={48}
          className={`w-auto object-contain ${imageHeight[size]}`}
          unoptimized
        />
      ) : (
        <span className="font-bold tracking-tight" style={{ color: platform.brandColor }}>
          {platform.name}
        </span>
      )}
    </div>
  )
}
