'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { categories, type Category } from '@/lib/assessment-data'
import { Share2, Copy, Check, Loader2, Lock, ChevronRight, Mail, Zap, Target, Brain, Trophy, TrendingUp, Flame, ArrowRight, Sparkles } from 'lucide-react'
import { PurchaseModal } from '@/components/purchase/purchase-modal'

interface Assessment {
  id: string
  scores: Record<string, number>
  overall_score: number
  is_verified: boolean
  verified_score: number | null
  created_at: string
}

interface Verification {
  id: string
  evaluator_type: string
  evaluator_name: string
  status: string
  overall_score: number | null
}

interface AIReport {
  executiveSummary: string
  overallAnalysis: string
  mindsetProfile?: string
  pillars: Record<string, {
    interpretation: string
    strengths: string[]
    improvements: string[]
    recommendations: string[]
  }>
  strongestSignals: Array<{ question: string; score: number }>
  pressurePoints: Array<{ question: string; score: number }>
  competitionChecklist?: string[]
  actionPlan: {
    habit1: { title: string; description: string; why?: string }
    habit2: { title: string; description: string; why?: string }
  }
  weeklyMicroGoals?: string[]
  resetScript: {
    breath: string
    body: string
    words: string
    task: string
  }
  selfCheckPrompts: string[]
  coachTalkingPoints?: string[]
}

interface FullReportProps {
  assessment: Assessment
  verifications: Verification[]
  userName: string
  aiReport: AIReport | null
  shareToken: string | null
  isPurchased: boolean
  userEmail?: string | null
}

const pillarConfig: Record<Category, { gradient: string, bg: string, icon: React.ReactNode, color: string }> = {
  discipline: { 
    gradient: 'from-amber-500 via-orange-500 to-amber-600', 
    bg: 'bg-amber-500/10',
    icon: <Flame className="w-6 h-6" />,
    color: 'text-amber-400'
  },
  ownership: { 
    gradient: 'from-emerald-400 via-green-500 to-emerald-600', 
    bg: 'bg-emerald-500/10',
    icon: <Target className="w-6 h-6" />,
    color: 'text-emerald-400'
  },
  toughness: { 
    gradient: 'from-rose-400 via-red-500 to-rose-600', 
    bg: 'bg-rose-500/10',
    icon: <Zap className="w-6 h-6" />,
    color: 'text-rose-400'
  },
  sportsiq: { 
    gradient: 'from-cyan-400 via-blue-500 to-indigo-600', 
    bg: 'bg-cyan-500/10',
    icon: <Brain className="w-6 h-6" />,
    color: 'text-cyan-400'
  },
}

// Animated counter hook
function useCounter(target: number, duration = 1500, delay = 0) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0
      const increment = target / (duration / 16)
      const counter = setInterval(() => {
        start += increment
        if (start >= target) {
          setCount(target)
          clearInterval(counter)
        } else {
          setCount(start)
        }
      }, 16)
      return () => clearInterval(counter)
    }, delay)
    return () => clearTimeout(timer)
  }, [target, duration, delay])
  
  return count
}

