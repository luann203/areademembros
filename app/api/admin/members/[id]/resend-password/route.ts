import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/require-admin'
import { resendMemberPassword } from '@/lib/admin-members'

type RouteContext = { params: { id: string } }

export async function POST(_request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi()
  if (denied instanceof NextResponse) return denied

  try {
    const password = await resendMemberPassword(params.id)
    return NextResponse.json({ ok: true, password })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to resend password.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
