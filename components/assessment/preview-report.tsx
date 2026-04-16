'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useAssessmentStore } from '@/lib/assessment-store'
import { categories, questions, type Category } from '@/lib/assessment-data'
import { TypewriterText } from '@/components/ui/typewriter-text'

function ScoreRing({ score, size = 200, strokeWidth = 8 }: { score: number; size?: number; strokeWidth?: number }) {
  const [animated, setAnimated] = useState(false)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  // Score is now 1-10, convert to percentage for display
  const percentage = (score / 10) * 100
  const offset = animated ? circumference - (percentage / 100) * circumference : circumference
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="relative animate-scale-in" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-[2000ms] ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CD9B32" />
            <stop offset="100%" stopColor="#E8B95A" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-black animate-fade-in">{score.toFixed(1)}</span>
        <span className="text-[10px] font-mono text-muted-foreground tracking-widest mt-1">/ 10.0</span>
      </div>
    </div>
  )
}

function PillarCard({ category, score, delay = 0 }: { category: Category; score: number; delay?: number }) {
  const [animated, setAnimated] = useState(false)
  const info = categories[category]
  const letter = category === 'sportsiq' ? 'IQ' : category.charAt(0).toUpperCase()
  const percentage = (score / 10) * 100
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  
  return (
    <div 
      className="bg-card border border-border rounded-lg p-4 space-y-3 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted border-l-2 border-primary flex items-center justify-center">
          <span className="font-black text-sm">{letter}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm">{info.name}</h3>
        </div>
        <div className="text-right">
          <div className="text-xl font-black">{score.toFixed(1)}</div>
          <div className="text-[10px] text-muted-foreground font-mono">/ 10</div>
        </div>
      </div>
      
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-1000 ease-out"
          style={{ width: animated ? `${percentage}%` : '0%' }}
        />
      </div>
    </div>
  )
}

// Generate AI-style insights based on scores
function generateInsights(scores: Record<Category, number>, overallScore: number, answers: Record<number, number>) {
  const sortedPillars = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const topPillar = sortedPillars[0][0] as Category
  const secondPillar = sortedPillars[1][0] as Category
  const growthPillar = sortedPillars[sortedPillars.length - 1][0] as Category
  const secondGrowth = sortedPillars[sortedPillars.length - 2][0] as Category
  
  // Strengths based on top pillars
  const strengths = [
    `Strong ${categories[topPillar].name.toLowerCase()} foundation with consistent behavioral patterns`,
    `${categories[secondPillar].name} skills show above-average development`,
    overallScore >= 7 ? 'Overall profile indicates high athletic mindset potential' : 'Solid baseline for athletic development',
  ]
  
  // Weaknesses based on growth pillars
  const weaknesses = [
    `${categories[growthPillar].name} requires focused development`,
    `Some inconsistency in ${categories[secondGrowth].name.toLowerCase()} behaviors`,
  ]
  
  // Action steps
  const actionSteps = [
    `Prioritize ${categories[growthPillar].name.toLowerCase()} development through daily practice`,
    `Leverage your ${categories[topPillar].name.toLowerCase()} strength to build other areas`,
    'Track progress weekly with specific behavioral goals',
  ]
  
  // Pillar summaries
  const pillarSummaries: Record<Category, string> = {
    discipline: scores.discipline >= 7 
      ? 'You demonstrate strong preparation habits and commitment to your routines. Your consistency in practice attendance and focus shows maturity.'
      : 'There\'s room to strengthen your preparation habits. Focus on building consistent routines and showing up prepared for every practice.',
    ownership: scores.ownership >= 7
      ? 'You take responsibility for your performance and show strong leadership tendencies. You hold yourself accountable for both successes and setbacks.'
      : 'Developing stronger ownership of your actions will accelerate your growth. Focus on accountability and taking initiative.',
    toughness: scores.toughness >= 7
      ? 'Your mental resilience is a key strength. You handle pressure well and bounce back from adversity effectively.'
      : 'Building mental toughness will help you perform better under pressure. Practice reframing setbacks as opportunities.',
    sportsiq: scores.sportsiq >= 7
      ? 'Your game awareness and decision-making show advanced development. You read situations well and make smart choices.'
      : 'Improving situational awareness will elevate your game. Study film and focus on anticipating plays before they happen.',
  }
  
  return { strengths, weaknesses, actionSteps, pillarSummaries, topPillar, growthPillar }
}

interface PreviewReportProps {
  isGuest?: boolean
}