// Score gauge component
function ScoreGauge({ score, label, delay = 0 }: { score: number, label: string, delay?: number }) {
  const [width, setWidth] = useState(0)
  const animatedScore = useCounter(score, 1200, delay)
  
  useEffect(() => {
    const timer = setTimeout(() => setWidth((score / 10) * 100), delay)
    return () => clearTimeout(timer)
  }, [score, delay])
  
  const getScoreColor = (s: number) => {
    if (s >= 8) return 'from-emerald-400 to-emerald-500'
    if (s >= 6) return 'from-amber-400 to-orange-500'
    return 'from-rose-400 to-rose-500'
  }
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-2xl font-black">{animatedScore.toFixed(1)}</span>
      </div>
      <div className="h-3 bg-muted/20 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${getScoreColor(score)} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

export function FullReport({ assessment, verifications, userName, aiReport, shareToken, isPurchased, userEmail }: FullReportProps) {
  const [report, setReport] = useState<AIReport | null>(aiReport)
  const [loading, setLoading] = useState(!aiReport && isPurchased)
  const [copied, setCopied] = useState(false)
  const [currentShareToken, setCurrentShareToken] = useState(shareToken)
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [activePillar, setActivePillar] = useState<Category | null>(null)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const sendReportEmail = async () => {
    if (sendingEmail || !isPurchased) return
    setSendingEmail(true)
    try {
      const res = await fetch('/api/report/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: assessment.id, email: userEmail }),
      })
      if (res.ok) {
        setEmailSent(true)
        setTimeout(() => setEmailSent(false), 5000)
      }
    } catch (error) {
      console.error('Failed to send email:', error)
    } finally {
      setSendingEmail(false)
    }
  }
  
  const scores = assessment.scores as Record<Category, number>
  const sortedPillars = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const topPillar = sortedPillars[0][0] as Category
  const growthPillar = sortedPillars[sortedPillars.length - 1][0] as Category
  const displayScore = assessment.is_verified ? (assessment.verified_score || assessment.overall_score) : assessment.overall_score
  
  useEffect(() => {
    if (isPurchased && !aiReport && !report) {
      generateReport()
    }
  }, [aiReport, isPurchased])
  
  const generateReport = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: assessment.id }),
      })
      if (response.ok) {
        const data = await response.json()
        setReport(data.report)
        setCurrentShareToken(data.shareToken)
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const copyShareLink = () => {
    if (!currentShareToken) return
    const shareUrl = `${window.location.origin}/report/shared/${currentShareToken}`
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-primary/20 mx-auto" />
            <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-primary mx-auto animate-spin" />
          </div>
          <div>
            <h2 className="text-2xl font-black mb-2">Building Your Report</h2>
            <p className="text-muted-foreground">Analyzing your athletic mindset...</p>
          </div>
        </div>
      </div>
    )
  }

  const overallAnimated = useCounter(displayScore, 2000, 300)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
          {/* Nav */}
          <nav className="flex items-center justify-between mb-12">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="DOTIQ" width={120} height={40} className="h-8 w-auto invert brightness-0" />
            </Link>
            <div className="flex items-center gap-3">
              {isPurchased && (
                <button
                  onClick={sendReportEmail}
                  disabled={sendingEmail}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-all hover:scale-105 disabled:opacity-50"
                >
                  {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : emailSent ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  {emailSent ? 'Sent!' : 'Email PDF'}
                </button>
              )}
              {currentShareToken && (
                <button onClick={copyShareLink} className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-full text-sm font-semibold transition-all hover:scale-105">
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Share'}
                </button>
              )}
              <Link href="/dashboard" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            </div>
          </nav>
          
          {/* Hero Content */}
          <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left - Score */}
              <div className="relative">
                <div className="absolute -inset-8 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="relative w-56 h-56 rounded-full bg-gradient-to-br from-card to-card/50 border-4 border-primary/30 flex items-center justify-center shadow-2xl">
                  <div className="text-center">
                    <div className="text-7xl font-black bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">
                      {overallAnimated.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium mt-1">DOTIQ SCORE</div>
                  </div>
                </div>
              </div>
              
              {/* Right - Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 rounded-full text-primary text-sm font-semibold mb-4">
                  <Sparkles className="w-4 h-4" />
                  {isPurchased ? 'Full Report' : 'Preview Report'}
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                  {userName}&apos;s<br />
                  <span className="bg-gradient-to-r from-primary via-amber-400 to-orange-500 bg-clip-text text-transparent">
                    Athletic Profile
                  </span>
                </h1>
                {report?.executiveSummary && (
                  <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                    {report.executiveSummary}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats Bar */}
      <section className="border-y border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 overflow-x-auto">
            {(Object.keys(scores) as Category[]).map((category, i) => (
              <button
                key={category}
                onClick={() => {
                  setActivePillar(activePillar === category ? null : category)
                  document.getElementById(`pillar-${category}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 whitespace-nowrap ${
                  activePillar === category ? pillarConfig[category].bg + ' ring-2 ring-' + pillarConfig[category].color.replace('text-', '') : 'hover:bg-muted/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pillarConfig[category].gradient} flex items-center justify-center text-white shadow-lg`}>
                  {pillarConfig[category].icon}
                </div>
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">{categories[category].name}</div>
                  <div className="text-xl font-black">{scores[category].toFixed(1)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        
        {/* Pillar Deep Dives - Alternating Layout */}
        {(Object.keys(scores) as Category[]).map((category, index) => {
          const config = pillarConfig[category]
          const score = scores[category]
          const pillarReport = report?.pillars?.[category]
          const isEven = index % 2 === 0
          
          return (
            <section 
              key={category}
              id={`pillar-${category}`}
              className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Pillar Header Card */}
              <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${config.gradient} p-8 md:p-12 text-white shadow-2xl mb-8`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-black/20 rounded-full blur-3xl" />
                
                <div className={`relative z-10 flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8`}>
                  {/* Score Circle */}
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl font-black">{score.toFixed(1)}</div>
                        <div className="text-sm opacity-80">/ 10</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className={`flex-1 ${isEven ? 'md:text-left' : 'md:text-right'} text-center`}>
                    <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        {config.icon}
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black">{categories[category].name}</h2>
                    </div>
                    <p className="text-white/80 text-lg max-w-lg">
                      {categories[category].description}
                    </p>
                    {pillarReport && (
                      <p className="mt-4 text-white/90 leading-relaxed max-w-lg">
                        {pillarReport.interpretation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Strengths & Growth - Only show if purchased */}
              {isPurchased && pillarReport ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-6 hover:border-emerald-500/40 transition-all duration-500 hover:shadow-lg hover:shadow-emerald-500/10">
                    <div className="absolute -right-12 -top-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-emerald-400">Strengths</h3>
                      </div>
                      <ul className="space-y-4">
                        {pillarReport.strengths.map((s, i) => (
                          <li 
                            key={i} 
                            className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 transition-all group/item cursor-default"
                          >
                            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform">
                              {i + 1}
                            </span>
                            <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Growth Areas */}
                  <div className="group relative overflow-hidden rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent p-6 hover:border-rose-500/40 transition-all duration-500 hover:shadow-lg hover:shadow-rose-500/10">
                    <div className="absolute -right-12 -top-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                          <Target className="w-5 h-5 text-rose-400" />
                        </div>
                        <h3 className="text-xl font-bold text-rose-400">Growth Areas</h3>
                      </div>
                      <ul className="space-y-4">
                        {pillarReport.improvements.map((s, i) => (
                          <li 
                            key={i} 
                            className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 transition-all group/item cursor-default"
                          >
                            <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform">
                              {i + 1}
                            </span>
                            <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : !isPurchased && (
                <div className="relative rounded-2xl border border-border bg-card/50 p-8 text-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent rounded-2xl" />
                  <div className="relative z-10">
                    <Lock className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Unlock detailed strengths & growth areas</p>
                    <button onClick={() => setPurchaseModalOpen(true)} className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all hover:scale-105">
                      Unlock Report
                    </button>
                  </div>
                </div>
              )}
              
              {/* Action Items - Only show if purchased */}
              {isPurchased && pillarReport?.recommendations && (
                <div className="mt-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Action Items for {categories[category].name}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {pillarReport.recommendations.map((r, i) => (
                      <div 
                        key={i} 
                        className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all group cursor-default"
                      >
                        <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0 group-hover:scale-110 transition-transform">
                          {i + 1}
                        </span>
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )
        })}

        {/* Signals Section - Full Width Bento Grid */}
        {isPurchased && report?.strongestSignals && report?.pressurePoints && (
          <section className="space-y-8">
            <h2 className="text-3xl font-black text-center">
              Your <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">Performance Signals</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Strongest Signals - Takes 2 columns */}
              <div className="md:col-span-2 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-emerald-400">Strongest Signals</h3>
                    <p className="text-sm text-muted-foreground">Your top-rated behaviors</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {report.strongestSignals.slice(0, 6).map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 transition-all">
                      <span className="px-2 py-1 bg-emerald-500 text-white font-bold rounded text-xs shrink-0">
                        {item.score}
                      </span>
                      <span className="text-sm text-muted-foreground">{item.question}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Pressure Points */}
              <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-rose-400">Pressure Points</h3>
                    <p className="text-sm text-muted-foreground">Focus areas</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {report.pressurePoints.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 transition-all">
                      <span className="px-2 py-1 bg-rose-500 text-white font-bold rounded text-xs shrink-0">
                        {item.score}
                      </span>
                      <span className="text-sm text-muted-foreground">{item.question}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Reset Script - Interactive Card */}
        {isPurchased && report?.resetScript && (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-amber-500 to-orange-600 p-8 md:p-12 text-white">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute -right-24 -bottom-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Zap className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-3xl font-black">5-Second Reset</h2>
                  <p className="text-white/80">Your mental reset routine after mistakes</p>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Breathe', value: report.resetScript.breath, icon: '1' },
                  { label: 'Body', value: report.resetScript.body, icon: '2' },
                  { label: 'Words', value: report.resetScript.words, icon: '3' },
                  { label: 'Focus', value: report.resetScript.task, icon: '4' },
                ].map((step, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/20 transition-all group cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg font-black mb-3 group-hover:scale-110 transition-transform">
                      {step.icon}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-white/60 mb-1">{step.label}</div>
                    <div className="font-semibold">{step.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Action Plan */}
        {isPurchased && report?.actionPlan && (
          <section>
            <h2 className="text-3xl font-black mb-8 text-center">
              This Week&apos;s <span className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">Action Plan</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[report.actionPlan.habit1, report.actionPlan.habit2].map((habit, i) => (
                <div key={i} className="group rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 hover:border-primary/40 transition-all hover:shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-black shrink-0 group-hover:scale-110 transition-transform">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{habit.title}</h3>
                      <p className="text-muted-foreground mb-3">{habit.description}</p>
                      {habit.why && (
                        <p className="text-sm text-primary/80 bg-primary/10 rounded-lg p-3">
                          <strong>Why:</strong> {habit.why}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Journal Prompts */}
        {isPurchased && report?.selfCheckPrompts && (
          <section className="rounded-3xl border border-border bg-card/50 p-8 md:p-12">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-black mb-2 text-center">7-Day Journal</h2>
              <p className="text-muted-foreground text-center mb-8">Daily reflection questions to deepen your growth</p>
              <div className="space-y-4">
                {report.selfCheckPrompts.map((prompt, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 hover:bg-muted/40 transition-all group">
                    <span className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      {i + 1}
                    </span>
                    <p className="text-muted-foreground pt-2 group-hover:text-foreground transition-colors">{prompt}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Unlock CTA for non-purchased */}
        {!isPurchased && (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-amber-500 to-orange-600 p-8 md:p-12 text-white text-center">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute -right-24 -top-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-24 -bottom-24 w-72 h-72 bg-black/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10" />
              </div>
              <h2 className="text-4xl font-black mb-4">Unlock Your Full Potential</h2>
              <p className="text-xl text-white/80 mb-8">
                Get detailed strengths, growth areas, personalized action plans, and your 5-second reset script.
              </p>
              <button
                onClick={() => setPurchaseModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-full text-lg hover:bg-white/90 transition-all hover:scale-105 shadow-xl"
              >
                Unlock for $9.99
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 bg-card/30 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <Image src="/logo.png" alt="DOTIQ" width={100} height={33} className="h-7 w-auto invert brightness-0" />
          <p className="text-sm text-muted-foreground">
            Discipline · Ownership · Toughness · IQ
          </p>
        </div>
      </footer>

      {/* Purchase Modal */}
      <PurchaseModal
        open={purchaseModalOpen}
        onOpenChange={setPurchaseModalOpen}
        assessmentId={assessment.id}
        userEmail={userEmail || ''}
        onPurchaseComplete={() => {
          setPurchaseModalOpen(false)
          generateReport()
        }}
      />
    </div>
  )
}
