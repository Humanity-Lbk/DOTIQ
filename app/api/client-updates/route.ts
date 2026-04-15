import { NextRequest, NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO_OWNER = 'Humanity-Lbk'
const REPO_NAME = 'DOTIQ'

// In-memory cache
let cachedCommits: any = null
let cacheTimestamp = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

interface Commit {
  sha: string
  message: string
  author: string
  date: string
  category: 'Feature' | 'Bug Fix' | 'UI/Style' | 'Refactor'
}

function categorizeCommit(message: string): Commit['category'] {
  const lowercased = message.toLowerCase()
  
  if (lowercased.includes('fix') || lowercased.includes('bug')) {
    return 'Bug Fix'
  }
  if (
    lowercased.includes('style') ||
    lowercased.includes('ui') ||
    lowercased.includes('design') ||
    lowercased.includes('color') ||
    lowercased.includes('layout')
  ) {
    return 'UI/Style'
  }
  if (
    lowercased.includes('refactor') ||
    lowercased.includes('cleanup') ||
    lowercased.includes('improve')
  ) {
    return 'Refactor'
  }
  
  // Default to Feature for new additions
  return 'Feature'
}

async function fetchCommitsFromGitHub() {
  if (!GITHUB_TOKEN) {
    return []
  }

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

    if (!response.ok) {
      console.error('GitHub API error:', response.status, response.statusText)
      return []
    }

    const data = await response.json()

    const commits: Commit[] = data.map((commit: any) => ({
      sha: commit.sha.slice(0, 7),
      message: commit.commit.message.split('\n')[0], // First line only
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      category: categorizeCommit(commit.commit.message),
    }))

    return commits
  } catch (error) {
    console.error('Failed to fetch commits from GitHub:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  const now = Date.now()
  
  // Check if cache is still valid
  if (cachedCommits && now - cacheTimestamp < CACHE_DURATION) {
    return NextResponse.json({ commits: cachedCommits })
  }

  // Fetch fresh data
  const commits = await fetchCommitsFromGitHub()
  cachedCommits = commits
  cacheTimestamp = now

  return NextResponse.json({ commits })
}
