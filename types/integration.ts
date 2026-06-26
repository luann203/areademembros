export type IntegrationCategory = 'video' | 'payment'

export type IntegrationModality = 'courses' | 'subscription' | 'unlimited'

export type IntegrationPlatform = {
  slug: string
  name: string
  category: IntegrationCategory
  categoryLabel: string
  brandColor: string
  textColor?: string
  description?: string
}

export type IntegrationRecord = {
  id: string
  platform: string
  name: string
  token: string | null
  offerId: string | null
  modality: string
  courseIds: string
  webhookUrl: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export type WebhookLogRecord = {
  id: string
  integrationId: string | null
  platform: string
  eventType: string | null
  payload: string
  status: string
  createdAt: string
}
