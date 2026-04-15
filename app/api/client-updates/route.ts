import { NextRequest, NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO_OWNER = 'Humanity-Lbk'
const REPO_NAME = 'DOTIQ'

// Internal password for adding manual time entries
const INTERNAL_PASSWORD = 'dotiq-internal-2026'

// In-memory cache
let cachedCommits: Commit[] = []
let cacheTimestamp = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

// Track which commit SHAs have already been counted for time
const countedCommitShas = new Set<string>()

// Time log entries
export interface TimeEntry {
  id: string
  type: 'commit' | 'manual'
  description: string
  hours: number
  date: string
  commitSha?: string
}

let timeLog: TimeEntry[] = []

interface Commit {
  sha: string
  message: string
  author: string
  date: string
  category: 'Feature' | 'Bug Fix' | 'UI/Style' | 'Refactor'
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
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=50`,
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
      message: item.commit.message.split('\n')[0],
      author: item.commit.author.name,
      date: item.commit.author.date,
      category: categorizeCommit(item.commit.message),
    }))

    // Add 1hr time entry for each new commit we haven't counted yet
    for (const commit of commits) {
      if (!countedCommitShas.has(commit.sha)) {
        countedCommitShas.add(commit.sha)
        timeLog.push({
          id: `commit-${commit.sha}`,
          type: 'commit',
          description: commit.message,
          hours: 1,
          date: commit.date,
          commitSha: commit.sha,
        })
      }
    }

    return commits
  } catch {
    return []
  }
}

export async function GET() {
  const now = Date.now()

  if (cachedCommits.length && now - cacheTimestamp < CACHE_DURATION) {
    return NextResponse.json({ commits: cachedCommits, timeLog, totalHours: timeLog.reduce((s, e) => s + e.hours, 0) })
  }

  const commits = await fetchCommitsFromGitHub()
  cachedCommits = commits
  cacheTimestamp = now

  // Sort timeLog newest first
  timeLog.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return NextResponse.json({
    commits,
    timeLog,
    totalHours: timeLog.reduce((s, e) => s + e.hours, 0),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, description, hours, date } = body

    // Verify internal password
    if (password !== INTERNAL_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    timeLog.unshift(entry)

    return NextResponse.json({
      success: true,
      entry,
      totalHours: timeLog.reduce((s, e) => s + e.hours, 0),
    })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
