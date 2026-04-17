import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (password?.toLowerCase().trim() !== 'humanity') {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('dotiq_gate', 'humanity_granted', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // 24 hours — user must re-enter password daily
    maxAge: 60 * 60 * 24,
    path: '/',
  })

  return response
}
