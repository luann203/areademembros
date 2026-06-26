function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function formatPayloadPreview(payload: string): string {
  try {
    const parsed = JSON.parse(payload)
    const text = JSON.stringify(parsed)
    return text.length > 100 ? `${text.slice(0, 100)}…` : text
  } catch {
    return payload.length > 100 ? `${payload.slice(0, 100)}…` : payload
  }
}

export { formatDateTime, formatPayloadPreview }
