import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  // Get all super admins for notification
  const { data: superAdmins } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'super_admin')

  // Send email notification to super admins
  const typeLabels: Record<string, string> = {
    feature: 'Feature Request',
    change: 'Change Request',
    bug: 'Bug Report',
    error: 'Error Ticket',
  }

  // Log notification (in production, integrate with email service)
  console.log(`[DOTIQ] New ${typeLabels[type]} from ${profile.full_name || user.email}:`)
  console.log(`Title: ${title}`)
  console.log(`Description: ${description}`)
  console.log(`Super admins to notify: ${superAdmins?.map(a => a.full_name).join(', ')}`)

  return NextResponse.json({ 
    request: newRequest,
    message: 'Request submitted successfully'
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