export function PreviewReport({ isGuest = false }: PreviewReportProps) {
  const { calculateScores, resetAssessment, answers } = useAssessmentStore()
  const [showVerify, setShowVerify] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const hasSaved = useRef(false)
  
  const scoreData = useMemo(() => calculateScores(), [answers])
  const scores = scoreData.categories
  const overallScore = scoreData.total

  useEffect(() => {
    setMounted(true)
    
    // Save assessment to database (only once, and only for logged in users)
    async function saveAssessment() {
      if (hasSaved.current || isGuest) return
      hasSaved.current = true
      
      setSaveStatus('saving')
      try {
        const response = await fetch('/api/assessment/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers,
            scores,
            overall_score: overallScore,
          }),
        })
        
        if (response.ok) {
          const data = await response.json()
          setAssessmentId(data.assessment_id)
          setSaveStatus('saved')
        } else {
          setSaveStatus('error')
        }
      } catch {
        setSaveStatus('error')
      }
    }
    
    if (Object.keys(answers).length > 0 && !isGuest) {
      saveAssessment()
    }
  }, [answers, isGuest])
  
  const insights = useMemo(() => generateInsights(scores, overallScore, answers), [scores, overallScore, answers])
  
  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          {/* System Status */}
          <div className={`space-y-3 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <TypewriterText 
              text={`>> ASSESSMENT_COMPLETE : ${isGuest ? 'SCORE_CALCULATED' : saveStatus === 'saved' ? 'DATA_SAVED' : saveStatus === 'saving' ? 'SAVING...' : 'SCORE_CALCULATED'}`}
              className="font-mono text-xs text-primary"
              speed={30}
            />
            <h1 className="text-3xl md:text-4xl font-black">Your DOTIQ Score</h1>
          </div>
          
          {/* Score Ring */}
          <div className="flex justify-center py-4">
            <ScoreRing score={overallScore} />
          </div>
          
          {/* Quick Stats */}
          <div className={`flex flex-wrap justify-center gap-3 text-sm transition-all duration-700 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <div className="px-3 py-2 bg-card border border-border rounded-lg">
              <span className="font-mono text-[10px] text-accent mr-2">[STRENGTH]</span>
              <span className="font-semibold">{categories[insights.topPillar].name}</span>
            </div>
            <div className="px-3 py-2 bg-card border border-border rounded-lg">
              <span className="font-mono text-[10px] text-chart-3 mr-2">[GROWTH]</span>
              <span className="font-semibold">{categories[insights.growthPillar].name}</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Summary Section */}
      <section className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="space-y-1">
          <TypewriterText 
            text=">> ANALYSIS_TYPE : AI_GENERATED" 
            className="font-mono text-xs text-muted-foreground"
            speed={25}
            delay={500}
          />
          <h2 className="text-xl font-black">Performance Analysis</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-sm text-accent flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              Strengths
            </h3>
            <ul className="space-y-2">
              {insights.strengths.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-accent mt-1">+</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Growth Areas */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-sm text-chart-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-chart-3" />
              Growth Areas
            </h3>
            <ul className="space-y-2">
              {insights.weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-chart-3 mt-1">-</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Action Steps */}
        <div className="bg-card border border-primary/30 rounded-lg p-4 space-y-3">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <span className="font-mono text-primary">{'>>'}</span>
            Recommended Action Steps
          </h3>
          <ol className="space-y-2">
            {insights.actionSteps.map((step, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-3">
                <span className="font-mono text-primary font-bold">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pillar Breakdown */}
      <section className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="space-y-1">
          <TypewriterText 
            text=">> METRIC_BREAKDOWN : BEHAVIORAL_SCORES" 
            className="font-mono text-xs text-muted-foreground"
            speed={25}
            delay={800}
          />
          <h2 className="text-xl font-black">Pillar Breakdown</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {(Object.keys(scores) as Category[]).map((category, i) => (
            <div key={category} className="space-y-3">
              <PillarCard category={category} score={scores[category]} delay={i * 100} />
              <p className="text-xs text-muted-foreground px-1 leading-relaxed">
                {insights.pillarSummaries[category]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Blurred Full Report Section */}
      <section className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="space-y-1">
          <TypewriterText 
            text=">> ACCESS_LEVEL : RESTRICTED" 
            className="font-mono text-xs text-destructive"
            speed={25}
            delay={1100}
          />
          <h2 className="text-xl font-black">Full Report</h2>
          <p className="text-sm text-muted-foreground">Detailed analysis, personalized action plans, and development resources</p>
        </div>
        
        {/* Blurred Content */}
        <div className="relative">
          <div className="blur-md pointer-events-none select-none space-y-4">
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <h3 className="font-bold">Detailed Discipline Analysis</h3>
              <p className="text-muted-foreground text-sm">
                Your discipline score indicates strong consistency in preparation. You demonstrate excellent habits...
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted rounded-lg p-2 text-center">
                  <div className="text-lg font-black">8.5</div>
                  <div className="text-[9px] text-muted-foreground font-mono">PREP</div>
                </div>
                <div className="bg-muted rounded-lg p-2 text-center">
                  <div className="text-lg font-black">7.8</div>
                  <div className="text-[9px] text-muted-foreground font-mono">FOCUS</div>
                </div>
                <div className="bg-muted rounded-lg p-2 text-center">
                  <div className="text-lg font-black">8.2</div>
                  <div className="text-[9px] text-muted-foreground font-mono">GRIT</div>
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-5 space-y-3">
              <h3 className="font-bold">12-Week Development Plan</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Weekly reset scripts for mental toughness</li>
                <li>• Daily ownership journal prompts</li>
                <li>• Game IQ visualization exercises</li>
              </ul>
            </div>
          </div>
          
          {/* Unlock Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background via-background/95 to-background/80">
            <div className="text-center space-y-4 p-6">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black">Unlock Full Report</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Get detailed analysis and personalized development plans.
                </p>
              </div>
              <Link
                href="/purchase"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:brightness-110 transition-all"
              >
                Unlock for $9.99
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Verify Your Score Section */}
      <section className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-card border border-border rounded-lg p-5 text-center space-y-3">
          <TypewriterText 
            text=">> VERIFICATION_AVAILABLE" 
            className="font-mono text-xs text-muted-foreground"
            speed={25}
            delay={1400}
          />
          <h3 className="text-lg font-black">Verify Your Score</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Get a verified badge by having 3 people evaluate you: a coach, a peer, and a mentor.
          </p>
          <button
            onClick={() => setShowVerify(true)}
            className="px-5 py-2 bg-muted text-foreground text-sm font-semibold rounded-lg hover:bg-muted/80 transition-colors border border-border"
          >
            Start Verification
          </button>
        </div>
      </section>

      {/* Actions */}
      <section className="max-w-3xl mx-auto px-6 py-6 flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => resetAssessment()}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Retake Assessment
        </button>
        <Link
          href="/dashboard"
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View Dashboard
        </Link>
      </section>

      {/* Verification Modal */}
      {showVerify && (
        <VerificationModal onClose={() => setShowVerify(false)} />
      )}
    </div>
  )
}

function VerificationModal({ onClose }: { onClose: () => void }) {
  const [evaluators, setEvaluators] = useState({
    coach: { name: '', phone: '' },
    peer: { name: '', phone: '' },
    mentor: { name: '', phone: '' },
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-card border border-border rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] text-muted-foreground">{'>> VERIFICATION'}</p>
            <h2 className="text-lg font-black">Send Evaluations</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          {success ? (
            <div className="text-center space-y-4 py-6">
              <div className="w-14 h-14 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Requests Sent!</h3>
                <p className="text-muted-foreground text-sm">
                  SMS messages sent. You&apos;ll be notified when evaluations are complete.
                </p>
              </div>
              <button onClick={onClose} className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Enter contact info for three evaluators.
              </p>
              
              {[
                { key: 'coach', label: 'Coach', desc: 'A coach or instructor', color: 'border-primary' },
                { key: 'peer', label: 'Peer', desc: 'A teammate', color: 'border-accent' },
                { key: 'mentor', label: 'Mentor', desc: 'An advisor', color: 'border-chart-4' },
              ].map(({ key, label, desc, color }) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-muted border-l-2 ${color} flex items-center justify-center font-bold text-xs`}>
                      {label[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{label}</h4>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={evaluators[key as keyof typeof evaluators].name}
                      onChange={(e) => setEvaluators({ ...evaluators, [key]: { ...evaluators[key as keyof typeof evaluators], name: e.target.value } })}
                      className="px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={evaluators[key as keyof typeof evaluators].phone}
                      onChange={(e) => setEvaluators({ ...evaluators, [key]: { ...evaluators[key as keyof typeof evaluators], phone: e.target.value } })}
                      className="px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                </div>
              ))}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Verification Requests'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
