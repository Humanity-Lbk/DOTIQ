'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, FileText, ClipboardList, History, LogOut, ChevronRight, RefreshCw } from 'lucide-react'

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
  const supabase = createClient()

  const requestedView = searchParams.get('view')

  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [viewMode, setViewMode] = useState<'internal' | 'external'>('external')
  const [authLoading, setAuthLoading] = useState(true)

  const [timeLog, setTimeLog] = useState<TimeEntry[]>([])
  const [totalHours, setTotalHours] = useState(0)
  const [loading, setLoading] = useState(false)

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

  useEffect(() => {
    async function checkAuth() {
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

      setProfile(profileData)
      const userRole = profileData?.role as Role || 'user'
      
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

  const isInternal = role === 'super_admin' && viewMode === 'internal'
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/assessments', label: 'My Assessments', icon: FileText },
    { href: '/assessment', label: 'Take Assessment', icon: ClipboardList },
  ]

  const adminNavItems = [
    { href: '/requests', label: 'Requests & Tickets', icon: FileText },
    { href: '/client-updates', label: 'Change Log', icon: History, active: true },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col z-50">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/dashboard">
            <Image 
              src="/logo.png" 
              alt="DOTIQ" 
              width={120} 
              height={40} 
              className="h-8 w-auto invert brightness-0"
              priority
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}

          {(role === 'admin' || role === 'super_admin') && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-3 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">Admin</p>
              </div>
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    item.active 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.active && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              ))}
              {role === 'super_admin' && (
                <Link
                  href="/client-updates?view=internal"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isInternal 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Internal View
                  <span className="ml-auto text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono">DEV</span>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground capitalize">{role || 'User'}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors mt-1"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64">
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 h-16 bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-between px-8">
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

        {/* Grid background */}
        <div className="fixed inset-0 ml-64 grid-subtle pointer-events-none" />

        <main className="relative max-w-4xl mx-auto px-8 py-8">
          {/* Hero section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">Live Updates</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-2">What we&apos;ve been building</h2>
            <p className="text-muted-foreground">
              Real-time development progress. Every feature, fix, and improvement.
            </p>
          </div>

        {/* GitHub Error */}
        {githubError && isInternal && (
          <div className="mb-8 p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
            <p className="text-sm text-destructive">{githubError}</p>
          </div>
        )}

          {/* Stats Card */}
          <div className="mb-8 p-6 bg-card/50 backdrop-blur-sm border border-border rounded-2xl">
            <div className="flex items-end justify-between gap-6">
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
          </div>

        {/* Internal Tools */}
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
                  onChange={e => setManualDesc(e.target.value)}
                  placeholder="Description"
                  className="flex-1 min-w-[200px] px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={manualHours}
                  onChange={e => setManualHours(e.target.value)}
                  placeholder="Hours"
                  className="w-24 px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="date"
                  value={manualDate}
                  onChange={e => setManualDate(e.target.value)}
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

        {/* Updates List */}
        <div className="space-y-3">
          {timeLog.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No updates yet</p>
            </div>
          ) : (
            timeLog.map(entry => {
              const categoryColors: Record<string, { bg: string; text: string; border: string; lightBg: string }> = {
                'Feature': { bg: 'bg-primary/15', text: 'text-primary', border: 'border-primary/60', lightBg: 'bg-primary/5' },
                'Bug Fix': { bg: 'bg-rose-400/15', text: 'text-rose-400', border: 'border-rose-400/60', lightBg: 'bg-rose-400/5' },
                'UI/Style': { bg: 'bg-cyan-400/15', text: 'text-cyan-400', border: 'border-cyan-400/60', lightBg: 'bg-cyan-400/5' },
                'Refactor': { bg: 'bg-emerald-400/15', text: 'text-emerald-400', border: 'border-emerald-400/60', lightBg: 'bg-emerald-400/5' },
              }
              const colors = categoryColors[entry.category] || { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border/60', lightBg: 'bg-muted/5' }
              
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
                      <h3 className={`font-semibold mb-1 ${colors.text}`}>
                        {entry.title}
                      </h3>
                      <p className="text-sm text-muted-foreground/80 line-clamp-2">
                        {entry.description}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-3">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
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
    </div>
  )
}

export default function ClientUpdatesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    }>
      <ClientUpdatesContent />
    </Suspense>
  )
}
