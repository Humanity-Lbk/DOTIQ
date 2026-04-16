'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { categories, type Category } from '@/lib/assessment-data'
import { Share2, Copy, Check, Loader2, Lock, ChevronDown, ChevronUp, Mail } from 'lucide-react'
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

const pillarColors: Record<Category, string> = {
  discipline: 'from-primary to-primary/70',
  ownership: 'from-emerald-500 to-emerald-600',
  toughness: 'from-rose-500 to-rose-600',
  sportsiq: 'from-cyan-500 to-blue-600',
}

const pillarBgs: Record<Category, string> = {
  discipline: 'bg-primary/15 border-primary/30',
  ownership: 'bg-emerald-400/15 border-emerald-400/30',
  toughness: 'bg-rose-400/15 border-rose-400/30',
  sportsiq: 'bg-cyan-400/15 border-cyan-400/30',
}

// Animated number counter hook
function useAnimatedNumber(target: number, duration: number = 1500, delay: number = 0) {
  const [value, setValue] = useState(0)
  const [started, setStarted] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  
  useEffect(() => {
    if (!started) return
    
    const startTime = Date.now()
    const startValue = 0
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (target - startValue) * easeOut
      
      setValue(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [target, duration, started])
  
  return value
}

// Animated progress bar component
function AnimatedProgressBar({ 
  value, 
  max = 10, 
  color, 
  delay = 0 
}: { 
  value: number
  max?: number
  color: string
  delay?: number 
}) {
  const [width, setWidth] = useState(0)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth((value / max) * 100)
    }, delay)
    return () => clearTimeout(timer)
  }, [value, max, delay])
  
  return (
    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

function ScoreRing({ score, size = 160, strokeWidth = 10, delay = 0 }: { score: number; size?: number; strokeWidth?: number; delay?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const animatedScore = useAnimatedNumber(score, 1500, delay)
  const [animatedOffset, setAnimatedOffset] = useState(circumference)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const percentage = (score / 10) * 100
      setAnimatedOffset(circumference - (percentage / 100) * circumference)
    }, delay)
    return () => clearTimeout(timer)
  }, [score, circumference, delay])
  
  return (
    <div className="relative group" style={{ width: size, height: size }}>
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <svg className="transform -rotate-90 relative z-10" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#scoreGradientFull)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          className="transition-all duration-[1500ms] ease-out"
        />
        <defs>
          <linearGradient id="scoreGradientFull" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.6)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <span className="text-5xl font-black transition-transform duration-300 group-hover:scale-110">{animatedScore.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground font-medium">/ 10</span>
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
  const [expandedPillars, setExpandedPillars] = useState<Record<string, boolean>>({
    discipline: true,
    ownership: true,
    toughness: true,
    sportsiq: true,
  })
  const [mounted, setMounted] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  
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
        body: JSON.stringify({ 
          assessmentId: assessment.id,
          email: userEmail,
        }),
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
  
  const completedVerifications = verifications.filter(v => v.status === 'completed')
  const displayScore = assessment.is_verified ? (assessment.verified_score || assessment.overall_score) : assessment.overall_score
  
  // Generate report if purchased and not already exists
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
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <h2 className="text-xl font-bold">Generating Your Report</h2>
          <p className="text-muted-foreground">Our AI is analyzing your assessment...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="DOTIQ" 
                width={120} 
                height={40} 
                className="h-8 w-auto invert brightness-0" 
              />
            </Link>
          <div className="flex items-center gap-3">
            {isPurchased && (
              <button
                onClick={sendReportEmail}
                disabled={sendingEmail}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {sendingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : emailSent ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                {emailSent ? 'Sent!' : sendingEmail ? 'Sending...' : 'Email PDF'}
              </button>
            )}
            {currentShareToken && (
              <button
                onClick={copyShareLink}
                className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Share'}
              </button>
            )}
            <Link 
              href="/dashboard" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ScoreRing score={displayScore} />
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-primary font-semibold text-sm tracking-wide">DOTIQ Report</p>
                {!isPurchased && (
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-bold rounded-full">
                    PREVIEW
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">{userName}</h1>
              <p className="text-muted-foreground mb-4">
                Generated on {new Date(assessment.created_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {assessment.is_verified && (
                  <span className="px-3 py-1.5 bg-emerald-400/15 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Verified
                  </span>
                )}
                <span className="px-3 py-1.5 bg-primary/15 text-primary text-xs font-bold rounded-full">
                  Top: {categories[topPillar].name}
                </span>
                <span className="px-3 py-1.5 bg-muted text-muted-foreground text-xs font-bold rounded-full">
                  Focus: {categories[growthPillar].name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Summary - only show if purchased */}
      {isPurchased && report?.executiveSummary && (
        <section className="max-w-5xl mx-auto px-6 py-8">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-3">Executive Summary</h2>
            <p className="text-muted-foreground leading-relaxed">{report.executiveSummary}</p>
          </div>
        </section>
      )}

      {/* Pillar Scores Overview */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold mb-6">Pillar Breakdown</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(scores) as Category[]).map((category, index) => {
            const score = scores[category]
            const letter = category === 'sportsiq' ? 'IQ' : category.charAt(0).toUpperCase()
            const animatedScore = useAnimatedNumber(score, 1200, 300 + index * 150)
            
            return (
              <div 
                key={category} 
                className={`p-5 rounded-2xl border ${pillarBgs[category]} transition-all duration-500 hover:scale-[1.02] hover:shadow-lg cursor-pointer group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onClick={() => {
                  // Scroll to pillar section
                  const element = document.getElementById(`pillar-${category}`)
                  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillarColors[category]} flex items-center justify-center text-white font-black text-lg shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    {letter}
                  </div>
                  <div>
                    <p className="font-semibold">{categories[category].name}</p>
                    <p className="text-2xl font-black">{animatedScore.toFixed(1)}</p>
                  </div>
                </div>
                <AnimatedProgressBar 
                  value={score} 
                  color={`bg-gradient-to-r ${pillarColors[category]}`}
                  delay={500 + index * 150}
                />
              </div>
            )
          })}
        </div>
      </section>

      {/* Pillar Previews for non-purchased reports - teaser content */}
      {!isPurchased && (
        <section className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Your Pillar Insights</h2>
            <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">PREVIEW</span>
          </div>
          
          {(Object.keys(scores) as Category[]).map((category) => {
            const score = scores[category]
            const letter = category === 'sportsiq' ? 'IQ' : category.charAt(0).toUpperCase()
            const isStrength = score >= 7.5
            const isGrowthArea = score < 5.5
            
            // Generate preview insight based on score
            const getPreviewInsight = () => {
              if (isStrength) {
                return `Your ${categories[category].name.toLowerCase()} is a clear strength. You demonstrate consistent behaviors in this area that set you apart.`
              } else if (isGrowthArea) {
                return `Your ${categories[category].name.toLowerCase()} presents significant growth opportunity. Small improvements here can lead to major breakthroughs.`
              } else {
                return `Your ${categories[category].name.toLowerCase()} shows solid foundation with room for targeted development.`
              }
            }
            
            // Generate teaser strengths/improvements
            const getTeaserStrength = () => {
              if (category === 'discipline') return 'Maintains consistent effort during challenging training...'
              if (category === 'ownership') return 'Takes responsibility for outcomes without deflecting...'
              if (category === 'toughness') return 'Shows resilience when facing competitive pressure...'
              return 'Processes information quickly under time constraints...'
            }
            
            const categoryIndex = (Object.keys(scores) as Category[]).indexOf(category)
            
            return (
              <div 
                key={category} 
                id={`pillar-${category}`}
                className={`bg-card border border-border rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-lg ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${categoryIndex * 100}ms` }}
              >
                <div className={`p-5 ${pillarBgs[category]}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pillarColors[category]} flex items-center justify-center text-white font-black text-xl shadow-lg transition-transform duration-300 hover:scale-110`}>
                      {letter}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{categories[category].name}</h3>
                        {isStrength && <span className="px-2 py-0.5 bg-emerald-400/20 text-emerald-400 text-[10px] font-bold rounded-full">STRENGTH</span>}
                        {isGrowthArea && <span className="px-2 py-0.5 bg-rose-400/20 text-rose-400 text-[10px] font-bold rounded-full">GROWTH AREA</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{categories[category].description}</p>
                    </div>
                    <div className="text-3xl font-black">{score.toFixed(1)}</div>
                  </div>
                </div>
                
                <div className="p-5 space-y-4">
                  <p className="text-muted-foreground">{getPreviewInsight()}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-emerald-400/5 border border-emerald-400/10 rounded-xl p-4 relative overflow-hidden">
                      <h4 className="font-semibold text-emerald-400 mb-2 text-sm">Key Strength</h4>
                      <p className="text-sm text-muted-foreground/70">{getTeaserStrength()}</p>
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent flex items-end justify-center pb-3">
                        <Lock className="w-4 h-4 text-muted-foreground/40" />
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 border border-border rounded-xl p-4 relative overflow-hidden">
                      <h4 className="font-semibold text-muted-foreground mb-2 text-sm">+ 2 More Insights</h4>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted/50 rounded w-full" />
                        <div className="h-3 bg-muted/50 rounded w-4/5" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </section>
      )}

      {/* Unlock Full Report CTA for non-purchased */}
      {!isPurchased && (
        <section className="max-w-5xl mx-auto px-6 py-8">
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-8 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-black mb-2">Unlock Your Complete Analysis</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                See exactly what&apos;s holding you back and get a personalized roadmap to breakthrough performance.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-6 text-left">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Deep Pillar Analysis</p>
                    <p className="text-xs text-muted-foreground">Full strengths and growth areas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Action Plan</p>
                    <p className="text-xs text-muted-foreground">Daily habits for this week</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Reset Script</p>
                    <p className="text-xs text-muted-foreground">Your 5-second mental reset</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Shareable Link</p>
                    <p className="text-xs text-muted-foreground">Share with coaches</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPurchaseModalOpen(true)}
                className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors animate-pulse"
              >
                Unlock for $9.99
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Detailed Pillar Analysis - only show if purchased */}
      {isPurchased && report?.pillars && (
        <section className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          <h2 className="text-xl font-bold">Detailed Analysis</h2>
          
          {(Object.keys(report.pillars) as Category[]).map((category, categoryIndex) => {
            const pillarData = report.pillars[category]
            const score = scores[category]
            const letter = category === 'sportsiq' ? 'IQ' : category.charAt(0).toUpperCase()
            const isExpanded = expandedPillars[category]
            
            return (
              <div 
                key={category}
                id={`pillar-${category}`}
                className={`bg-card border border-border rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${categoryIndex * 150}ms` }}
              >
                <button 
                  onClick={() => setExpandedPillars(prev => ({ ...prev, [category]: !prev[category] }))}
                  className={`w-full p-5 ${isExpanded ? 'border-b border-border' : ''} ${pillarBgs[category]} transition-all duration-300 hover:brightness-110`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pillarColors[category]} flex items-center justify-center text-white font-black text-xl shadow-lg transition-all duration-500 ${isExpanded ? 'scale-100 rotate-0' : 'scale-90 -rotate-6'}`}>
                      {letter}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-bold">{categories[category].name}</h3>
                      <p className="text-sm text-muted-foreground">{categories[category].description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-black">{score.toFixed(1)}</div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </div>
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-5 space-y-5">
                    <p className="text-muted-foreground leading-relaxed">{pillarData.interpretation}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-4 hover:bg-emerald-400/15 transition-colors">
                        <h4 className="font-semibold text-emerald-400 mb-3">Strengths</h4>
                        <ul className="space-y-3">
                          {pillarData.strengths.map((s, i) => (
                            <li 
                              key={i} 
                              className="text-sm text-muted-foreground flex gap-2 transition-all duration-300 hover:translate-x-1"
                              style={{ animationDelay: `${i * 100}ms` }}
                            >
                              <span className="text-emerald-400 font-bold">+</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-rose-400/10 border border-rose-400/20 rounded-xl p-4 hover:bg-rose-400/15 transition-colors">
                        <h4 className="font-semibold text-rose-400 mb-3">Growth Areas</h4>
                        <ul className="space-y-3">
                          {pillarData.improvements.map((s, i) => (
                            <li 
                              key={i} 
                              className="text-sm text-muted-foreground flex gap-2 transition-all duration-300 hover:translate-x-1"
                              style={{ animationDelay: `${i * 100}ms` }}
                            >
                              <span className="text-rose-400 font-bold">→</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 rounded-xl p-4 hover:bg-muted/60 transition-colors">
                      <h4 className="font-semibold mb-3">Your Action Items</h4>
                      <ul className="space-y-3">
                        {pillarData.recommendations.map((r, i) => (
                          <li 
                            key={i} 
                            className="text-sm text-muted-foreground flex gap-3 p-2 rounded-lg hover:bg-background/50 transition-all duration-300"
                          >
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </section>
      )}

      {/* Strongest Signals & Pressure Points - only show if purchased */}
      {isPurchased && report?.strongestSignals && report?.pressurePoints && (
        <section className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-400 flex items-center justify-center">+</span>
                Strongest Signals
              </h3>
              <ul className="space-y-3">
                {report.strongestSignals.slice(0, 6).map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="px-2 py-0.5 bg-emerald-400/20 text-emerald-400 font-bold rounded text-xs">{item.score}</span>
                    <span className="text-muted-foreground">{item.question}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-rose-400/20 text-rose-400 flex items-center justify-center">!</span>
                Pressure Points
              </h3>
              <ul className="space-y-3">
                {report.pressurePoints.slice(0, 6).map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="px-2 py-0.5 bg-rose-400/20 text-rose-400 font-bold rounded text-xs">{item.score}</span>
                    <span className="text-muted-foreground">{item.question}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Mindset Profile - only show if purchased */}
      {isPurchased && report?.mindsetProfile && (
        <section className="max-w-5xl mx-auto px-6 py-8">
          <h2 className="text-xl font-bold mb-6">Your Mindset Profile</h2>
          <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-2xl p-6">
            <p className="text-muted-foreground leading-relaxed">{report.mindsetProfile}</p>
          </div>
        </section>
      )}

      {/* Competition Day Checklist - only show if purchased */}
      {isPurchased && report?.competitionChecklist && (
        <section className="max-w-5xl mx-auto px-6 py-8">
          <h2 className="text-xl font-bold mb-6">Competition Day Checklist</h2>
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-sm text-muted-foreground mb-4">Focus on these before and during competition:</p>
            <ul className="space-y-3">
              {report.competitionChecklist.map((item, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Action Plan - only show if purchased */}
      {isPurchased && report?.actionPlan && (
        <section className="max-w-5xl mx-auto px-6 py-8">
          <h2 className="text-xl font-bold mb-6">This Week&apos;s Action Plan</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 hover:bg-primary/15 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">1</span>
                <h3 className="font-bold">{report.actionPlan.habit1.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{report.actionPlan.habit1.description}</p>
              {report.actionPlan.habit1.why && (
                <p className="text-xs text-primary/80 bg-primary/5 rounded-lg p-2 italic">Why: {report.actionPlan.habit1.why}</p>
              )}
            </div>
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 hover:bg-primary/15 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">2</span>
                <h3 className="font-bold">{report.actionPlan.habit2.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{report.actionPlan.habit2.description}</p>
              {report.actionPlan.habit2.why && (
                <p className="text-xs text-primary/80 bg-primary/5 rounded-lg p-2 italic">Why: {report.actionPlan.habit2.why}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Weekly Micro-Goals - only show if purchased */}
      {isPurchased && report?.weeklyMicroGoals && (
        <section className="max-w-5xl mx-auto px-6 py-8">
          <h2 className="text-xl font-bold mb-6">Your Weekly Micro-Goals</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {report.weeklyMicroGoals.map((goal, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-400 flex items-center justify-center text-sm font-bold mb-3">
                  {i + 1}
                </div>
                <p className="text-sm">{goal}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reset Script - only show if purchased */}
      {isPurchased && report?.resetScript && (
        <section className="max-w-5xl mx-auto px-6 py-8">
          <h2 className="text-xl font-bold mb-6">Your 5-Second Reset Script</h2>
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-sm text-muted-foreground mb-4">Use this sequence after any mistake to reset mentally:</p>
            <div className="grid sm:grid-cols-4 gap-4">
              {[
                { label: 'Breath', value: report.resetScript.breath, color: 'bg-cyan-400/15 text-cyan-400' },
                { label: 'Body', value: report.resetScript.body, color: 'bg-emerald-400/15 text-emerald-400' },
                { label: 'Words', value: report.resetScript.words, color: 'bg-primary/15 text-primary' },
                { label: 'Task', value: report.resetScript.task, color: 'bg-rose-400/15 text-rose-400' },
              ].map((item, i) => (
                <div key={i} className={`${item.color} rounded-xl p-4 text-center`}>
                  <p className="text-xs font-bold mb-1">{item.label}</p>
                  <p className="text-sm text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Self-Check Prompts */}
      {isPurchased && report?.selfCheckPrompts && (
        <section className="max-w-5xl mx-auto px-6 py-8">
          <h2 className="text-xl font-bold mb-6">7-Day Journal Prompts</h2>
          <div className="bg-card border border-border rounded-2xl p-6">
            <ul className="space-y-4">
              {report.selfCheckPrompts.map((prompt, i) => (
                <li key={i} className="flex gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-muted-foreground pt-1">{prompt}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Coach Talking Points - only show if purchased */}
      {isPurchased && report?.coachTalkingPoints && (
        <section className="max-w-5xl mx-auto px-6 py-8">
          <h2 className="text-xl font-bold mb-6">Talk to Your Coach About</h2>
          <div className="bg-gradient-to-br from-cyan-400/10 via-card to-card border border-cyan-400/20 rounded-2xl p-6">
            <p className="text-sm text-muted-foreground mb-4">Share these points with your coaches or mentors:</p>
            <ul className="space-y-3">
              {report.coachTalkingPoints.map((point, i) => (
                <li key={i} className="flex gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <span className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  <p className="text-sm">{point}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Verification Status */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold mb-6">Verification Status</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {['coach', 'peer', 'mentor'].map((type) => {
            const verification = verifications.find(v => v.evaluator_type === type)
            const isComplete = verification?.status === 'completed'
            
            return (
              <div key={type} className="bg-card border border-border rounded-2xl p-5 text-center space-y-3">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                  isComplete ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  {isComplete ? (
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className="font-bold capitalize">{type}</h4>
                  <p className="text-sm text-muted-foreground">
                    {verification?.evaluator_name || 'Not sent'}
                  </p>
                </div>
                {isComplete && verification?.overall_score && (
                  <div className="text-2xl font-black text-primary">{verification.overall_score.toFixed(1)}</div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 bg-card/30 mt-12">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <Image 
            src="/logo.png" 
            alt="DOTIQ" 
            width={100} 
            height={33} 
            className="h-7 w-auto invert brightness-0" 
          />
          <p className="text-sm text-muted-foreground">
            Discipline · Ownership · Toughness · IQ
          </p>
        </div>
      </footer>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        assessmentId={assessment.id}
        score={displayScore}
        userEmail={userEmail}
        onPurchaseComplete={() => {
          window.location.reload()
        }}
      />
    </div>
  )
}
