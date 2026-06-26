export const DEFAULT_AVATAR_URL = '/avatars/avatar.jpg'

export function resolveAvatarUrl(avatarUrl: string | null | undefined): string {
  return avatarUrl || DEFAULT_AVATAR_URL
}
