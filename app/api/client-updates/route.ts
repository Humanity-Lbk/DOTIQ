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

function generateUserFriendlyTitle(message: string): string {
  let title = message.split('\n')[0].trim()
  
  // Remove common commit prefixes (feat:, fix:, chore:, etc.)
  title = title.replace(/^(feat|fix|chore|docs|style|refactor|test|perf|ci|build):\s*/i, '')
  
  // Remove common technical jargon and make it readable
  title = title
    .replace(/UI\s*\/\s*[Ss]tyle/, 'Interface')
    .replace(/bug\s*[Ff]ix/i, 'Fixed')
    .replace(/implement/i, 'Added')
    .replace(/update/i, 'Updated')
    .replace(/enhance/i, 'Improved')
    .replace(/refactor/i, 'Optimized')
    .replace(/add\s+support\s+for/i, 'Added support for')
  
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1)
  
  // Limit to 60 characters for readability
  if (title.length > 60) {
    title = title.substring(0, 57) + '...'
  }
  
  return title
}

function generateUserFriendlyDescription(message: string, category: string): string {
  const lines = message.split('\n').filter(l => l.trim())
  let title = generateUserFriendlyTitle(message)
  
  // Try to get description from commit body (lines after first line)
  let description = lines.slice(1).join(' ').trim()
  
  // If no body, generate based on category and title
  if (!description) {
    switch (category) {
      case 'Bug Fix':
        return `Fixed an issue: ${title}`
      case 'UI/Style':
        return `Updated the interface and visual design. ${title}`
      case 'Refactor':
        return `Improved performance and code quality. ${title}`
      case 'Feature':
        return `Added new functionality. ${title}`
      default:
        return `Development update: ${title}`
    }
  }
  
  // Clean up description
  description = description
    .replace(/feat:/i, '')
    .replace(/fix:/i, '')
    .replace(/\s+/g, ' ')
    .trim()
  
  // Limit description to 200 characters
  if (description.length > 200) {
    description = description.substring(0, 197) + '...'
  }
  
  return description
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
            title: generateUserFriendlyTitle(commit.message),
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
