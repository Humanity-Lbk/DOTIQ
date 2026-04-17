import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Super admins see all requests, admins see only their own
  let query = supabase
    .from('requests')
    .select(`
      *,
      profiles:user_id (full_name, role)
    `)
    .order('created_at', { ascending: false })

  if (profile.role !== 'super_admin') {
    query = query.eq('user_id', user.id)
  }

  const { data: requests, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ requests })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { type, title, description, attachments } = body

  if (!type || !title || !description) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Create the request
  const { data: newRequest, error } = await supabase
    .from('requests')
    .insert({
      user_id: user.id,
      type,
      title,
      description,
      attachments: attachments || [],
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const typeLabels: Record<string, string> = {
    feature: 'Feature Request',
    change: 'Change Request',
    bug: 'Bug Report',
    error: 'Error Ticket',
  }

  const typeColors: Record<string, string> = {
    feature: '#f5a623',
    change: '#22d3ee',
    bug: '#fb7185',
    error: '#ef4444',
  }

  // Get super admin IDs then resolve emails via admin client
  const { data: superAdminProfiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'super_admin')

  let superAdminEmails: { id: string; full_name: string | null; email: string }[] = []
  if (superAdminProfiles && superAdminProfiles.length > 0) {
    try {
      const adminClient = createAdminClient()
      const emailResults = await Promise.all(
        superAdminProfiles.map(async (p) => {
          const { data } = await adminClient.auth.admin.getUserById(p.id)
          return { id: p.id, full_name: p.full_name, email: data.user?.email ?? '' }
        })
      )
      superAdminEmails = emailResults.filter((e) => !!e.email)
    } catch {
      // Admin client unavailable — skip email notifications
    }
  }

  // Send email to each super admin
  if (superAdminEmails.length > 0) {
    const submitterName = profile.full_name || user.email || 'Unknown'
    const color = typeColors[type] || '#f5a623'
    const label = typeLabels[type] || 'Request'

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,sans-serif;color:#e5e5e5;">
        <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
          <div style="margin-bottom:24px;">
            <span style="font-family:monospace;font-size:11px;color:${color};">DOTIQ · NEW ${label.toUpperCase()}</span>
          </div>
          <h1 style="font-size:22px;font-weight:900;margin:0 0 8px;color:#fff;">${title}</h1>
          <div style="display:inline-block;padding:4px 10px;background:${color}22;border:1px solid ${color}66;border-radius:99px;font-size:11px;font-weight:700;color:${color};margin-bottom:20px;">${label}</div>
          <div style="background:#111;border:1px solid #222;border-radius:12px;padding:16px;margin-bottom:20px;">
            <p style="margin:0;font-size:14px;color:#aaa;line-height:1.6;">${description.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="font-size:12px;color:#666;margin:0;">Submitted by <strong style="color:#999;">${submitterName}</strong></p>
          <div style="margin-top:24px;padding-top:20px;border-top:1px solid #222;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dotiq.com'}/requests" style="display:inline-block;padding:10px 20px;background:${color};color:#000;font-weight:700;font-size:13px;border-radius:8px;text-decoration:none;">View in App →</a>
          </div>
        </div>
      </body>
      </html>
    `

    await Promise.allSettled(
      superAdminEmails.map((admin) =>
          sendEmail({
            to: admin.email,
            subject: `[DOTIQ] New ${label}: ${title}`,
            html: emailHtml,
          })
        )
    )
  }

  return NextResponse.json({
    request: newRequest,
    message: 'Request submitted successfully',
  })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only super admins can update requests
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { id, status } = body

  if (!id || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: updated, error } = await supabase
    .from('requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ request: updated })
}
