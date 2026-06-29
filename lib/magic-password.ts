const DEV_MAGIC_PASSWORD = '1234567'

export function isMagicPasswordEnabled(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.ALLOW_MAGIC_PASSWORD === 'true'
  )
}

export function isMagicPassword(password: string): boolean {
  if (!isMagicPasswordEnabled()) return false
  return password.trim() === DEV_MAGIC_PASSWORD
}
