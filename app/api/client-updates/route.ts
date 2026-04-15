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
  hours: number
  date: string
  commit_sha?: string
}

function categorizeCommit(message: string): Commit['category'] {
  const lower = message.toLowerCase()
  if (lower.includes('fix') || lower.includes('bug')) return 'Bug Fix'
  if (lower.includes('style') || lower.includes('ui') || lower.includes('design') || lower.includes('color') || lower.includes('layout')) return 'UI/Style'
  if (lower.includes('refactor') || lower.includes('cleanup') || lower.includes('improve')) return 'Refactor'
  return 'Feature'
}

async function fetchCommitsFromGitHub(): Promise<Commit[]> {
  if (!GITHUB_TOKEN) return []

  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    )

    if (!response.ok) return []

    const data = await response.json()

    const commits: Commit[] = data.map((item: any) => ({
      sha: item.sha.slice(0, 7),
      fullSha: item.sha,
      message: item.commit.message.split('\n')[0],
      author: item.commit.author.name,
      date: item.commit.author.date,
      category: categorizeCommit(item.commit.message),
    }))

    return commits
  } catch {
    return []
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
  if (!cachedCommits.length || now - cacheTimestamp >= CACHE_DURATION) {
    cachedCommits = await fetchCommitsFromGitHub()
    cacheTimestamp = now
  }

  // Get time log from Supabase (always fresh)
  const timeLog = await getTimeLog()
  const totalHours = timeLog.reduce((s, e) => s + Number(e.hours), 0)

  return NextResponse.json({
    commits: cachedCommits,
    timeLog,
    totalHours,
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
    if (action === 'seed') {
      const commits = await fetchCommitsFromGitHub()
      const existingLog = await getTimeLog()
      const existingShas = new Set(existingLog.filter(e => e.commit_sha).map(e => e.commit_sha))

      let added = 0
      for (const commit of commits) {
        if (!existingShas.has(commit.fullSha)) {
          const success = await addTimeEntry({
            id: `commit-${commit.fullSha}`,
            type: 'commit',
            description: commit.message,
            hours: 1,
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
