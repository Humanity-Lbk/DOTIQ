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
  
  // Handle merge commits - these are system updates
  if (raw.startsWith('merge pull request') || raw.startsWith('merge branch')) {
    return 'System Update'
  }
  
  // Map technical terms to user-friendly titles based on content
  const mappings: Array<{ patterns: RegExp[], title: string }> = [
    // Authentication & Security
    { patterns: [/auth/i, /login/i, /sign.?in/i, /sign.?out/i, /password/i], title: 'Authentication Improvements' },
    { patterns: [/security/i, /rls/i, /permission/i, /access control/i], title: 'Security Enhancements' },
    
    // UI/Visual
    { patterns: [/color/i, /theme/i, /dark mode/i, /light mode/i, /lightness/i], title: 'Visual Theme Update' },
    { patterns: [/text visibility/i, /readability/i, /contrast/i], title: 'Improved Readability' },
    { patterns: [/layout/i, /responsive/i, /mobile/i], title: 'Layout Improvements' },
    { patterns: [/button/i, /click/i, /hover/i, /dropdown/i], title: 'Interface Enhancements' },
    { patterns: [/avatar/i, /profile/i, /user menu/i], title: 'Profile Updates' },
    { patterns: [/header/i, /nav/i, /menu/i, /sidebar/i], title: 'Navigation Updates' },
    
    // Features
    { patterns: [/dashboard/i], title: 'Dashboard Improvements' },
    { patterns: [/video/i, /media/i, /stream/i], title: 'Video Content Updates' },
    { patterns: [/apparel/i, /shop/i, /store/i, /product/i], title: 'Shop Updates' },
    { patterns: [/premium/i, /subscription/i, /upgrade/i], title: 'Premium Features' },
    { patterns: [/program/i, /course/i, /training/i], title: 'Training Program Updates' },
    { patterns: [/assessment/i, /score/i, /evaluation/i], title: 'Assessment Updates' },
    { patterns: [/request/i, /ticket/i, /feedback/i], title: 'Feedback System' },
    { patterns: [/change.?log/i, /time.?log/i, /history/i], title: 'Activity Log Updates' },
    { patterns: [/upload/i, /image/i, /file/i, /attachment/i], title: 'File Handling Improvements' },
    { patterns: [/email/i, /notification/i, /alert/i], title: 'Notification Updates' },
    
    // Technical (mapped to friendly terms)
    { patterns: [/jsx/i, /component/i, /render/i], title: 'Display Fix' },
    { patterns: [/api/i, /endpoint/i, /route/i], title: 'Performance Improvements' },
    { patterns: [/database/i, /table/i, /schema/i, /migration/i], title: 'Data Structure Updates' },
    { patterns: [/title/i, /description/i, /generator/i, /clarity/i], title: 'Content Improvements' },
    { patterns: [/pr description/i, /summary/i], title: 'Documentation Updates' },
  ]
  
  // Find matching pattern
  for (const mapping of mappings) {
    if (mapping.patterns.some(pattern => pattern.test(raw))) {
      return mapping.title
    }
  }
  
  // Fallback based on category
  switch (category) {
    case 'Bug Fix': return 'Bug Fix'
    case 'UI/Style': return 'Interface Update'
    case 'Refactor': return 'Performance Improvement'
    case 'Feature': return 'New Feature'
    default: return 'System Update'
  }
}

function generateUserFriendlyDescription(message: string, category: string): string {
  const raw = message.split('\n')[0].trim().toLowerCase()
  
  // Handle merge commits
  if (raw.startsWith('merge pull request') || raw.startsWith('merge branch')) {
    return 'Applied the latest improvements and bug fixes to keep your experience smooth and up-to-date.'
  }
  
  // Generate contextual descriptions based on content
  const descMappings: Array<{ patterns: RegExp[], desc: string }> = [
    // Authentication
    { patterns: [/auth/i, /login/i, /sign.?in/i], desc: 'Improved the sign-in experience for faster and more secure access.' },
    
    // Visual
    { patterns: [/color/i, /theme/i, /lightness/i], desc: 'Adjusted colors and visual styling for a better viewing experience.' },
    { patterns: [/text visibility/i, /readability/i, /contrast/i], desc: 'Made text easier to read across the application.' },
    { patterns: [/layout/i, /responsive/i], desc: 'Improved how content displays on different screen sizes.' },
    { patterns: [/button/i, /hover/i, /dropdown/i, /click/i], desc: 'Enhanced interactive elements for smoother navigation.' },
    { patterns: [/header/i, /nav/i, /menu/i], desc: 'Updated navigation for easier access to key features.' },
    
    // Features
    { patterns: [/dashboard/i], desc: 'Enhanced your personal dashboard with new insights and features.' },
    { patterns: [/video/i, /media/i], desc: 'Improved video content delivery and playback experience.' },
    { patterns: [/premium/i, /subscription/i], desc: 'Added new premium features and content for members.' },
    { patterns: [/program/i, /training/i], desc: 'Enhanced training programs for better athlete development.' },
    { patterns: [/request/i, /ticket/i, /feedback/i], desc: 'Improved the feedback and support system.' },
    { patterns: [/change.?log/i, /time.?log/i], desc: 'Updated how activity and changes are tracked and displayed.' },
    { patterns: [/upload/i, /image/i, /file/i], desc: 'Improved file upload handling for better reliability.' },
    
    // Technical fixes
    { patterns: [/jsx/i, /component/i, /mismatch/i], desc: 'Fixed a display issue to ensure content renders correctly.' },
    { patterns: [/api/i, /endpoint/i], desc: 'Improved backend performance for faster load times.' },
    { patterns: [/generator/i, /clarity/i, /title/i], desc: 'Improved how updates are described for better clarity.' },
  ]
  
  // Find matching description
  for (const mapping of descMappings) {
    if (mapping.patterns.some(pattern => pattern.test(raw))) {
      return mapping.desc
    }
  }
  
  // Fallback descriptions
  switch (category) {
    case 'Bug Fix': return 'Fixed an issue to improve stability and reliability.'
    case 'UI/Style': return 'Made visual improvements to enhance your experience.'
    case 'Refactor': return 'Optimized performance for a smoother experience.'
    case 'Feature': return 'Added new functionality to improve your workflow.'
    default: return 'Applied updates to keep everything running smoothly.'
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
          let hours = 1 // Default 1 hour for first commit or fallback
          if (i > 0) {
            const prevTime = new Date(sortedCommits[i - 1].date).getTime()
            const currTime = new Date(commit.date).getTime()
            const deltaHours = (currTime - prevTime) / (1000 * 60 * 60)
            // Cap at 3 hours max (avoid overnight gaps)
            hours = Math.min(Math.max(deltaHours, 0.25), 3)
            // Round to nearest 0.25
            hours = Math.round(hours * 4) / 4
          }

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
