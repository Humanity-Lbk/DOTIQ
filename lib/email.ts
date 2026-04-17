// SMTP2Go email service
// Uses SMTP2GO_API_KEY from environment variables
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
  
  // SMTP2Go API key format: api-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (36 chars total)
  // Try multiple env var names that might contain the SMTP2Go key
  const apiKey = process.env.SMTP2GO_API_KEY || process.env.EMAIL_API_KEY
  const fromEmail = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_FROM_EMAIL

  console.log('[v0] Checking for API key in SMTP2GO_API_KEY:', !!process.env.SMTP2GO_API_KEY)
  console.log('[v0] Checking for API key in EMAIL_API_KEY:', !!process.env.EMAIL_API_KEY)
  console.log('[v0] API key length:', apiKey?.length)
  console.log('[v0] API key prefix:', apiKey?.substring(0, 8))

  if (!apiKey) {
    console.error('[v0] No SMTP2Go API key found in SMTP2GO_API_KEY or EMAIL_API_KEY')
    return { success: false, error: 'Email service not configured - missing SMTP2GO_API_KEY or EMAIL_API_KEY' }
  }
  
  // Validate API key format
  if (!apiKey.startsWith('api-') || apiKey.length !== 36) {
    console.error('[v0] Invalid API key format. Expected: api-XXXXXXXX... (36 chars), Got:', apiKey.substring(0, 10), '... length:', apiKey.length)
    return { success: false, error: `Invalid SMTP2Go API key format. Key should start with "api-" and be 36 characters long.` }
  }

  if (!fromEmail) {
    console.error('[v0] EMAIL_FROM_ADDRESS not configured')
    return { success: false, error: 'Email service not configured - missing EMAIL_FROM_ADDRESS' }
  }

  try {
    console.log('[v0] Preparing email via SMTP2Go API')
    
    // Convert attachments to base64 for SMTP2Go (fileblob format)
    const apiAttachments = attachments?.map((attachment) => {
      const content = typeof attachment.content === 'string' 
        ? attachment.content 
        : attachment.content.toString('base64')
      
      return {
        filename: attachment.filename,
        mimetype: attachment.contentType || 'application/octet-stream',
        fileblob: content,
      }
    })

    // SMTP2Go expects api_key in the request body, not as a header
    // Format must be: api[A-Za-z0-9-]{32}
    const payload = {
      api_key: apiKey,
      to: [to],
      sender: `DOTIQ Reports <${fromEmail}>`,
      subject,
      html_body: html,
      attachments: apiAttachments,
      fastaccept: true, // SMTP2Go recommends this for faster sending
    }

    const apiUrl = 'https://api.smtp2go.com/v3/email/send'
    console.log('[v0] Sending via SMTP2Go API to:', to)
    console.log('[v0] API key format check - starts with "api":', apiKey?.startsWith('api'))

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    // Get response text first to handle non-JSON responses
    const responseText = await response.text()
    console.log('[v0] SMTP2Go response status:', response.status)
    console.log('[v0] SMTP2Go raw response:', responseText.substring(0, 500))
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      console.error('[v0] SMTP2Go returned non-JSON response:', responseText)
      return { 
        success: false, 
        error: `Email API error: ${responseText.substring(0, 100)}` 
      }
    }

    // SMTP2Go returns request_id on success, and error/errors on failure
    // Even with HTTP 200, check if there's an error in the response
    if (data.error || data.errors || (data.data && data.data.error)) {
      const errorMsg = data.error || data.errors?.[0] || data.data?.error || 'Unknown error'
      console.error('[v0] SMTP2Go API error:', errorMsg)
      return { 
        success: false, 
        error: `Email API error: ${errorMsg}` 
      }
    }

    // Check for HTTP-level errors too
    if (!response.ok) {
      console.error('[v0] SMTP2Go HTTP error - Status:', response.status)
      console.error('[v0] SMTP2Go response:', data)
      return { 
        success: false, 
        error: `Email API error: HTTP ${response.status}` 
      }
    }

    // SMTP2Go returns request_id on success
    const requestId = data.request_id
    console.log('[v0] Email sent successfully! Request ID:', requestId)
    return { success: true, messageId: requestId }
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
