export type UserProfile = {
  id: string
  name: string | null
  email: string
  bio: string | null
  avatarUrl: string | null
  timezone: string
}

export type NotificationItem = {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export const TIMEZONE_OPTIONS = [
  { value: 'America/Sao_Paulo', label: '(GMT-03:00) Brasilia' },
  { value: 'America/Manaus', label: '(GMT-04:00) Manaus' },
  { value: 'America/Noronha', label: '(GMT-02:00) Fernando de Noronha' },
  { value: 'America/New_York', label: '(GMT-05:00) New York' },
  { value: 'America/Los_Angeles', label: '(GMT-08:00) Los Angeles' },
  { value: 'Europe/Lisbon', label: '(GMT+00:00) Lisbon' },
  { value: 'Europe/London', label: '(GMT+00:00) London' },
  { value: 'Europe/Paris', label: '(GMT+01:00) Paris' },
  { value: 'UTC', label: '(GMT+00:00) UTC' },
]
