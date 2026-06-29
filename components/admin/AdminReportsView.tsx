'use client'

import { useEffect, useState } from 'react'
import type { ReportActivityPoint, ReportCourseRow } from '@/types/admin'

type AdminReportsViewProps = {
  initialCourses: ReportCourseRow[]
  initialActivity: ReportActivityPoint[]
}

function npsColor(score: number): string {
  if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30'
  if (score >= 60) return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  if (score >= 40) return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  return 'bg-white/10 text-ds-muted border-ds-border'
}

function ActivityChart({ data }: { data: ReportActivityPoint[] }) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((d) => [d.completions, d.comments, d.ratings])
  )
  const width = 800
  const height = 200
  const padding = 24

  const points = (key: keyof Pick<ReportActivityPoint, 'completions' | 'comments' | 'ratings'>) => {
    if (data.length < 2) return ''
    const step = (width - padding * 2) / (data.length - 1)
    return data
      .map((d, i) => {
        const x = padding + i * step
        const y = height - padding - (d[key] / maxValue) * (height - padding * 2)
        return `${x},${y}`
      })
      .join(' ')
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[600px] h-[200px]">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = height - padding - ratio * (height - padding * 2)
          return (
            <line
              key={ratio}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          )
        })}
        <polyline
          fill="none"
          stroke="#14b8a6"
          strokeWidth="2"
          points={points('completions')}
        />
        <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={points('ratings')} />
        <polyline fill="none" stroke="#a855f7" strokeWidth="2" points={points('comments')} />
      </svg>
      <div className="flex flex-wrap justify-center gap-6 mt-2 text-xs text-ds-secondary">
        <span className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-teal-400 inline-block" />
          Completions
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-blue-400 inline-block" />
          Ratings
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-purple-400 inline-block" />
          Comments
        </span>
      </div>
    </div>
  )
}

export default function AdminReportsView({
  initialCourses,
  initialActivity,
}: AdminReportsViewProps) {
  const [days, setDays] = useState(30)
  const [courses, setCourses] = useState(initialCourses)
  const [activity, setActivity] = useState(initialActivity)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'courses' | 'lessons' | 'members'>('courses')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/reports?days=${days}`)
        if (!res.ok) return
        const data = await res.json()
        setCourses(data.courses)
        setActivity(data.activity)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [days])

  return (
    <div className="ds-page-shell space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="ds-label mb-2">Prohub.</p>
          <h1 className="ds-page-title text-2xl sm:text-3xl">Reports</h1>
        </div>
        <div className="flex gap-2 text-sm">
          {(['Activities'] as const).map((tab) => (
            <span
              key={tab}
              className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 font-medium"
            >
              {tab}
            </span>
          ))}
        </div>
      </header>

      <div className="ds-card p-6">
        <p className="text-xs text-ds-muted mb-4 uppercase tracking-wide">
          Number of interactions
        </p>
        <ActivityChart data={activity} />
      </div>

      <div className="ds-card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-ds-border flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap gap-3">
            <select
              className="ds-input w-auto"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <select className="ds-input w-auto" defaultValue="daily">
              <option value="daily">Daily</option>
            </select>
          </div>
          <div className="flex rounded-lg overflow-hidden border border-ds-border text-xs">
            {(['courses', 'lessons', 'members'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setView(item)}
                className={`px-4 py-2 capitalize ${
                  view === item ? 'bg-white/10 text-white' : 'text-ds-secondary'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <span className="text-xs text-ds-muted w-full sm:w-auto text-right">
            {loading ? 'Loading...' : `Displaying ${courses.length} items`}
          </span>
        </div>

        {view === 'courses' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ds-muted uppercase tracking-wide border-b border-ds-border">
                  <th className="px-6 py-3 font-semibold">Course name</th>
                  <th className="px-4 py-3 font-semibold">Completions</th>
                  <th className="px-4 py-3 font-semibold">Comments</th>
                  <th className="px-4 py-3 font-semibold">Ratings</th>
                  <th className="px-4 py-3 font-semibold">Average ratings</th>
                  <th className="px-6 py-3 font-semibold">NPS score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ds-border">
                {courses.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-medium text-white">{row.title}</td>
                    <td className="px-4 py-4 text-ds-secondary">{row.completions}</td>
                    <td className="px-4 py-4 text-ds-secondary">{row.comments}</td>
                    <td className="px-4 py-4 text-ds-secondary">{row.ratings}</td>
                    <td className="px-4 py-4 text-ds-secondary">
                      {row.averageRating > 0 ? row.averageRating.toFixed(1) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold border ${npsColor(row.npsScore)}`}
                      >
                        {row.npsScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-ds-secondary">
            {view === 'lessons' ? 'Lessons' : 'Members'} breakdown coming soon. Use Courses view for now.
          </div>
        )}
      </div>
    </div>
  )
}
