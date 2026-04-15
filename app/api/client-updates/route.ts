import { NextRequest, NextResponse } from 'next/server'

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
}

interface CachedData {
  commits: ProcessedCommit[]
  lastSync: string
  cachedAt: number
}

interface ProcessedCommit {
  sha: string
  message: string
  date: string
  author: string
  type: 'feat' | 'fix' | 'style' | 'refactor' | 'other'
}

// In-memory cache (persists between requests in the same serverless instance)
let cache: CachedData | null = null
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

function getCommitType(message: string): ProcessedCommit['type'] {
  const lower = message.toLowerCase()
  if (lower.startsWith('feat') || lower.includes('add') || lower.includes('implement') || lower.includes('create')) return 'feat'
  if (lower.startsWith('fix') || lower.includes('bug') || lower.includes('correct') || lower.includes('resolve')) return 'fix'
  if (lower.startsWith('style') || lower.includes('ui') || lower.includes('design') || lower.includes('color') || lower.includes('layout')) return 'style'
  if (lower.startsWith('refactor') || lower.includes('refactor') || lower.includes('clean') || lower.includes('optimize')) return 'refactor'
  return 'other'
}

async function fetchCommitsFromGitHub(): Promise<ProcessedCommit[]> {
  const owner = 'Humanity-Lbk'
  const repo = 'DOTIQ'
  
  try {
    // Fetch last 50 commits
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DOTIQ-Updates',
          // Add GitHub token if available for higher rate limits
          ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!response.ok) {
      console.error('GitHub API error:', response.status, response.statusText)
      return []
    }

    const commits: GitHubCommit[] = await response.json()
    
    return commits.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message.split('\n')[0], // First line only
      date: commit.commit.author.date,
      author: commit.commit.author.name,
      type: getCommitType(commit.commit.message)
    }))
  } catch (error) {
    console.error('Failed to fetch GitHub commits:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  const forceRefresh = request.nextUrl.searchParams.get('refresh') === 'true'
  const now = Date.now()

  // Check if cache is valid
  if (!forceRefresh && cache && (now - cache.cachedAt) < CACHE_DURATION) {
    return NextResponse.json({
      commits: cache.commits,
      lastSync: cache.lastSync,
      nextSync: new Date(cache.cachedAt + CACHE_DURATION).toISOString(),
      cached: true
    })
  }

  // Fetch fresh data
  const commits = await fetchCommitsFromGitHub()
  const lastSync = new Date().toISOString()

  // Update cache
  cache = {
    commits,
    lastSync,
    cachedAt: now
  }

  return NextResponse.json({
    commits,
    lastSync,
    nextSync: new Date(now + CACHE_DURATION).toISOString(),
    cached: false
  })
}
