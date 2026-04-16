import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, generateReportEmailHtml } from '@/lib/email'
import { jsPDF } from 'jspdf'
import { categories, type Category } from '@/lib/assessment-data'

interface AIReport {
  executiveSummary: string
  overallAnalysis: string
  mindsetProfile?: string
  pillars: Record<string, {
    interpretation: string
    strengths: string[]
    improvements: string[]
    recommendations: string[]
  }>
  strongestSignals: Array<{ question: string; score: number }>
  pressurePoints: Array<{ question: string; score: number }>
  competitionChecklist?: string[]
  actionPlan: {
    habit1: { title: string; description: string; why?: string }
    habit2: { title: string; description: string; why?: string }
  }
  weeklyMicroGoals?: string[]
  resetScript: {
    breath: string
    body: string
    words: string
    task: string
  }
  selfCheckPrompts: string[]
  coachTalkingPoints?: string[]
}

function generatePDF(
  report: AIReport, 
  scores: Record<string, number>, 
  overallScore: number, 
  userName: string
): Buffer {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = 20

  // Helper to add page break if needed
  const checkPageBreak = (neededSpace: number) => {
    if (y + neededSpace > 270) {
      doc.addPage()
      y = 20
    }
  }

  // Helper to wrap text
  const addWrappedText = (text: string, fontSize: number, maxWidth: number): number => {
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(text, maxWidth)
    const lineHeight = fontSize * 0.5
    lines.forEach((line: string) => {
      checkPageBreak(lineHeight)
      doc.text(line, margin, y)
      y += lineHeight
    })
    return lines.length * lineHeight
  }

  // Header
  doc.setFillColor(245, 166, 35) // Primary color
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('DOTIQ', margin, 25)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Athletic Performance Intelligence Report', margin, 33)
  
  y = 55

  // Athlete Info & Score
  doc.setTextColor(50, 50, 50)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`Report for: ${userName}`, margin, y)
  y += 8
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y)
  y += 15

  // Overall Score Box
  doc.setFillColor(245, 166, 35)
  doc.roundedRect(margin, y, 60, 30, 3, 3, 'F')
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(overallScore.toFixed(1), margin + 10, y + 20)
  doc.setFontSize(10)
  doc.text('/ 10', margin + 38, y + 20)
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('DOTIQ SCORE', margin + 10, y + 8)
  
  y += 40

  // Pillar Scores
  doc.setTextColor(50, 50, 50)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Pillar Scores', margin, y)
  y += 10

  const pillarColors: Record<string, [number, number, number]> = {
    discipline: [245, 166, 35],
    ownership: [52, 211, 153],
    toughness: [251, 113, 133],
    sportsiq: [34, 211, 238],
  }

  Object.keys(scores).forEach((pillar) => {
    const score = scores[pillar]
    const color = pillarColors[pillar] || [100, 100, 100]
    
    doc.setFillColor(...color)
    doc.roundedRect(margin, y, 8, 8, 1, 1, 'F')
    
    doc.setTextColor(50, 50, 50)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`${categories[pillar as Category]?.name || pillar}: ${score.toFixed(1)}`, margin + 12, y + 6)
    y += 12
  })

  y += 10

  // Executive Summary
  checkPageBreak(40)
  doc.setTextColor(50, 50, 50)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Executive Summary', margin, y)
  y += 8
  
  doc.setFont('helvetica', 'normal')
  addWrappedText(report.executiveSummary, 10, contentWidth)
  y += 10

  // Mindset Profile
  if (report.mindsetProfile) {
    checkPageBreak(40)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Your Mindset Profile', margin, y)
    y += 8
    
    doc.setFont('helvetica', 'normal')
    addWrappedText(report.mindsetProfile, 10, contentWidth)
    y += 10
  }

  // Pillar Analysis
  (Object.keys(report.pillars) as Category[]).forEach((pillar) => {
    const pillarData = report.pillars[pillar]
    const color = pillarColors[pillar] || [100, 100, 100]
    
    checkPageBreak(60)
    
    // Pillar header
    doc.setFillColor(...color)
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`${categories[pillar]?.name || pillar} - ${scores[pillar]?.toFixed(1) || 'N/A'}`, margin + 5, y + 8)
    y += 18
    
    // Interpretation
    doc.setTextColor(50, 50, 50)
    doc.setFont('helvetica', 'normal')
    addWrappedText(pillarData.interpretation, 10, contentWidth)
    y += 5
    
    // Strengths
    checkPageBreak(30)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(52, 211, 153)
    doc.text('Strengths:', margin, y)
    y += 6
    
    doc.setTextColor(50, 50, 50)
    doc.setFont('helvetica', 'normal')
    pillarData.strengths.forEach((strength) => {
      checkPageBreak(10)
      doc.text(`• ${strength}`, margin + 5, y)
      const lines = doc.splitTextToSize(strength, contentWidth - 10)
      y += lines.length * 5 + 2
    })
    y += 3
    
    // Improvements
    checkPageBreak(30)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(251, 113, 133)
    doc.text('Growth Areas:', margin, y)
    y += 6
    
    doc.setTextColor(50, 50, 50)
    doc.setFont('helvetica', 'normal')
    pillarData.improvements.forEach((improvement) => {
      checkPageBreak(10)
      doc.text(`• ${improvement}`, margin + 5, y)
      const lines = doc.splitTextToSize(improvement, contentWidth - 10)
      y += lines.length * 5 + 2
    })
    y += 3
    
    // Recommendations
    checkPageBreak(30)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(50, 50, 50)
    doc.text('Recommendations:', margin, y)
    y += 6
    
    doc.setFont('helvetica', 'normal')
    pillarData.recommendations.forEach((rec, i) => {
      checkPageBreak(10)
      doc.text(`${i + 1}. ${rec}`, margin + 5, y)
      const lines = doc.splitTextToSize(rec, contentWidth - 15)
      y += lines.length * 5 + 2
    })
    y += 10
  })

  // Action Plan
  checkPageBreak(50)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(50, 50, 50)
  doc.text("This Week's Action Plan", margin, y)
  y += 10
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`1. ${report.actionPlan.habit1.title}`, margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  addWrappedText(report.actionPlan.habit1.description, 10, contentWidth - 10)
  y += 5
  
  doc.setFont('helvetica', 'bold')
  doc.text(`2. ${report.actionPlan.habit2.title}`, margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  addWrappedText(report.actionPlan.habit2.description, 10, contentWidth - 10)
  y += 10

  // Reset Script
  checkPageBreak(50)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Your 5-Second Reset Script', margin, y)
  y += 10
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Breath:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(report.resetScript.breath, margin + 20, y)
  y += 6
  
  doc.setFont('helvetica', 'bold')
  doc.text('Body:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(report.resetScript.body, margin + 20, y)
  y += 6
  
  doc.setFont('helvetica', 'bold')
  doc.text('Words:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(report.resetScript.words, margin + 20, y)
  y += 6
  
  doc.setFont('helvetica', 'bold')
  doc.text('Task:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(report.resetScript.task, margin + 20, y)
  y += 15

  // Journal Prompts
  checkPageBreak(60)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('7-Day Journal Prompts', margin, y)
  y += 10
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  report.selfCheckPrompts.forEach((prompt, i) => {
    checkPageBreak(15)
    const lines = doc.splitTextToSize(`${i + 1}. ${prompt}`, contentWidth)
    lines.forEach((line: string) => {
      doc.text(line, margin, y)
      y += 5
    })
    y += 2
  })

  // Footer on last page
  const pageCount = doc.internal.pages.length - 1
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `DOTIQ Report - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      285,
      { align: 'center' }
    )
  }

  // Convert to buffer
  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { assessmentId, email } = body
    
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
    
    // Get report
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single()
    
    if (reportError || !reportData) {
      return NextResponse.json({ error: 'Report not found. Please generate report first.' }, { status: 404 })
    }
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    
    const userName = profile?.full_name || 'Athlete'
    const report = reportData.content as AIReport
    const scores = assessment.scores as Record<string, number>
    const overallScore = assessment.overall_score
    const recipientEmail = email || user.email
    
    // Generate PDF
    const pdfBuffer = generatePDF(report, scores, overallScore, userName)
    
    // Build report URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dotiq.com'
    const reportUrl = `${baseUrl}/report/${assessmentId}`
    
    // Send email with PDF attachment
    await sendEmail({
      to: recipientEmail,
      subject: `Your DOTIQ Assessment Report - Score: ${overallScore.toFixed(1)}`,
      html: generateReportEmailHtml(userName, overallScore, reportUrl),
      attachments: [
        {
          filename: `DOTIQ-Report-${userName.replace(/\s+/g, '-')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    })
    
    // Update report to mark email sent
    await supabase
      .from('reports')
      .update({
        email_sent_at: new Date().toISOString(),
        email_sent_to: recipientEmail,
      })
      .eq('id', reportData.id)
    
    return NextResponse.json({ 
      success: true, 
      message: `Report sent to ${recipientEmail}`,
    })
    
  } catch (error) {
    console.error('Error sending report email:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    }, { status: 500 })
  }
}
