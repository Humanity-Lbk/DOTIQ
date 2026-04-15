import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateText } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { categories, questions } from '@/lib/assessment-data'

const REPORT_PROMPT = `You are a sports psychology expert and performance coach. Generate a detailed DOTIQ athlete report based on the assessment data provided.

The report should follow this exact structure and be personalized to the athlete's scores:

1. **Executive Summary** - 2-3 sentences summarizing overall performance and key insights

2. **Overall DOTIQ Score Analysis** - Brief analysis of what the overall score means

3. **Pillar Breakdown** - For each of the 4 pillars (Discipline, Ownership, Toughness, Sports IQ):
   - Score interpretation
   - 2-3 specific strengths based on high-scoring questions
   - 1-2 areas for improvement based on lower-scoring questions
   - Specific, actionable recommendations

4. **Strongest Signals** - List the top 6 highest-rated behaviors (questions rated 8-10)

5. **Pressure Points** - List the 4-6 lowest-rated behaviors that need attention (questions rated 1-5)

6. **Action Plan** - 2 concrete daily habits/practices to focus on this week

7. **5-Second Reset Script** - A personalized mental reset routine for after mistakes:
   - Breath cue
   - Body cue
   - Words (a short mantra)
   - Task focus

8. **Self-Check Prompts** - 5 journal questions for the next 7 days

Be specific, actionable, and encouraging. Use the athlete's actual scores to personalize every section. Reference specific question topics when discussing strengths and weaknesses.

Format the response as valid JSON with this structure:
{
  "executiveSummary": "...",
  "overallAnalysis": "...",
  "pillars": {
    "discipline": { "interpretation": "...", "strengths": ["..."], "improvements": ["..."], "recommendations": ["..."] },
    "ownership": { ... },
    "toughness": { ... },
    "sportsiq": { ... }
  },
  "strongestSignals": [{ "question": "...", "score": 10 }, ...],
  "pressurePoints": [{ "question": "...", "score": 4 }, ...],
  "actionPlan": { "habit1": { "title": "...", "description": "..." }, "habit2": { ... } },
  "resetScript": { "breath": "...", "body": "...", "words": "...", "task": "..." },
  "selfCheckPrompts": ["...", "...", "...", "...", "..."]
}`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { assessmentId } = body
    
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
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }
    
    // Check if purchase exists
    if (!assessment.purchased_at) {
      return NextResponse.json({ error: 'Report not purchased' }, { status: 403 })
    }
    
    // Check if report already exists
    const { data: existingReport } = await supabase
      .from('reports')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single()
    
    if (existingReport) {
      return NextResponse.json({ 
        success: true, 
        report: existingReport.content,
        shareToken: existingReport.share_token,
      })
    }
    
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
    const { text } = await generateText({
      model: gateway('openai/gpt-4o-mini'),
      prompt: `${REPORT_PROMPT}\n\nASSESSMENT DATA:\n${context}`,
    })
    
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
    
    return NextResponse.json({ 
      success: true, 
      report: reportContent,
      shareToken: newReport.share_token,
    })
    
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
