'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const PILLARS = ['D', 'O', 'T', 'I', 'Q']
const PILLAR_LABELS = ['Discipline', 'Ownership', 'Toughness', 'Intelligence', 'Quotient']
const TICKER_ITEMS = [
  'ATHLETIC PERFORMANCE INTELLIGENCE',
  'MEASURE WHAT MATTERS',
  'DISCIPLINE · OWNERSHIP · TOUGHNESS · IQ',
  'BUILT FOR ELITE ATHLETES',
  'DATA-DRIVEN DEVELOPMENT',
  'COMING SOON',
]

export default function ComingSoonPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [activePillar, setActivePillar] = useState(0)
  const [scanLine, setScanLine] = useState(0)
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    // Cycle active pillar
    const pillarInterval = setInterval(() => {
      setActivePillar(p => (p + 1) % PILLARS.length)
    }, 1800)
    // Scan line animation
    const scanInterval = setInterval(() => {
      setScanLine(s => (s + 1) % 100)
    }, 30)
    return () => {
      clearInterval(pillarInterval)
      clearInterval(scanInterval)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/gate-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        setRevealed(true)
        setTimeout(() => router.push('/dashboard'), 1800)
      } else {
        setError('ACCESS DENIED — incorrect passphrase')
        setPassword('')
        inputRef.current?.focus()
      }
    } catch {
      setError('CONNECTION ERROR — try again')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col items-center justify-center">

      {/* Subtle grid */}
      <div className="absolute inset-0 grid-subtle opacity-60 pointer-events-none" />

      {/* Animated scan line */}
      <div
        className="absolute inset-x-0 h-px bg-primary/10 pointer-events-none transition-none"
        style={{ top: `${scanLine}%` }}
      />

      {/* Radial glow behind logo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, oklch(0.82 0.18 72 / 0.06) 0%, transparent 70%)',
        }}
      />

      {/* Ticker tape top */}
      <div className="absolute top-0 inset-x-0 overflow-hidden border-b border-border/40 h-8 flex items-center">
        <div
          className="flex gap-16 whitespace-nowrap text-[10px] font-mono font-bold text-muted-foreground tracking-[0.3em]"
          style={{
            animation: 'ticker 28s linear infinite',
          }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-16">
              <span className="text-primary/50">▸</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Ticker tape bottom */}
      <div className="absolute bottom-0 inset-x-0 overflow-hidden border-t border-border/40 h-8 flex items-center">
        <div
          className="flex gap-16 whitespace-nowrap text-[10px] font-mono font-bold text-muted-foreground tracking-[0.3em]"
          style={{
            animation: 'ticker 20s linear infinite reverse',
          }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-16">
              <span className="text-primary/50">◂</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Corner marks */}
      <div className="absolute top-12 left-6 w-6 h-6 border-l-2 border-t-2 border-primary/30" />
      <div className="absolute top-12 right-6 w-6 h-6 border-r-2 border-t-2 border-primary/30" />
      <div className="absolute bottom-12 left-6 w-6 h-6 border-l-2 border-b-2 border-primary/30" />
      <div className="absolute bottom-12 right-6 w-6 h-6 border-r-2 border-b-2 border-primary/30" />

      {/* Main content */}
      <div
        className={`relative z-10 flex flex-col items-center text-center px-6 transition-all duration-[1800ms] ${
          revealed ? 'opacity-0 scale-105 blur-sm' : 'opacity-100 scale-100'
        }`}
      >
        {/* Status pill */}
        <div className="animate-fade-in flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-card/40 backdrop-blur-sm mb-10">
          <span className="status-dot status-active" />
          <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-muted-foreground">
            SYSTEM_STATUS : INITIALIZING
          </span>
        </div>

        {/* DOTIQ wordmark — cinematic split */}
        <div className="animate-fade-in mb-2 flex items-end gap-3 md:gap-5">
          {PILLARS.map((letter, i) => (
            <div key={letter} className="flex flex-col items-center gap-1">
              <span
                className={`font-mono font-black text-6xl md:text-8xl lg:text-9xl transition-all duration-500 ${
                  activePillar === i
                    ? 'text-primary animate-text-glow'
                    : 'text-foreground/20'
                }`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                {letter}
              </span>
              <span
                className={`font-mono text-[8px] tracking-[0.2em] transition-all duration-500 ${
                  activePillar === i ? 'text-primary/80' : 'text-muted-foreground/30'
                }`}
              >
                {PILLAR_LABELS[i].toUpperCase()}
              </span>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <p className="animate-fade-in delay-200 mt-6 text-sm md:text-base font-mono text-muted-foreground tracking-[0.15em] uppercase max-w-md">
          Athletic Performance Intelligence
        </p>

        {/* Divider */}
        <div className="animate-fade-in delay-300 mt-8 mb-8 flex items-center gap-4 w-full max-w-sm">
          <div className="flex-1 h-px bg-border/50" />
          <span className="text-[10px] font-mono text-primary/60 tracking-widest">RESTRICTED ACCESS</span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        {/* Password form */}
        <form
          onSubmit={handleSubmit}
          className="animate-fade-in delay-400 w-full max-w-sm flex flex-col gap-3"
        >
          <div className="relative">
            {/* Terminal cursor prefix */}
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-primary/60 text-sm pointer-events-none select-none">
              ›
            </span>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="ENTER PASSPHRASE"
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-card/50 border border-border/60 hover:border-primary/40 focus:border-primary focus:outline-none rounded-lg pl-9 pr-4 py-3.5 font-mono text-sm tracking-[0.2em] text-foreground placeholder:text-muted-foreground/40 transition-colors duration-200"
              style={{ caretColor: 'var(--primary)' }}
            />
          </div>

          {error && (
            <p className="text-[11px] font-mono text-rose-400 tracking-widest text-left pl-1">
              ✕ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="relative w-full py-3.5 rounded-lg font-mono font-bold text-sm tracking-[0.25em] text-primary-foreground transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden animate-shimmer-sweep"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                AUTHENTICATING
              </span>
            ) : (
              'REQUEST ACCESS'
            )}
          </button>
        </form>

        {/* Footer note */}
        <p className="animate-fade-in delay-500 mt-8 text-[10px] font-mono text-muted-foreground/40 tracking-widest">
          HUMANITY LAB © 2026 — DOTIQ v1.0
        </p>
      </div>

      {/* Access granted overlay */}
      {revealed && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="text-primary animate-text-glow font-mono font-black text-5xl tracking-widest">
              ACCESS GRANTED
            </div>
            <p className="font-mono text-xs text-muted-foreground tracking-[0.3em]">
              INITIALIZING DOTIQ PLATFORM...
            </p>
            <div className="flex gap-1 mt-2">
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
