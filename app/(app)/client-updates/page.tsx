'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { RefreshCw } from 'lucide-react'

interface TimeEntry {
  id: string
  type: 'commit' | 'manual'
  title: string
  description: string
  category: string
  hours: number
  date: string
  commitSha?: string
}

type Role = 'user' | 'admin' | 'super_admin'

interface Profile {
  full_name: string | null
  role: Role
}

function ClientUpdatesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedView = searchParams.get('view')

  const supabase = useMemo(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null
    return createClient()
  }, [])

  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [viewMode, setViewMode] = useState<'internal' | 'external'>('external')
  const [authLoading, setAuthLoading] = useState(true)

  const [timeLog, setTimeLog] = useState<TimeEntry[]>([])
  const [totalHours, setTotalHours] = useState(0)
  const [loading, setLoading] = useState(false)
  const [githubError, setGithubError] = useState<string | null>(null)

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

  useEffect(() => {
    async function checkAuth() {
      if (!supabase) {
        setAuthLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login?redirect=/client-updates')
        return
      }

      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

      setProfile(profileData as Profile | null)
      const userRole = (profileData?.role as Role) || 'user'

      if (userRole !== 'admin' && userRole !== 'super_admin') {
        router.push('/dashboard')
        return
      }

      setRole(userRole)

      if (userRole === 'super_admin' && requestedView === 'internal') {
        setViewMode('internal')
      } else {
        setViewMode('external')
      }

      setAuthLoading(false)
      fetchData()
    }

    checkAuth()
  }, [supabase, router, requestedView])

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch('/api/client-updates')
      const data = await res.json()
      setTimeLog(data.timeLog || [])
      setTotalHours(data.totalHours || 0)
      setGithubError(data.githubError || null)
    } catch {
      // ignore
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
        setSeedResult(`Imported ${data.added} updates`)
        await fetchData()
      } else {
        setSeedResult(`Error: ${data.error || 'Failed'}`)
      }
    } catch (err) {
      setSeedResult(`Error: ${String(err)}`)
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
        await fetchData()
        setTimeout(() => setManualSuccess(false), 3000)
      }
    } catch {
      setManualError('Network error. Try again.')
    } finally {
      setManualLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  if (!supabase) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">App is not configured. Missing Supabase environment variables.</p>
      </div>
    )
  }

  const isInternal = role === 'super_admin' && viewMode === 'internal'

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 grid-subtle pointer-events-none" />

      <header className="sticky top-14 md:top-0 z-30 h-16 bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">Change Log</h1>
          {isInternal && (
            <span className="px-2 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-medium rounded-full">
              Internal
            </span>
          )}
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 border border-border rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      <main className="relative max-w-4xl mx-auto px-6 md:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground font-medium">Live Updates</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2">What we&apos;ve been building</h2>
          <p className="text-muted-foreground">Real-time development progress. Every feature, fix, and improvement.</p>
        </div>

        {githubError && isInternal && (
          <div className="mb-8 p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
            <p className="text-sm text-destructive">{githubError}</p>
          </div>
        )}

        {/* Summary KPIs */}
        <div className="mb-8 p-6 bg-card/50 backdrop-blur-sm border border-border rounded-2xl">
          <div className="flex items-end justify-between gap-6 mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Total Development Time</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-primary">{totalHours.toFixed(1)}</span>
                <span className="text-lg text-muted-foreground">hours</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{timeLog.length}</p>
              <p className="text-xs text-muted-foreground">updates shipped</p>
            </div>
          </div>

          {/* Type breakdown */}
          {timeLog.length > 0 && (() => {
            const counts = timeLog.reduce<Record<string, number>>((acc, e) => {
              acc[e.category] = (acc[e.category] || 0) + 1
              return acc
            }, {})
            const kpis = [
              { label: 'Features', key: 'Feature', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
              { label: 'Bug Fixes', key: 'Bug Fix', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/30' },
              { label: 'UI/Style', key: 'UI/Style', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30' },
              { label: 'Refactors', key: 'Refactor', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
            ]
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border">
                {kpis.map(({ label, key, color, bg, border }) => (
                  <div key={key} className={`p-3 ${bg} border ${border} rounded-xl text-center`}>
                    <p className={`text-2xl font-black ${color}`}>{counts[key] || 0}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>

        {isInternal && (
          <div className="mb-10 p-6 bg-card/50 backdrop-blur-sm border border-border rounded-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-primary font-medium mb-1">Admin Tools</p>
                <h3 className="font-semibold">Manage Updates</h3>
              </div>
              <button
                onClick={handleSeedFromGitHub}
                disabled={seedLoading}
                className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {seedLoading ? 'Importing...' : 'Import from GitHub'}
              </button>
            </div>
            {seedResult && (
              <p className={`text-sm ${seedResult.startsWith('Error') ? 'text-destructive' : 'text-primary'}`}>
                {seedResult}
              </p>
            )}

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">Add Manual Entry</p>
              <form onSubmit={handleManualEntry} className="flex flex-wrap gap-3">
                <input
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                  placeholder="Description"
                  className="flex-1 min-w-[200px] px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={manualHours}
                  onChange={(e) => setManualHours(e.target.value)}
                  placeholder="Hours"
                  className="w-24 px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="submit"
                  disabled={manualLoading}
                  className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm disabled:opacity-50"
                >
                  {manualLoading ? 'Adding...' : 'Add'}
                </button>
              </form>
              {manualError && <p className="text-sm text-destructive mt-2">{manualError}</p>}
              {manualSuccess && <p className="text-sm text-primary mt-2">Entry added</p>}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {timeLog.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No updates yet</p>
            </div>
          ) : (
            timeLog.map((entry) => {
              const categoryColors: Record<string, { bg: string; text: string; border: string; lightBg: string }> = {
                Feature: { bg: 'bg-primary/15', text: 'text-primary', border: 'border-primary/60', lightBg: 'bg-primary/5' },
                'Bug Fix': { bg: 'bg-rose-400/15', text: 'text-rose-400', border: 'border-rose-400/60', lightBg: 'bg-rose-400/5' },
                'UI/Style': { bg: 'bg-cyan-400/15', text: 'text-cyan-400', border: 'border-cyan-400/60', lightBg: 'bg-cyan-400/5' },
                Refactor: { bg: 'bg-emerald-400/15', text: 'text-emerald-400', border: 'border-emerald-400/60', lightBg: 'bg-emerald-400/5' },
              }
              const colors =
                categoryColors[entry.category] || { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border/60', lightBg: 'bg-muted/5' }

              return (
                <div
                  key={entry.id}
                  className={`group p-5 ${colors.lightBg} border-2 ${colors.border} hover:scale-[1.01] rounded-xl transition-all duration-200`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${colors.bg} ${colors.text}`}>
                          {entry.category}
                        </span>
                      </div>
                      <h3 className={`font-semibold mb-1 ${colors.text}`}>{entry.title}</h3>
                      <p className="text-sm text-muted-foreground/80 leading-relaxed">{entry.description}</p>
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <p className="text-xs text-muted-foreground/70">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        {isInternal && entry.commitSha && (
                          <span className="font-mono text-[10px] text-muted-foreground/50 bg-muted/30 px-2 py-0.5 rounded">
                            {entry.commitSha.slice(0, 7)}
                          </span>
                        )}
                        {entry.type === 'manual' && isInternal && (
                          <span className="text-[10px] text-muted-foreground/50 px-2 py-0.5 bg-muted/30 rounded">manual</span>
                        )}
                      </div>
                    </div>
                    {isInternal && (
                      <div className="text-right shrink-0">
                        <span className="text-lg font-bold text-foreground">{Number(entry.hours).toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground ml-1">hr</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}

export default function ClientUpdatesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      }
    >
      <ClientUpdatesContent />
    </Suspense>
  )
}

