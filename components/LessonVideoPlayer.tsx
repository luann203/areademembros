'use client'

import dynamic from 'next/dynamic'

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

type LessonVideoPlayerProps = {
  url: string
  onProgress: (played: number) => void
  onEnded: () => void
}

export default function LessonVideoPlayer({ url, onProgress, onEnded }: LessonVideoPlayerProps) {
  return (
    <div className="aspect-video">
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls
        onProgress={({ played }) => onProgress(played)}
        onEnded={onEnded}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload',
            },
          },
        }}
      />
    </div>
  )
}
