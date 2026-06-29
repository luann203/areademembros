export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAIL ?? process.env.ADMIN_EMAILS ?? 'admin@example.com'
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isConfiguredAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.trim().toLowerCase())
}
