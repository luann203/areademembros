import crypto from 'crypto'

export function verifyHotmartSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return false

  const expected = crypto.createHmac('sha1', secret).update(payload).digest('hex')

  if (signature.length !== expected.length) return false

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}
