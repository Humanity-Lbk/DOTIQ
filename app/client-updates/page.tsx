'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Lock, LogOut, GitCommit, Clock, RefreshCw, CheckCircle2, Code, Palette, Bug, Sparkles } from 'lucide-react'

interface Commit {
  sha: string
  message: string
  date: string
  author: string
  type: 'feat' | 'fix' | 'style' | 'refactor' | 'other'
}

interface UpdatesData {
  commits: Commit[]
  lastSync: string
  nextSync: string
}

const CLIENT_EMAIL = 'updates@dotiq.com'
const CLIENT_PASSWORD = 'progress'

function getCommitType(message: string): Commit['type'] {
  const lower = message.toLowerCase()
  if (lower.startsWith('feat') || lower.includes('add') || lower.includes('implement')) return 'feat'
  if (lower.startsWith('fix') || lower.includes('bug') || lower.includes('correct')) return 'fix'
  if (lower.startsWith('style') || lower.includes('ui') || lower.includes('design') || lower.includes('color')) return 'style'
  if (lower.startsWith('refactor') || lower.includes('refactor') || lower.includes('clean')) return 'refactor'
  return 'other'
}

function CommitIcon({ type }: { type: Commit['type'] }) {
  switch (type) {
    case 'feat': return <Sparkles className="w-4 h-4 text-neon-lime" />
    case 'fix': return <Bug className="w-4 h-4 text-neon-pink" />
    case 'style': return <Palette className="w-4 h-4 text-neon-cyan" />
    case 'refactor': return <Code className="w-4 h-4 text-neon-gold" />
    default: return <GitCommit className="w-4 h-4 text-muted-foreground" />
  }
}

function CommitBadge({ type }: { type: Commit['type'] }) {
  const styles = {
    feat: 'bg-[var(--neon-lime)]/10 text-neon-lime border-[var(--neon-lime)]/30',
    fix: 'bg-[var(--neon-pink)]/10 text-neon-pink border-[var(--neon-pink)]/30',
    style: 'bg-[var(--neon-cyan)]/10 text-neon-cyan border-[var(--neon-cyan)]/30',
    refactor: 'bg-[var(--neon-gold)]/10 text-neon-gold border-[var(--neon-gold)]/30',
    other: 'bg-muted text-muted-foreground border-border',
  }
  const labels = {
    feat: 'FEATURE',
    fix: 'BUG FIX',
    style: 'UI/STYLE',
    refactor: 'REFACTOR',
    other: 'UPDATE',
  }
  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${styles[type]}`}>
      {labels[type]}
    </span>
  )
}

export default function ClientUpdatesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [updates, setUpdates] = useState<UpdatesData | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Check if already authenticated
  useEffect(() => {
    const auth = localStorage.getItem('dotiq_client_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  // Fetch updates when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUpdates()
    }
  }, [isAuthenticated])

  const fetchUpdates = async (forceRefresh = false) => {
    setRefreshing(true)
    try {
      const url = forceRefresh ? '/api/client-updates?refresh=true' : '/api/client-updates'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setUpdates(data)
      }
    } catch (err) {
      console.error('Failed to fetch updates:', err)
    }
    setRefreshing(false)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (email === CLIENT_EMAIL && password === CLIENT_PASSWORD) {
      localStorage.setItem('dotiq_client_auth', 'true')
      setIsAuthenticated(true)
    } else {
      setError('Invalid credentials')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('dotiq_client_auth')
    setIsAuthenticated(false)
    setUpdates(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background grid-subtle flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image
              src="/logo.png"
              alt="DOTIQ"
              width={120}
              height={40}
              className="h-10 w-auto mx-auto invert brightness-0 mb-6"
            />
            <p className="font-mono text-xs text-primary mb-2">{'>>'} CLIENT_ACCESS_PORTAL</p>
            <h1 className="text-2xl font-bold">Project Updates</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Sign in to view development progress
            </p>
          </div>

          <form onSubmit={handleLogin} className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Access Updates
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            This portal is for authorized clients only.
          </p>
        </div>
      </div>
    )
  }

  // Updates Dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="DOTIQ"
              width={100}
              height={32}
              className="h-8 w-auto invert brightness-0"
            />
            <span className="font-mono text-xs text-primary hidden sm:inline">{'>>'} PROJECT_UPDATES</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchUpdates(true)}
              disabled={refreshing}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              title="Force refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Development Progress</h1>
          <p className="text-muted-foreground">
            Real-time updates on the DOTIQ platform development.
          </p>
          {updates && (
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Last sync: {new Date(updates.lastSync).toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                {updates.commits.length} updates
              </span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {updates && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {(['feat', 'fix', 'style', 'refactor'] as const).map((type) => {
              const count = updates.commits.filter(c => c.type === type).length
              const labels = { feat: 'Features', fix: 'Bug Fixes', style: 'UI Updates', refactor: 'Refactors' }
              return (
                <div key={type} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CommitIcon type={type} />
                    <span className="text-sm text-muted-foreground">{labels[type]}</span>
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Commits List */}
        {updates ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold mb-4">Recent Changes</h2>
            {updates.commits.map((commit) => (
              <div
                key={commit.sha}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CommitIcon type={commit.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <CommitBadge type={commit.type} />
                      <span className="text-xs text-muted-foreground font-mono">
                        {commit.sha.slice(0, 7)}
                      </span>
                    </div>
                    <p className="font-medium text-sm leading-relaxed">{commit.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{commit.author}</span>
                      <span>•</span>
                      <span>{new Date(commit.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
            <p>Loading updates...</p>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
          <p>Updates sync automatically every hour. Click refresh for latest changes.</p>
        </div>
      </main>
    </div>
  )
}
