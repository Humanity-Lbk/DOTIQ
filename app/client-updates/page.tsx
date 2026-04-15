'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Commit {
  sha: string
  message: string
  author: string
  date: string
  category: 'Feature' | 'Bug Fix' | 'UI/Style' | 'Refactor'
}

export default function ClientUpdatesPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [commits, setCommits] = useState<Commit[]>([])
  const [loading, setLoading] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [stats, setStats] = useState({ feature: 0, bugFix: 0, style: 0, refactor: 0 })

  // Check authentication on mount
  useEffect(() => {
    const auth = localStorage.getItem('clientUpdatesAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchCommits()
    }
  }, [])

  // Fetch commits from API
  async function fetchCommits() {
    setLoading(true)
    try {
      const response = await fetch('/api/client-updates')
      const data = await response.json()
      setCommits(data.commits || [])
      setLastSync(new Date())
      
      // Calculate stats
      const newStats = { feature: 0, bugFix: 0, style: 0, refactor: 0 }
      data.commits?.forEach((commit: Commit) => {
        if (commit.category === 'Feature') newStats.feature++
        else if (commit.category === 'Bug Fix') newStats.bugFix++
        else if (commit.category === 'UI/Style') newStats.style++
        else if (commit.category === 'Refactor') newStats.refactor++
      })
      setStats(newStats)
    } catch (error) {
      console.error('Failed to fetch commits:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')

    // Hardcoded credentials
    if (email === 'updates@dotiq.com' && password === 'progress') {
      localStorage.setItem('clientUpdatesAuth', 'true')
      setIsAuthenticated(true)
      setEmail('')
      setPassword('')
      fetchCommits()
    } else {
      setLoginError('Invalid email or password')
      setPassword('')
    }
  }

  function handleLogout() {
    localStorage.removeItem('clientUpdatesAuth')
    setIsAuthenticated(false)
    setCommits([])
    setEmail('')
    setPassword('')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black">DOTIQ Progress</h1>
              <p className="text-muted-foreground">Client Updates Portal</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="updates@dotiq.com"
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              {loginError && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:scale-105 transition-transform"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">DOTIQ Progress</h1>
            <p className="text-xs text-muted-foreground font-mono mt-1">CLIENT_UPDATES_PORTAL</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-3xl font-black text-neon-gold">{stats.feature}</div>
            <p className="text-xs text-muted-foreground mt-2 font-mono">FEATURES</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-3xl font-black text-neon-lime">{stats.bugFix}</div>
            <p className="text-xs text-muted-foreground mt-2 font-mono">BUG FIXES</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-3xl font-black text-neon-pink">{stats.style}</div>
            <p className="text-xs text-muted-foreground mt-2 font-mono">UI/STYLE</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-3xl font-black text-neon-cyan">{stats.refactor}</div>
            <p className="text-xs text-muted-foreground mt-2 font-mono">REFACTOR</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold">Recent Changes</h2>
            {lastSync && (
              <p className="text-xs text-muted-foreground mt-1">
                Last synced: {lastSync.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={fetchCommits}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? 'Syncing...' : 'Refresh'}
          </button>
        </div>

        {/* Commits List */}
        <div className="space-y-3">
          {commits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No commits found. Check back soon!
            </div>
          ) : (
            commits.map((commit) => (
              <div
                key={commit.sha}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{commit.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">by {commit.author}</p>
                  </div>
                  <span
                    className={`text-xs font-mono px-2 py-1 rounded-full whitespace-nowrap ml-4 ${
                      commit.category === 'Feature'
                        ? 'bg-neon-gold/10 text-neon-gold'
                        : commit.category === 'Bug Fix'
                        ? 'bg-neon-lime/10 text-neon-lime'
                        : commit.category === 'UI/Style'
                        ? 'bg-neon-pink/10 text-neon-pink'
                        : 'bg-neon-cyan/10 text-neon-cyan'
                    }`}
                  >
                    {commit.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {new Date(commit.date).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
