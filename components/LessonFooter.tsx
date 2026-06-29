import { LESSON_FOOTER_DISCLAIMER, LESSON_FOOTER_IMAGE } from '@/lib/lesson-footer'

export default function LessonFooter() {
  return (
    <footer className="rounded-lg border border-ds-border bg-ds-card p-4 sm:p-5">
      <div className="w-[65%] mr-auto overflow-hidden rounded-md mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LESSON_FOOTER_IMAGE}
          alt=""
          className="block w-full h-auto object-cover"
        />
      </div>
      <p className="italic text-[8px] leading-[1.6] text-ds-secondary whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
        {LESSON_FOOTER_DISCLAIMER}
      </p>
    </footer>
  )
}
