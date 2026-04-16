import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.smtp2go.com',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export async function sendEmail({ to, subject, html, attachments }: SendEmailOptions) {
  console.log('[v0] sendEmail called for:', to)
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error('[v0] SMTP credentials not configured')
    return { success: false, error: 'Email service not configured - missing SMTP credentials' }
  }
  
  if (!process.env.SMTP_FROM_EMAIL) {
    console.error('[v0] SMTP_FROM_EMAIL not configured')
    return { success: false, error: 'Email service not configured - missing SMTP_FROM_EMAIL' }
  }

  try {
    const fromEmail = process.env.SMTP_FROM_EMAIL
    
    console.log('[v0] SMTP Config:', {
      host: process.env.SMTP_HOST || 'mail.smtp2go.com',
      port: process.env.SMTP_PORT || '2525',
      user: process.env.SMTP_USER ? 'SET' : 'MISSING',
      pass: process.env.SMTP_PASSWORD ? 'SET' : 'MISSING',
      from: fromEmail,
    })
    
    console.log('[v0] Attempting to send email to:', to, 'from:', fromEmail)
    
    const info = await transporter.sendMail({
      from: `"DOTIQ Reports" <${fromEmail}>`,
      to,
      subject,
      html,
      attachments,
    })

    console.log('[v0] Email sent successfully! MessageId:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('[v0] Failed to send email:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}

export function generateReportEmailHtml(userName: string, score: number, reportUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your DOTIQ Report</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border-radius: 16px 16px 0 0; border: 1px solid #333; border-bottom: none;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td>
                    <div style="width: 40px; height: 40px; background: #f5a623; border-radius: 10px; display: inline-block; text-align: center; line-height: 40px; font-weight: 900; font-size: 18px; color: #000;">D</div>
                    <span style="color: #fff; font-weight: 700; font-size: 20px; margin-left: 12px; vertical-align: middle;">DOTIQ</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px; background-color: #141414; border: 1px solid #333; border-top: none; border-bottom: none;">
              <h1 style="margin: 0 0 20px 0; color: #ffffff; font-size: 28px; font-weight: 800;">
                Your Full Report is Ready!
              </h1>
              
              <p style="margin: 0 0 30px 0; color: #a0a0a0; font-size: 16px; line-height: 1.6;">
                Hi ${userName},
              </p>
              
              <p style="margin: 0 0 30px 0; color: #a0a0a0; font-size: 16px; line-height: 1.6;">
                Thank you for purchasing your DOTIQ Assessment Report. Your personalized analysis is now available.
              </p>
              
              <!-- Score Box -->
              <table role="presentation" style="width: 100%; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 30px; background: linear-gradient(135deg, rgba(245, 166, 35, 0.1) 0%, rgba(245, 166, 35, 0.05) 100%); border: 1px solid rgba(245, 166, 35, 0.3); border-radius: 12px; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #f5a623; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your DOTIQ Score</p>
                    <p style="margin: 0; color: #ffffff; font-size: 48px; font-weight: 900;">${score.toFixed(1)}</p>
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">out of 10</p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 30px 0; color: #a0a0a0; font-size: 16px; line-height: 1.6;">
                Your report includes:
              </p>
              
              <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #a0a0a0; font-size: 15px; line-height: 2;">
                <li>Detailed analysis of all 4 DOTIQ pillars</li>
                <li>Your unique strengths and growth areas</li>
                <li>Personalized action plan for this week</li>
                <li>Your 5-second mental reset script</li>
                <li>7-day journal prompts</li>
                <li>Coach talking points</li>
              </ul>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td align="center" style="padding: 10px 0 30px 0;">
                    <a href="${reportUrl}" style="display: inline-block; padding: 16px 40px; background-color: #f5a623; color: #000000; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 10px;">
                      View Your Full Report
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
                A PDF version of your report is attached to this email for your records.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #0f0f0f; border-radius: 0 0 16px 16px; border: 1px solid #333; border-top: none;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 13px; text-align: center;">
                Discipline · Ownership · Toughness · IQ
              </p>
              <p style="margin: 0; color: #444; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} DOTIQ. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
