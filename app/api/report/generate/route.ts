import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateText } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { categories, questions } from '@/lib/assessment-data'

const REPORT_PROMPT = `You are a sports psychology expert and performance coach speaking DIRECTLY to an athlete. Generate a detailed, personalized DOTIQ report based on their assessment data.

CRITICAL: Always use second-person language ("you", "your") when speaking to the athlete. NEVER use their name or third-person references like "the athlete scored" or "[Name] demonstrates". Instead say "You scored" or "You demonstrate".

The report should follow this exact structure:

1. **Executive Summary** - 2-3 sentences speaking directly to the athlete about their overall performance ("You show exceptional..." not "Athlete shows...")

2. **Overall DOTIQ Score Analysis** - Direct analysis of what their score means for them ("Your score of X.X indicates..." not "A score of X.X indicates...")

3. **Pillar Breakdown** - For each of the 4 pillars (Discipline, Ownership, Toughness, Sports IQ):
   - Score interpretation (speak directly: "You scored..." "Your discipline shows...")
   - 2-3 specific strengths: Write these as personal observations about the athlete derived from their HIGH-scoring answers. Do NOT just restate or rephrase the question. Instead, interpret what that high score MEANS about them as a person/athlete. Make it feel like coaching insight, not survey feedback. Example: instead of "Completes required work without reminders" write "Your intrinsic drive pushes you to show up even when no one's watching — that's a rare trait in athletes your level."
   - 1-2 growth areas: Same rule — interpret what their LOW scores reveal about their mindset or habits. Make it honest, specific, and forward-looking. Example: instead of "Maintains discipline when motivation is low" write "When the grind stops feeling exciting, you tend to lose your edge — building systems that don't rely on motivation will be a game-changer for you."
   - 3-4 specific, actionable recommendations ("Focus on..." "Practice..." "Try...")

4. **Strongest Signals** - Your top 6 highest-rated behaviors. For each one, DO NOT copy the question text. Instead write a short, punchy first-person statement that captures what this high score says about the athlete's character. Example: question "Follows daily routines geared towards long-term growth" → signal "You're a creature of good habits — your daily structure is quietly building your ceiling higher than most."

5. **Pressure Points** - 4-6 behaviors that need attention (from questions rated 1-5). Again, DO NOT copy the question text. Write honest, empathetic coaching observations. Example: question "Maintains discipline when motivation is low" → pressure point "When the spark fades, so does your output — you haven't yet built the systems that carry you on autopilot."

6. **Mindset Profile** - A short paragraph describing the athlete's overall mindset archetype based on their pillar balance

7. **Competition Day Checklist** - 5 specific things to focus on before/during competition based on their profile

8. **Action Plan** - 2 concrete daily habits for this week with detailed descriptions and WHY they matter for this athlete

9. **Weekly Micro-Goals** - 3 specific, measurable goals for the next 7 days

10. **5-Second Reset Script** - A personalized mental reset routine for after mistakes:
   - Breath cue (specific instruction)
   - Body cue (physical action)
   - Words (a powerful mantra for YOU)
   - Task focus (what to do next)

11. **Self-Check Prompts** - 5 reflective journal questions for the next 7 days

12. **Coach Communication** - 2-3 talking points for discussing this assessment with coaches/mentors

Be specific, direct, actionable, and encouraging. Speak AS IF you are coaching this athlete one-on-one. Reference specific behaviors from their assessment. Make every insight feel personalized.

Format the response as valid JSON with this structure:
{
  "executiveSummary": "...",
  "overallAnalysis": "...",
  "mindsetProfile": "...",
  "pillars": {
    "discipline": { "interpretation": "...", "strengths": ["...", "...", "..."], "improvements": ["...", "..."], "recommendations": ["...", "...", "...", "..."] },
    "ownership": { ... },
    "toughness": { ... },
    "sportsiq": { ... }
  },
  "strongestSignals": [{ "insight": "Your personalized coaching observation here...", "score": 10 }, ...],
  "pressurePoints": [{ "insight": "Your honest, forward-looking coaching observation here...", "score": 4 }, ...],
  "competitionChecklist": ["...", "...", "...", "...", "..."],
  "actionPlan": { "habit1": { "title": "...", "description": "...", "why": "..." }, "habit2": { ... } },
  "weeklyMicroGoals": ["...", "...", "..."],
  "resetScript": { "breath": "...", "body": "...", "words": "...", "task": "..." },
  "selfCheckPrompts": ["...", "...", "...", "...", "..."],
  "coachTalkingPoints": ["...", "...", "..."]
}`

