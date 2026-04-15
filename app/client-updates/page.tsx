'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import Header from '@/components/header'

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

type Role = 'user' | 'admin' | 'super_admin'

const CATEGORY_STYLES = {
  Feature:  { bg: 'bg-[var(--neon-gold)]/10',  text: 'text-neon-gold' },
  'Bug Fix':{ bg: 'bg-[var(--neon-lime)]/10',  text: 'text-neon-lime' },
  'UI/Style':{ bg: 'bg-[var(--neon-pink)]/10', text: 'text-neon-pink' },
  Refactor: { bg: 'bg-[var(--neon-cyan)]/10',  text: 'text-neon-cyan' },
}

export default function ClientUpdatesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [commits, setCommits] = useState<Commit[]>([])
  const [timeLog, setTimeLog] = useState<TimeEntry[]>([])
  const [totalHours, setTotalHours] = useState(0)
  const [loading, setLoading] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // Manual entry state (super_admin only)
  const [manualDesc, setManualDesc] = useState('')
  const [manualHours, setManualHours] = useState('')
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10))
  const [manualError, setManualError] = useState('')
  const [manualSuccess, setManualSuccess] = useState(false)
  const [manualLoading, setManualLoading] = useState(false)

  // Seed state (super_admin only)
  const [seedLoading, setSeedLoading] = useState(false)
  const [seedResult, setSeedResult] = useState<string | null>(null)

  // GitHub error state
  const [githubError, setGithubError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'commits' | 'timelog'>('commits')
  const [stats, setStats] = useState({ feature: 0, bugFix: 0, style: 0, refactor: 0 })

  // Check auth and role
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login?redirect=/client-updates')
        return
      }

      setUser(user)

      // Get profile with role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const userRole = profile?.role as Role || 'user'
      
      // Only admin and super_admin can access
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        router.push('/dashboard')
        return
      }

      setRole(userRole)
      setAuthLoading(false)
      fetchData()
    }

    checkAuth()
  }, [supabase, router])

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch('/api/client-updates')
      const data = await res.json()
      setCommits(data.commits || [])
      setTimeLog(data.timeLog || [])
      setTotalHours(data.totalHours || 0)
      setLastSync(new Date())
      setGithubError(data.githubError || null)

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
      if (res.ok && !data.error) {
        setSeedResult(`Seeded ${data.added} new commits. Total: ${data.totalHours?.toFixed(1) || 0} hrs`)
        await fetchData()
      } else {
        setSeedResult(`ERROR: ${data.error || 'Failed to seed'}`)
      }
    } catch (err) {
      setSeedResult(`Network error: ${String(err)}`)
    } finally {
      setSeedLoading(false)
      setTimeout(() => setSeedResult(null), 10000)
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
        await fetchData()
        setTimeout(() => setManualSuccess(false), 3000)
      }
    } catch {
      setManualError('Network error. Try again.')
    } finally {
      setManualLoading(false)
    }
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Determine view mode based on role
  const isInternal = role === 'super_admin'

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Development Progress</h1>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              {isInternal ? 'INTERNAL VIEW' : 'CLIENT VIEW'}
              {lastSync && ` · Synced ${lastSync.toLocaleTimeString()}`}
            </p>
          </div>
        </div>

        {/* GitHub API Error Banner */}
        {githubError && isInternal && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
            <p className="font-mono text-xs text-destructive font-semibold mb-1">GITHUB API ERROR</p>
            <p className="text-sm text-destructive/80 break-all">{githubError}</p>
          </div>
        )}

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

        {/* Internal: Seed + Manual Time Entry (super_admin only) */}
        {isInternal && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] text-neon-gold tracking-widest mb-1">SUPER ADMIN ONLY</p>
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
              <p className={`text-sm font-mono ${seedResult.startsWith('ERROR') ? 'text-destructive' : 'text-neon-lime'}`}>
                {seedResult}
              </p>
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
              {manualError && <p className="text-sm text-destructive mt-2">{manualError}</p>}
              {manualSuccess && <p className="text-sm text-neon-lime font-mono mt-2">Entry added successfully.</p>}
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
                  <div key={entry.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-start gap-3 mb-2">
                      <span className={`shrink-0 text-[10px] font-mono px-2 py-1 rounded-full mt-0.5 ${
                        entry.type === 'manual'
                          ? 'bg-[var(--neon-cyan)]/10 text-neon-cyan'
                          : 'bg-[var(--neon-gold)]/10 text-neon-gold'
                      }`}>
                        {entry.type === 'manual' ? 'MANUAL' : 'COMMIT'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{entry.title || entry.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{entry.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {new Date(entry.date).toLocaleString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="text-right">
                        <span className="text-base font-black text-foreground">{Number(entry.hours).toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground ml-1">hr</span>
                      </div>
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
