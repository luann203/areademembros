import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let loginRatelimit: Ratelimit | null = null

function getLoginRatelimit(): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }

  if (!loginRatelimit) {
    loginRatelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: 'prohub:login',
    })
  }

  return loginRatelimit
}

export async function checkLoginRateLimit(
  identifier: string
): Promise<{ success: boolean; remaining?: number }> {
  const limiter = getLoginRatelimit()
  if (!limiter) {
    return { success: true }
  }

  const { success, remaining } = await limiter.limit(identifier)
  return { success, remaining }
}
