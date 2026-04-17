import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, generateReportEmailHtml } from '@/lib/email'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
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

const PRIMARY_COLOR = rgb(0.96, 0.65, 0.14) // #f5a623
const TEXT_COLOR = rgb(0.2, 0.2, 0.2)
const MUTED_COLOR = rgb(0.5, 0.5, 0.5)
const SUCCESS_COLOR = rgb(0.2, 0.83, 0.6)
const DANGER_COLOR = rgb(0.98, 0.44, 0.52)

async function generatePDF(
  report: AIReport, 
  scores: Record<string, number>, 
  overallScore: number, 
  userName: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  const pageWidth = 612 // Letter size
  const pageHeight = 792
  const margin = 50
  const contentWidth = pageWidth - margin * 2
  
  let page = pdfDoc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  // Helper to add new page
  const addNewPage = () => {
    page = pdfDoc.addPage([pageWidth, pageHeight])
    y = pageHeight - margin
  }

  // Helper to check page break
  const checkPageBreak = (neededSpace: number) => {
    if (y - neededSpace < margin + 30) {
      addNewPage()
    }
  }

  // Helper to wrap and draw text
  const drawWrappedText = (text: string, x: number, fontSize: number, maxWidth: number, font = helvetica, color = TEXT_COLOR) => {
    const words = text.split(' ')
    let line = ''
    const lines: string[] = []
    
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word
      const testWidth = font.widthOfTextAtSize(testLine, fontSize)
      
      if (testWidth > maxWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = testLine
      }
    }
    if (line) lines.push(line)
    
    const lineHeight = fontSize * 1.4
    for (const l of lines) {
      checkPageBreak(lineHeight)
      page.drawText(l, { x, y, size: fontSize, font, color })
      y -= lineHeight
    }
    
    return lines.length * lineHeight
  }

  // Header background
  page.drawRectangle({
    x: 0,
    y: pageHeight - 80,
    width: pageWidth,
    height: 80,
    color: PRIMARY_COLOR,
  })

  // Title
  page.drawText('DOTIQ', {
    x: margin,
    y: pageHeight - 45,
    size: 28,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  })

  page.drawText('Athletic Performance Intelligence Report', {
    x: margin,
    y: pageHeight - 65,
    size: 12,
    font: helvetica,
    color: rgb(0, 0, 0),
  })

  y = pageHeight - 110

  // Athlete name and date
  page.drawText(`Report for: ${userName}`, {
    x: margin,
    y,
    size: 14,
    font: helveticaBold,
    color: TEXT_COLOR,
  })
  y -= 20

  page.drawText(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, {
    x: margin,
    y,
    size: 10,
    font: helvetica,
    color: MUTED_COLOR,
  })
  y -= 35

  // Overall Score Box
  page.drawRectangle({
    x: margin,
    y: y - 45,
    width: 100,
    height: 50,
    color: PRIMARY_COLOR,
  })

  page.drawText('DOTIQ SCORE', {
    x: margin + 10,
    y: y - 15,
    size: 8,
    font: helvetica,
    color: rgb(0, 0, 0),
  })

  page.drawText(overallScore.toFixed(1), {
    x: margin + 15,
    y: y - 40,
    size: 24,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  })

  page.drawText('/ 10', {
    x: margin + 60,
    y: y - 40,
    size: 12,
    font: helvetica,
    color: rgb(0, 0, 0),
  })

  y -= 70

  // Pillar Scores
  page.drawText('Pillar Scores', {
    x: margin,
    y,
    size: 14,
    font: helveticaBold,
    color: TEXT_COLOR,
  })
  y -= 20

  const pillarRgbColors: Record<string, ReturnType<typeof rgb>> = {
    discipline: PRIMARY_COLOR,
    ownership: SUCCESS_COLOR,
    toughness: DANGER_COLOR,
    sportsiq: rgb(0.13, 0.83, 0.93),
  }

  for (const pillar of Object.keys(scores)) {
    const score = scores[pillar]
    const color = pillarRgbColors[pillar] || MUTED_COLOR
    
    page.drawRectangle({
      x: margin,
      y: y - 8,
      width: 10,
      height: 10,
      color,
    })

    page.drawText(`${categories[pillar as Category]?.name || pillar}: ${score.toFixed(1)}`, {
      x: margin + 16,
      y: y - 6,
      size: 11,
      font: helvetica,
      color: TEXT_COLOR,
    })
    y -= 18
  }

  y -= 20

  // Executive Summary
  checkPageBreak(60)
  page.drawText('Executive Summary', {
    x: margin,
    y,
    size: 16,
    font: helveticaBold,
    color: TEXT_COLOR,
  })
  y -= 20

  drawWrappedText(report.executiveSummary, margin, 11, contentWidth)
  y -= 15

  // Mindset Profile
  if (report.mindsetProfile) {
    checkPageBreak(60)
    page.drawText('Your Mindset Profile', {
      x: margin,
      y,
      size: 16,
      font: helveticaBold,
      color: TEXT_COLOR,
    })
    y -= 20

    drawWrappedText(report.mindsetProfile, margin, 11, contentWidth)
    y -= 15
  }

  // Pillar Analysis
  for (const pillar of Object.keys(report.pillars) as Category[]) {
    const pillarData = report.pillars[pillar]
    const color = pillarRgbColors[pillar] || MUTED_COLOR
    const pillarScore = scores[pillar]

    checkPageBreak(100)

    // Pillar header
    page.drawRectangle({
      x: margin,
      y: y - 18,
      width: contentWidth,
      height: 25,
      color,
    })

    page.drawText(`${categories[pillar]?.name || pillar} - ${pillarScore?.toFixed(1) || 'N/A'}`, {
      x: margin + 10,
      y: y - 12,
      size: 13,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    })
    y -= 35

    // Interpretation
    drawWrappedText(pillarData.interpretation, margin, 10, contentWidth)
    y -= 10

    // Strengths
    checkPageBreak(40)
    page.drawText('Strengths:', {
      x: margin,
      y,
      size: 12,
      font: helveticaBold,
      color: SUCCESS_COLOR,
    })
    y -= 16

    for (const strength of pillarData.strengths) {
      checkPageBreak(20)
      page.drawText('•', { x: margin + 5, y, size: 10, font: helvetica, color: SUCCESS_COLOR })
      drawWrappedText(strength, margin + 18, 10, contentWidth - 18)
    }
    y -= 8

    // Improvements
    checkPageBreak(40)
    page.drawText('Growth Areas:', {
      x: margin,
      y,
      size: 12,
      font: helveticaBold,
      color: DANGER_COLOR,
    })
    y -= 16

    for (const improvement of pillarData.improvements) {
      checkPageBreak(20)
      page.drawText('•', { x: margin + 5, y, size: 10, font: helvetica, color: DANGER_COLOR })
      drawWrappedText(improvement, margin + 18, 10, contentWidth - 18)
    }
    y -= 8

    // Recommendations
    checkPageBreak(40)
    page.drawText('Recommendations:', {
      x: margin,
      y,
      size: 12,
      font: helveticaBold,
      color: TEXT_COLOR,
    })
    y -= 16

    pillarData.recommendations.forEach((rec, i) => {
      checkPageBreak(20)
      page.drawText(`${i + 1}.`, { x: margin + 5, y, size: 10, font: helveticaBold, color: TEXT_COLOR })
      drawWrappedText(rec, margin + 22, 10, contentWidth - 22)
    })
    y -= 20
  }

  // Action Plan
  checkPageBreak(80)
  page.drawText("This Week's Action Plan", {
    x: margin,
    y,
    size: 16,
    font: helveticaBold,
    color: TEXT_COLOR,
  })
  y -= 25

  page.drawText(`1. ${report.actionPlan.habit1.title}`, {
    x: margin,
    y,
    size: 12,
    font: helveticaBold,
    color: TEXT_COLOR,
  })
  y -= 16
  drawWrappedText(report.actionPlan.habit1.description, margin + 10, 10, contentWidth - 10)
  y -= 10

  page.drawText(`2. ${report.actionPlan.habit2.title}`, {
    x: margin,
    y,
    size: 12,
    font: helveticaBold,
    color: TEXT_COLOR,
  })
  y -= 16
  drawWrappedText(report.actionPlan.habit2.description, margin + 10, 10, contentWidth - 10)
  y -= 20

  // Reset Script
  checkPageBreak(80)
  page.drawText('Your 5-Second Reset Script', {
    x: margin,
    y,
    size: 16,
    font: helveticaBold,
    color: TEXT_COLOR,
  })
  y -= 25

  const scriptItems = [
    { label: 'Breath:', value: report.resetScript.breath },
    { label: 'Body:', value: report.resetScript.body },
    { label: 'Words:', value: report.resetScript.words },
    { label: 'Task:', value: report.resetScript.task },
  ]

  for (const item of scriptItems) {
    checkPageBreak(20)
    page.drawText(item.label, {
      x: margin,
      y,
      size: 10,
      font: helveticaBold,
      color: TEXT_COLOR,
    })
    page.drawText(item.value, {
      x: margin + 45,
      y,
      size: 10,
      font: helvetica,
      color: TEXT_COLOR,
    })
    y -= 16
  }
  y -= 15

  // Journal Prompts
  checkPageBreak(100)
  page.drawText('7-Day Journal Prompts', {
    x: margin,
    y,
    size: 16,
    font: helveticaBold,
    color: TEXT_COLOR,
  })
  y -= 25

  report.selfCheckPrompts.forEach((prompt, i) => {
    checkPageBreak(30)
    page.drawText(`${i + 1}.`, {
      x: margin,
      y,
      size: 10,
      font: helveticaBold,
      color: TEXT_COLOR,
    })
    drawWrappedText(prompt, margin + 18, 10, contentWidth - 18)
    y -= 5
  })

  // Add page numbers to all pages
  const pages = pdfDoc.getPages()
  pages.forEach((p, i) => {
    p.drawText(`DOTIQ Report - Page ${i + 1} of ${pages.length}`, {
      x: pageWidth / 2 - 50,
      y: 25,
      size: 8,
      font: helvetica,
      color: MUTED_COLOR,
    })
  })

  return pdfDoc.save()
}

