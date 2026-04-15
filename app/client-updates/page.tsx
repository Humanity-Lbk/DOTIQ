'use client'

import { useState, useEffect } from 'react'

interface Commit {
  sha: string
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
  commitSha?: string
}

// Two roles: 'client' (read-only) and 'internal' (can add time)
type Role = 'client' | 'internal'

const CREDENTIALS: Record<string, { password: string; role: Role }> = {
  'updates@dotiq.com': { password: 'progress', role: 'client' },
  'internal@dotiq.com': { password: 'dotiq-internal-2026', role: 'internal' },
}

const CATEGORY_STYLES = {
  Feature:  { bg: 'bg-[var(--neon-gold)]/10',  text: 'text-neon-gold' },
  'Bug Fix':{ bg: 'bg-[var(--neon-lime)]/10',  text: 'text-neon-lime' },
  'UI/Style':{ bg: 'bg-[var(--neon-pink)]/10', text: 'text-neon-pink' },
  Refactor: { bg: 'bg-[var(--neon-cyan)]/10',  text: 'text-neon-cyan' },
}

export default function ClientUpdatesPage() {
  const [role, setRole] = useState<Role | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [commits, setCommits] = useState<Commit[]>([])
  const [timeLog, setTimeLog] = useState<TimeEntry[]>([])
  const [totalHours, setTotalHours] = useState(0)
  const [loading, setLoading] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // Manual entry state (internal only)
  const [manualDesc, setManualDesc] = useState('')
  const [manualHours, setManualHours] = useState('')
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10))
  const [manualError, setManualError] = useState('')
  const [manualSuccess, setManualSuccess] = useState(false)
  const [manualLoading, setManualLoading] = useState(false)

  // Seed state (internal only)
  const [seedLoading, setSeedLoading] = useState(false)
  const [seedResult, setSeedResult] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'commits' | 'timelog'>('commits')
  const [stats, setStats] = useState({ feature: 0, bugFix: 0, style: 0, refactor: 0 })

  useEffect(() => {
    const stored = localStorage.getItem('clientUpdatesRole') as Role | null
    if (stored) {
      setRole(stored)
      fetchData()
    }
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch('/api/client-updates')
      const data = await res.json()
      setCommits(data.commits || [])
      setTimeLog(data.timeLog || [])
      setTotalHours(data.totalHours || 0)
      setLastSync(new Date())

      const s = { feature: 0, bugFix: 0, style: 0, refactor: 0 }
      data.commits?.forEach((c: Commit) => {
        if (c.category === 'Feature') s.feature++
        else if (c.category === 'Bug Fix') s.bugFix++
        else if (c.category === 'UI/Style') s.style++
        else if (c.category === 'Refactor') s.refactor++
      })
      setStats(s)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    const cred = CREDENTIALS[email]
    if (cred && cred.password === password) {
      localStorage.setItem('clientUpdatesRole', cred.role)
      setRole(cred.role)
      setEmail('')
      setPassword('')
      fetchData()
    } else {
      setLoginError('Invalid email or password.')
      setPassword('')
    }
  }

  function handleLogout() {
    localStorage.removeItem('clientUpdatesRole')
    setRole(null)
    setCommits([])
    setTimeLog([])
    setTotalHours(0)
  }

  async function handleSeedFromGitHub() {
    setSeedLoading(true)
    setSeedResult(null)
    try {
      const res = await fetch('/api/client-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'seed',
          password: 'dotiq-internal-2026',
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSeedResult(`Seeded ${data.added} new commits. Total: ${data.totalHours.toFixed(1)} hrs`)
        await fetchData()
      } else {
        setSeedResult(data.error || 'Failed to seed')
      }
    } catch {
      setSeedResult('Network error')
    } finally {
      setSeedLoading(false)
      setTimeout(() => setSeedResult(null), 5000)
    }
  }

  async function handleManualEntry(e: React.FormEvent) {
    e.preventDefault()
    setManualError('')
    setManualSuccess(false)

    const hrs = parseFloat(manualHours)
    if (!manualDesc.trim() || isNaN(hrs) || hrs <= 0) {
      setManualError('Please provide a valid description and hours.')
      return
    }

    setManualLoading(true)
    try {
      const res = await fetch('/api/client-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: 'dotiq-internal-2026',
          description: manualDesc.trim(),
          hours: hrs,
          date: new Date(manualDate).toISOString(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setManualError(data.error || 'Failed to add entry.')
      } else {
        setManualSuccess(true)
        setManualDesc('')
        setManualHours('')
        setManualDate(new Date().toISOString().slice(0, 10))
        // Refresh data to show new entry and updated total
        await fetchData()
        setTimeout(() => setManualSuccess(false), 3000)
      }
    } catch {
      setManualError('Network error. Try again.')
    } finally {
      setManualLoading(false)
    }
  }

  // ---------- LOGIN ----------
  if (!role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-1">
            <div className="font-mono text-[10px] text-muted-foreground tracking-widest mb-4">DOTIQ</div>
            <h1 className="text-3xl font-black">Progress Portal</h1>
            <p className="text-sm text-muted-foreground">Client updates &amp; development log</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold font-mono text-muted-foreground">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold font-mono text-muted-foreground">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                required
              />
            </div>

            {loginError && (
              <p className="text-sm text-destructive">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 animate-shimmer-sweep text-primary-foreground font-bold rounded-lg transition-transform hover:scale-[1.02] text-sm"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ---------- DASHBOARD ----------
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-black leading-none">DOTIQ Progress</h1>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                {role === 'internal' ? 'INTERNAL VIEW' : 'CLIENT VIEW'}
                {lastSync && ` · Synced ${lastSync.toLocaleTimeString()}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
          >
            SIGN OUT
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Total Hours Banner */}
        <div className="relative bg-card border border-primary/30 rounded-2xl p-8 overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] text-muted-foreground tracking-widest mb-1">TOTAL DEVELOPMENT TIME</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-neon-gold">{totalHours.toFixed(1)}</span>
                <span className="text-xl text-muted-foreground font-semibold">hrs</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {commits.length} commits · {timeLog.filter(e => e.type === 'manual').length} manual entries
              </p>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="self-start sm:self-auto px-4 py-2 bg-muted border border-border rounded-lg text-xs font-mono hover:border-primary/50 transition-colors disabled:opacity-50"
            >
              {loading ? 'SYNCING...' : 'SYNC NOW'}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'FEATURES',  value: stats.feature,  cls: 'text-neon-gold' },
            { label: 'BUG FIXES', value: stats.bugFix,   cls: 'text-neon-lime' },
            { label: 'UI / STYLE',value: stats.style,    cls: 'text-neon-pink' },
            { label: 'REFACTOR',  value: stats.refactor, cls: 'text-neon-cyan' },
          ].map(({ label, value, cls }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-5">
              <div className={`text-3xl font-black ${cls}`}>{value}</div>
              <p className="text-[10px] text-muted-foreground mt-2 font-mono">{label}</p>
            </div>
          ))}
        </div>

        {/* Internal: Seed + Manual Time Entry */}
        {role === 'internal' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] text-muted-foreground tracking-widest mb-1">INTERNAL ONLY</p>
                <h2 className="text-lg font-bold">Time Management</h2>
              </div>
              <button
                onClick={handleSeedFromGitHub}
                disabled={seedLoading}
                className="px-4 py-2 bg-[var(--neon-lime)]/10 border border-[var(--neon-lime)]/30 text-neon-lime font-bold rounded-lg text-xs font-mono hover:bg-[var(--neon-lime)]/20 transition-colors disabled:opacity-50"
              >
                {seedLoading ? 'SEEDING...' : 'SEED FROM GITHUB'}
              </button>
            </div>
            {seedResult && (
              <p className="text-sm text-neon-lime font-mono">{seedResult}</p>
            )}

            <div className="border-t border-border pt-6">
              <p className="font-mono text-[10px] text-muted-foreground tracking-widest mb-3">ADD MANUAL ENTRY</p>
            <form onSubmit={handleManualEntry} className="grid sm:grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground">DESCRIPTION</label>
                <input
                  value={manualDesc}
                  onChange={e => setManualDesc(e.target.value)}
                  placeholder="e.g. Design review session"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground">HOURS</label>
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={manualHours}
                  onChange={e => setManualHours(e.target.value)}
                  placeholder="2.0"
                  className="w-24 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-muted-foreground">DATE</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={e => setManualDate(e.target.value)}
                  className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                type="submit"
                disabled={manualLoading}
                className="px-4 py-2 animate-shimmer-sweep text-primary-foreground font-bold rounded-lg text-sm disabled:opacity-50 transition-transform hover:scale-[1.02]"
              >
                {manualLoading ? 'Adding...' : 'Add Entry'}
              </button>
            </form>
            {manualError && <p className="text-sm text-destructive">{manualError}</p>}
            {manualSuccess && <p className="text-sm text-neon-lime font-mono">Entry added successfully.</p>}
            </div>
          </div>
        )}

        {/* Tab Nav */}
        <div>
          <div className="flex gap-1 border-b border-border mb-6">
            {(['commits', 'timelog'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-semibold font-mono tracking-wide transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'commits' ? 'COMMITS' : 'TIME LOG'}
              </button>
            ))}
          </div>

          {/* Commits Tab */}
          {activeTab === 'commits' && (
            <div className="space-y-2">
              {commits.length === 0 ? (
                <p className="text-center text-muted-foreground py-12 text-sm">
                  {loading ? 'Loading commits...' : 'No commits found.'}
                </p>
              ) : (
                commits.map(commit => {
                  const style = CATEGORY_STYLES[commit.category]
                  return (
                    <div key={commit.sha} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className={`shrink-0 text-[10px] font-mono px-2 py-1 rounded-full ${style.bg} ${style.text} mt-0.5`}>
                          {commit.category}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground leading-snug">{commit.message}</p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-1">
                            {commit.sha} · {commit.author} · {new Date(commit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Time Log Tab */}
          {activeTab === 'timelog' && (
            <div className="space-y-2">
              {timeLog.length === 0 ? (
                <p className="text-center text-muted-foreground py-12 text-sm">
                  No time entries yet.
                </p>
              ) : (
                timeLog.map(entry => (
                  <div key={entry.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className={`shrink-0 text-[10px] font-mono px-2 py-1 rounded-full mt-0.5 ${
                        entry.type === 'manual'
                          ? 'bg-[var(--neon-cyan)]/10 text-neon-cyan'
                          : 'bg-[var(--neon-gold)]/10 text-neon-gold'
                      }`}>
                        {entry.type === 'manual' ? 'MANUAL' : 'COMMIT'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-snug">{entry.description}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-1">
                          {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {entry.commitSha && ` · ${entry.commitSha}`}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-lg font-black text-foreground">{entry.hours.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground ml-1">hr</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
