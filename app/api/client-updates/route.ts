import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO_OWNER = 'Humanity-Lbk'
const REPO_NAME = 'DOTIQ'

// Internal password for adding manual time entries
const INTERNAL_PASSWORD = 'dotiq-internal-2026'

// Supabase admin client for time_log table
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// In-memory cache for commits only (not time log)
let cachedCommits: Commit[] = []
let cacheTimestamp = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

interface Commit {
  sha: string
  fullSha: string
  message: string
  author: string
  date: string
  category: 'Feature' | 'Bug Fix' | 'UI/Style' | 'Refactor'
}

interface TimeEntry {
  id: string
  type: 'commit' | 'manual'
  description: string
  title: string
  hours: number
  date: string
  commit_sha?: string
}

function generateUserFriendlyTitle(message: string, category: string): string {
  const raw = message.split('\n')[0].trim().toLowerCase()
  
  // Handle merge commits - these are releases
  if (raw.startsWith('merge pull request') || raw.startsWith('merge branch')) {
    const prMatch = raw.match(/#(\d+)/)
    return prMatch ? `Release #${prMatch[1]}` : 'Release Update'
  }
  
  // Highly specific title mappings
  const mappings: Array<{ patterns: RegExp[], title: string }> = [
    // DOTIQ-specific features
    { patterns: [/dotiq.*score/i, /overall.*score/i], title: 'DOTIQ Score Enhancement' },
    { patterns: [/pillar.*order/i], title: 'Pillar Display Order' },
    { patterns: [/discipline/i], title: 'Discipline Pillar Update' },
    { patterns: [/ownership/i], title: 'Ownership Pillar Update' },
    { patterns: [/toughness/i], title: 'Toughness Pillar Update' },
    { patterns: [/sports.?iq/i], title: 'Sports IQ Pillar Update' },
    { patterns: [/verification.*modal/i, /request.*verification/i], title: 'Verification Request System' },
    { patterns: [/coach.*eval|peer.*eval|parent.*eval/i], title: 'Third-Party Evaluations' },
    { patterns: [/report.*generat/i], title: 'AI Report Generation' },
    { patterns: [/full.*report/i], title: 'Full Report Enhancement' },
    { patterns: [/preview.*report/i], title: 'Report Preview Update' },
    { patterns: [/strength|growth.*area/i], title: 'Strengths & Growth Analysis' },
    { patterns: [/action.*item/i], title: 'Action Items Feature' },
    { patterns: [/journal.*prompt/i], title: 'Journal Prompts' },
    { patterns: [/5.?second.*reset/i], title: '5-Second Reset Tool' },
    
    // Assessment flow
    { patterns: [/assessment.*question/i], title: 'Assessment Questions' },
    { patterns: [/quick.?fill/i], title: 'Quick Fill Testing Tool' },
    { patterns: [/assessment.*complet/i], title: 'Assessment Completion Flow' },
    
    // Authentication
    { patterns: [/login.*flow/i, /sign.?in.*flow/i], title: 'Login Experience' },
    { patterns: [/auth.*redirect/i], title: 'Authentication Routing' },
    { patterns: [/session|token/i], title: 'Session Management' },
    
    // Email & PDF
    { patterns: [/email.*pdf/i, /pdf.*email/i], title: 'PDF Email Delivery' },
    { patterns: [/smtp/i], title: 'Email Configuration' },
    { patterns: [/pdf.*generat/i], title: 'PDF Generation' },
    
    // UI/Visual
    { patterns: [/color|theme/i], title: 'Visual Theme' },
    { patterns: [/mobile|responsive/i], title: 'Mobile Experience' },
    { patterns: [/loading|spinner/i], title: 'Loading States' },
    { patterns: [/animation|transition/i], title: 'UI Animations' },
    { patterns: [/modal|dialog/i], title: 'Modal Interactions' },
    { patterns: [/header|navbar/i], title: 'Header & Navigation' },
    { patterns: [/sidebar/i], title: 'Sidebar Navigation' },
    { patterns: [/dashboard/i], title: 'Dashboard' },
    
    // Admin
    { patterns: [/admin.*tool/i, /super.?admin/i], title: 'Admin Tools' },
    { patterns: [/client.*update|change.?log/i], title: 'Change Log System' },
    { patterns: [/import.*github/i], title: 'GitHub Integration' },
    
    // Technical
    { patterns: [/api.*error|error.*handl/i], title: 'Error Handling' },
    { patterns: [/cache|performance/i], title: 'Performance Optimization' },
    { patterns: [/database|query/i], title: 'Database Optimization' },
  ]
  
  // Find matching pattern
  for (const mapping of mappings) {
    if (mapping.patterns.some(pattern => pattern.test(raw))) {
      return mapping.title
    }
  }
  
  // Smarter fallback based on category
  switch (category) {
    case 'Bug Fix': return 'Stability Fix'
    case 'UI/Style': return 'Visual Polish'
    case 'Refactor': return 'Code Optimization'
    case 'Feature': return 'New Capability'
    default: return 'Platform Update'
  }
}

function generateUserFriendlyDescription(message: string, category: string): string {
  const raw = message.split('\n')[0].trim().toLowerCase()
  
  // Handle merge commits - extract PR number/branch info if possible
  if (raw.startsWith('merge pull request') || raw.startsWith('merge branch')) {
    const prMatch = raw.match(/#(\d+)/)
    if (prMatch) {
      return `Merged PR #${prMatch[1]} with improvements and fixes based on testing feedback.`
    }
    return 'Integrated tested changes from the development branch into production.'
  }
  
  // Generate highly specific descriptions based on content
  const descMappings: Array<{ patterns: RegExp[], desc: string }> = [
    // Assessment specific
    { patterns: [/assessment.*score/i, /score.*calculation/i], desc: 'Refined how your DOTIQ score is calculated for more accurate insights.' },
    { patterns: [/assessment.*question/i, /question.*order/i], desc: 'Optimized the assessment question flow for a smoother experience.' },
    { patterns: [/report.*generat/i, /ai.*report/i], desc: 'Enhanced AI-powered report generation for deeper, more personalized analysis.' },
    { patterns: [/pillar/i, /discipline|ownership|toughness|sports.?iq/i], desc: 'Improved how pillar scores are displayed and analyzed in your report.' },
    { patterns: [/verification/i, /coach.*eval/i, /peer.*eval/i], desc: 'Added third-party verification to strengthen report credibility.' },
    
    // Authentication
    { patterns: [/auth.*flow/i, /login.*redirect/i], desc: 'Streamlined the login flow to get you to your dashboard faster.' },
    { patterns: [/session/i, /token/i], desc: 'Improved session handling for more reliable access across devices.' },
    { patterns: [/password/i, /reset/i], desc: 'Enhanced password security and recovery options.' },
    
    // Visual & UI
    { patterns: [/color.*scheme/i, /theme.*update/i], desc: 'Updated the color palette to improve visual clarity and reduce eye strain.' },
    { patterns: [/mobile/i, /responsive/i], desc: 'Improved mobile layout so your experience is consistent on any device.' },
    { patterns: [/loading/i, /spinner/i], desc: 'Added smoother loading transitions throughout the app.' },
    { patterns: [/animation/i, /transition/i], desc: 'Polished micro-animations for a more premium feel.' },
    { patterns: [/modal/i, /dialog/i, /popup/i], desc: 'Refined modal interactions for better usability.' },
    
    // Email & notifications
    { patterns: [/email.*pdf/i, /send.*report/i], desc: 'Improved report email delivery with better PDF formatting.' },
    { patterns: [/smtp/i, /email.*config/i], desc: 'Enhanced email delivery reliability for faster report sharing.' },
    { patterns: [/notification/i], desc: 'Updated notification system to keep you informed of important updates.' },
    
    // Dashboard & navigation
    { patterns: [/dashboard.*stat/i, /metric/i], desc: 'Added new metrics to your dashboard for deeper performance insights.' },
    { patterns: [/sidebar/i, /nav.*menu/i], desc: 'Reorganized navigation for quicker access to key features.' },
    { patterns: [/header/i, /sticky/i], desc: 'Improved header behavior for easier navigation while scrolling.' },
    
    // Data & performance
    { patterns: [/cache/i, /performance/i], desc: 'Optimized data caching for faster page loads.' },
    { patterns: [/database/i, /query/i], desc: 'Improved database queries for snappier response times.' },
    { patterns: [/api.*error/i, /error.*handling/i], desc: 'Enhanced error handling for more graceful recovery from issues.' },
    
    // Admin features
    { patterns: [/admin/i, /super.?admin/i], desc: 'Added admin tools for better platform management.' },
    { patterns: [/quick.?fill/i, /test.*mode/i], desc: 'Added testing tools to accelerate development and QA.' },
    { patterns: [/import.*github/i, /commit/i], desc: 'Improved development tracking and changelog automation.' },
  ]
  
  // Find matching description
  for (const mapping of descMappings) {
    if (mapping.patterns.some(pattern => pattern.test(raw))) {
      return mapping.desc
    }
  }
  
  // More specific fallback descriptions
  switch (category) {
    case 'Bug Fix': return 'Squashed a bug that was affecting app stability or user experience.'
    case 'UI/Style': return 'Polished visual elements for a cleaner, more professional look.'
    case 'Refactor': return 'Restructured code for better performance and maintainability.'
    case 'Feature': return 'Shipped a new capability to enhance your DOTIQ experience.'
    default: return 'Applied behind-the-scenes improvements for better reliability.'
  }
}

function categorizeCommit(message: string): Commit['category'] {
  const lower = message.toLowerCase()
  if (lower.includes('fix') || lower.includes('bug')) return 'Bug Fix'
  if (lower.includes('style') || lower.includes('ui') || lower.includes('design') || lower.includes('color') || lower.includes('layout')) return 'UI/Style'
  if (lower.includes('refactor') || lower.includes('cleanup') || lower.includes('improve')) return 'Refactor'
  return 'Feature'
}

async function fetchCommitsFromGitHub(): Promise<{ commits: Commit[], error?: string }> {
  if (!GITHUB_TOKEN) {
    return { commits: [], error: 'GITHUB_TOKEN not configured' }
  }

  try {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=100`

    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DOTIQ-Client',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { commits: [], error: `GitHub API returned ${response.status}: ${errorText}` }
    }

    const data = await response.json()

    const commits: Commit[] = data.map((item: any) => ({
      sha: item.sha.slice(0, 7),
      fullSha: item.sha,
      message: item.commit.message.split('\n')[0],
      author: item.commit.author.name,
      date: item.commit.author.date,
      category: categorizeCommit(item.commit.message),
    }))

    return { commits }
  } catch (err) {
    return { commits: [], error: `Exception: ${String(err)}` }
  }
}

async function getTimeLog(): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .from('time_log')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching time log:', error)
    return []
  }

  return data || []
}

async function addTimeEntry(entry: TimeEntry): Promise<boolean> {
  const { error } = await supabase
    .from('time_log')
    .upsert({
      id: entry.id,
      type: entry.type,
      title: entry.title,
      description: entry.description,
      hours: entry.hours,
      date: entry.date,
      commit_sha: entry.commit_sha || null,
    }, { onConflict: 'id' })

  if (error) {
    console.error('Error adding time entry:', error)
    return false
  }
  return true
}

export async function GET() {
  const now = Date.now()

  // Get commits (cached)
  let githubError: string | undefined
  if (!cachedCommits.length || now - cacheTimestamp >= CACHE_DURATION) {
    const result = await fetchCommitsFromGitHub()
    cachedCommits = result.commits
    githubError = result.error
    cacheTimestamp = now
  }

  // Get time log from Supabase (always fresh)
  const timeLog = await getTimeLog()
  const totalHours = timeLog.reduce((s, e) => s + Number(e.hours), 0)

  return NextResponse.json({
    commits: cachedCommits,
    timeLog,
    totalHours,
    githubError,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, password, description, hours, date } = body

    // Verify internal password
    if (password !== INTERNAL_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SEED: Bulk add all existing GitHub commits as time entries
    // Time is calculated as delta between consecutive commits, capped at 3 hours max
    if (action === 'seed') {
      const result = await fetchCommitsFromGitHub()
      if (result.error) {
        return NextResponse.json({ error: result.error, added: 0, totalHours: 0 }, { status: 500 })
      }
      const commits = result.commits
      const existingLog = await getTimeLog()
      const existingShas = new Set(existingLog.filter(e => e.commit_sha).map(e => e.commit_sha))

      // Sort commits by date ascending (oldest first) for delta calculation
      const sortedCommits = [...commits].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      let added = 0
      for (let i = 0; i < sortedCommits.length; i++) {
        const commit = sortedCommits[i]
        if (!existingShas.has(commit.fullSha)) {
          // Calculate hours based on delta from previous commit
          // Much more conservative: typical commits take 5-30 minutes
          let hours = 0.25 // Default 15 min for first commit
          if (i > 0) {
            const prevTime = new Date(sortedCommits[i - 1].date).getTime()
            const currTime = new Date(commit.date).getTime()
            const deltaMinutes = (currTime - prevTime) / (1000 * 60)
            
            // More realistic time estimation:
            // - < 5 min between commits = 0.1 hr (quick fix)
            // - 5-15 min = 0.25 hr 
            // - 15-45 min = 0.5 hr
            // - 45+ min = cap at 0.75 hr max (longer gaps are likely breaks)
            if (deltaMinutes < 5) {
              hours = 0.1
            } else if (deltaMinutes < 15) {
              hours = 0.25
            } else if (deltaMinutes < 45) {
              hours = 0.5
            } else {
              hours = 0.75 // Cap - longer gaps are breaks, not work
            }
          }

          // Round to nearest 0.05
          hours = Math.round(hours * 20) / 20

          const success = await addTimeEntry({
            id: `commit-${commit.fullSha}`,
            type: 'commit',
            title: generateUserFriendlyTitle(commit.message, commit.category),
            description: generateUserFriendlyDescription(commit.message, commit.category),
            hours,
            date: commit.date,
            commit_sha: commit.fullSha,
          })
          if (success) added++
        }
      }

      const timeLog = await getTimeLog()
      const totalHours = timeLog.reduce((s, e) => s + Number(e.hours), 0)

      return NextResponse.json({
        success: true,
        message: `Seeded ${added} new commits as time entries`,
        added,
        totalHours,
      })
    }

    // MANUAL: Add a manual time entry
    if (action === 'manual' || !action) {
      if (!description || typeof hours !== 'number' || hours <= 0) {
        return NextResponse.json({ error: 'Invalid entry' }, { status: 400 })
      }

      const entry: TimeEntry = {
        id: `manual-${Date.now()}`,
        type: 'manual',
        description,
        hours,
        date: date || new Date().toISOString(),
      }

      const success = await addTimeEntry(entry)
      if (!success) {
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
      }

      const timeLog = await getTimeLog()
      const totalHours = timeLog.reduce((s, e) => s + Number(e.hours), 0)

      return NextResponse.json({
        success: true,
        entry,
        totalHours,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
