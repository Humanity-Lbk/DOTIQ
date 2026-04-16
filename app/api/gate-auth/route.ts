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
    // 30 days — they won't need to re-enter constantly
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return response
}
