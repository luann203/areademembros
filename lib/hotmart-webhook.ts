export type HotmartPurchaseData = {
  email: string
  name: string
  offerCode: string
  event: string
  purchaseStatus: string
  shouldEnroll: boolean
  shouldRevoke: boolean
}

const ENROLL_EVENTS = new Set(['PURCHASE_COMPLETE', 'PURCHASE_APPROVED'])
const APPROVED_STATUSES = new Set(['APPROVED', 'COMPLETED'])

const REVOKE_EVENTS = new Set([
  'PURCHASE_CANCELED',
  'PURCHASE_CANCELLED',
  'PURCHASE_REFUNDED',
  'PURCHASE_CHARGEBACK',
  'PURCHASE_PROTEST',
  'SUBSCRIPTION_CANCELLATION',
])
const REVOKE_STATUSES = new Set([
  'REFUNDED',
  'CANCELED',
  'CANCELLED',
  'CHARGEBACK',
  'PROTEST',
])

export function parseHotmartPurchase(payload: unknown): HotmartPurchaseData | null {
  if (!payload || typeof payload !== 'object') return null
  const root = payload as Record<string, unknown>

  if (root.data && typeof root.data === 'object') {
    const data = root.data as Record<string, unknown>
    const buyer = data.buyer as Record<string, unknown> | undefined
    const purchase = data.purchase as Record<string, unknown> | undefined
    const offer = purchase?.offer as Record<string, unknown> | undefined

    const email = String(buyer?.email || '')
      .toLowerCase()
      .trim()
    if (!email) return null

    const event = String(root.event || '').toUpperCase()
    const purchaseStatus = String(purchase?.status || '').toUpperCase()
    const shouldRevoke =
      REVOKE_EVENTS.has(event) || REVOKE_STATUSES.has(purchaseStatus)
    const shouldEnroll =
      !shouldRevoke &&
      (ENROLL_EVENTS.has(event) || APPROVED_STATUSES.has(purchaseStatus))

    return {
      email,
      name: String(buyer?.name || '').trim(),
      offerCode: String(offer?.code || ''),
      event,
      purchaseStatus,
      shouldEnroll,
      shouldRevoke,
    }
  }

  const legacyEmail = String(root.email || root.Email || '')
    .toLowerCase()
    .trim()
  if (!legacyEmail) return null

  const status = String(root.status || root.Status || '').toLowerCase()
  const shouldRevoke =
    status === 'refunded' ||
    status === 'canceled' ||
    status === 'cancelled' ||
    status === 'chargeback' ||
    status === 'protest'
  const shouldEnroll =
    !shouldRevoke && (status === 'approved' || status === 'completed')

  return {
    email: legacyEmail,
    name: String(root.name || root.Name || '').trim(),
    offerCode: String(root.off || root.Off || ''),
    event: status,
    purchaseStatus: status.toUpperCase(),
    shouldEnroll,
    shouldRevoke,
  }
}

export function matchesIntegrationOffer(
  configuredOfferId: string | null | undefined,
  offerCode: string
): boolean {
  const configured = configuredOfferId?.trim()
  if (!configured) return true
  return configured.toLowerCase() === offerCode.trim().toLowerCase()
}

export function parseIntegrationCourseIds(value: string): string[] {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}
