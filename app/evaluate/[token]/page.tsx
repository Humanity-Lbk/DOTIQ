import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EvaluationForm } from './evaluation-form'

interface PageProps {
  params: { token: string }
}

export default async function EvaluatePage({ params }: PageProps) {
  const { token } = params
  const supabase = await createClient()
  
  // Get verification request by token
  const { data: request, error } = await supabase
    .from('verification_requests')
    .select(`
      id,
      evaluator_type,
      evaluator_name,
      athlete_name,
      status,
      expires_at,
      user_id,
      assessment_id,
      profiles!verification_requests_user_id_fkey (
        full_name
      )
    `)
    .eq('token', token)
    .single()
  
  if (error || !request) {
    notFound()
  }
  
  // Check if already completed
  if (request.status === 'completed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-fuchsia-800/10 to-cyan-700/5 pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-black">Already Completed</h1>
          <p className="text-muted-foreground">
            You&apos;ve already submitted your evaluation. Thank you for helping!
          </p>
        </div>
      </div>
    )
  }
  
  // Check if expired
  if (request.expires_at && new Date(request.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-fuchsia-800/10 to-cyan-700/5 pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black">Link Expired</h1>
          <p className="text-muted-foreground">
            This evaluation link has expired. Please ask the athlete to send a new request.
          </p>
        </div>
      </div>
    )
  }
  
  const profile = Array.isArray((request as any).profiles)
    ? ((request as any).profiles[0] as { full_name: string | null } | undefined)
    : ((request as any).profiles as { full_name: string | null } | null | undefined)

  const athleteName = request.athlete_name || profile?.full_name || 'the athlete'
  
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-fuchsia-800/10 to-cyan-700/5 pointer-events-none" />
      
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-lg">D</span>
            </div>
            <span className="font-bold text-xl">DOTIQ</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black">
            Evaluate {athleteName}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            You&apos;ve been asked to evaluate {athleteName} as their {request.evaluator_type}. 
            Your honest feedback will help them understand their athletic mindset better.
          </p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm">
            <span className="text-muted-foreground">Evaluating as:</span>
            <span className="font-bold capitalize">{request.evaluator_type}</span>
          </div>
        </div>
        
        <EvaluationForm 
          requestId={request.id}
          token={token}
          evaluatorType={request.evaluator_type}
          athleteName={athleteName}
        />
      </main>
    </div>
  )
}