export async function POST(request: Request) {
  console.log('[v0] POST /api/report/generate called')
  
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.log('[v0] Unauthorized - no user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('[v0] User authenticated:', user.id)
    
    const body = await request.json()
    const { assessmentId } = body
    
    console.log('[v0] Assessment ID:', assessmentId)
    
    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID required' }, { status: 400 })
    }
    
    // Get assessment data
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .single()
    
    if (assessmentError || !assessment) {
      console.log('[v0] Assessment not found:', assessmentError)
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }
    
    console.log('[v0] Assessment found, purchased_at:', assessment.purchased_at)
    
    // Check if purchase exists
    if (!assessment.purchased_at) {
      console.log('[v0] Report not purchased')
      return NextResponse.json({ error: 'Report not purchased' }, { status: 403 })
    }
    
    // Check if report already exists
    const { data: existingReport } = await supabase
      .from('reports')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single()
    
    if (existingReport) {
      console.log('[v0] Returning existing report')
      return NextResponse.json({ 
        success: true, 
        report: existingReport.content,
        shareToken: existingReport.share_token,
      })
    }
    
    console.log('[v0] No existing report, generating new one...')
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    
    // Build prompt context with scores and answers
    const answers = assessment.answers as Record<number, number> || {}
    const scores = assessment.scores as Record<string, number> || {}
    
    // Get top and bottom questions
    const questionScores = questions.map(q => ({
      id: q.id,
      text: q.text,
      category: q.category,
      score: answers[q.id] || 5
    })).sort((a, b) => b.score - a.score)
    
    const topQuestions = questionScores.slice(0, 6)
    const bottomQuestions = questionScores.slice(-6).reverse()
    
    const context = `
ATHLETE: ${profile?.full_name || 'Athlete'}

OVERALL DOTIQ SCORE: ${assessment.overall_score.toFixed(1)} / 10
${assessment.is_verified ? `VERIFIED SCORE: ${assessment.verified_score?.toFixed(1)} / 10` : ''}

PILLAR SCORES:
- Discipline: ${scores.discipline?.toFixed(1) || 'N/A'} / 10
- Ownership: ${scores.ownership?.toFixed(1) || 'N/A'} / 10
- Toughness: ${scores.toughness?.toFixed(1) || 'N/A'} / 10
- Sports IQ: ${scores.sportsiq?.toFixed(1) || 'N/A'} / 10

TOP 6 HIGHEST-RATED QUESTIONS:
${topQuestions.map((q, i) => `${i + 1}. "${q.text}" - Score: ${q.score}/10 (${categories[q.category].name})`).join('\n')}

BOTTOM 6 LOWEST-RATED QUESTIONS:
${bottomQuestions.map((q, i) => `${i + 1}. "${q.text}" - Score: ${q.score}/10 (${categories[q.category].name})`).join('\n')}

FULL ANSWERS BY PILLAR:
${Object.keys(categories).map(cat => {
  const pillarQuestions = questions.filter(q => q.category === cat)
  const pillarAnswers = pillarQuestions.map(q => `- "${q.text}": ${answers[q.id] || 'N/A'}/10`)
  return `\n${categories[cat as keyof typeof categories].name}:\n${pillarAnswers.join('\n')}`
}).join('\n')}
`

    // Generate report using AI
    console.log('[v0] Calling AI to generate report...')
    const { text } = await generateText({
      model: gateway('openai/gpt-4o-mini'),
      prompt: `${REPORT_PROMPT}\n\nASSESSMENT DATA:\n${context}`,
    })
    console.log('[v0] AI response received, length:', text.length)
    
    // Parse the JSON response
    let reportContent
    try {
      // Extract JSON from markdown code block if present
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text
      reportContent = JSON.parse(jsonStr)
    } catch {
      console.error('Failed to parse AI response:', text)
      return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
    }
    
    // Store report in database
    const { data: newReport, error: insertError } = await supabase
      .from('reports')
      .insert({
        assessment_id: assessmentId,
        user_id: user.id,
        content: reportContent,
        generated_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Error storing report:', insertError)
      return NextResponse.json({ error: 'Failed to store report' }, { status: 500 })
    }
    
    // Create a share record for easy sharing
    const shareToken = newReport.id.substring(0, 16) // Use first 16 chars of report ID as token
    const { error: shareError } = await supabase
      .from('assessment_shares')
      .insert({
        assessment_id: assessmentId,
        share_token: shareToken,
        created_by: user.id,
        shared_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (shareError) {
      console.warn('[v0] Warning: Failed to create share record:', shareError)
      // Don't fail the request, the report was still created successfully
    } else {
      console.log('[v0] Share record created with token:', shareToken)
    }
    
    return NextResponse.json({ 
      success: true, 
      report: reportContent,
      shareToken: shareToken,
    })
    
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