export async function POST(request: Request) {
  console.log('[v0] POST /api/report/send-email called')
  
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.log('[v0] Unauthorized - no user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('[v0] User authenticated:', user.id)
    
    const body = await request.json()
    const { assessmentId, email } = body
    
    console.log('[v0] Request body:', { assessmentId, email })
    
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
    
    console.log('[v0] Generating PDF for:', userName, 'Score:', overallScore)
    
    // Generate PDF
    const pdfBytes = await generatePDF(report, scores, overallScore, userName)
    const pdfBuffer = Buffer.from(pdfBytes)
    
    console.log('[v0] PDF generated, size:', pdfBuffer.length, 'bytes')
    
    // Build report URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dotiq.com'
    const reportUrl = `${baseUrl}/report/${assessmentId}`
    
    console.log('[v0] Sending email to:', recipientEmail)
    
    // Send email with PDF attachment
    const emailResult = await sendEmail({
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
    
    console.log('[v0] Email result:', emailResult)
    
    if (!emailResult.success) {
      console.error('[v0] Email failed:', emailResult.error)
      return NextResponse.json({ 
        success: false,
        error: emailResult.error || 'Failed to send email' 
      }, { status: 500 })
    }
    
    // Update report to mark email sent
    await supabase
      .from('reports')
      .update({
        email_sent_at: new Date().toISOString(),
        email_sent_to: recipientEmail,
      })
      .eq('id', reportData.id)
    
    console.log('[v0] Email sent successfully and database updated')
    
    return NextResponse.json({ 
      success: true, 
      message: `Report sent to ${recipientEmail}`,
    })
    
  } catch (error) {
    console.error('[v0] Error in send-email route:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email' 
    }, { status: 500 })
  }
}
