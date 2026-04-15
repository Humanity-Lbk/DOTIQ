'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAssessmentStore } from '@/lib/assessment-store'
import { categories, type Category } from '@/lib/assessment-data'

function ScoreRing({ score, size = 220, strokeWidth = 10 }: { score: number; size?: number; strokeWidth?: number }) {
  const [animated, setAnimated] = useState(false)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = animated ? circumference - (score / 100) * circumference : circumference
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="relative animate-scale-in" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-border"
        />
        {/* Progress circle */}
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
            <stop offset="0%" stopColor="#DAA520" />
            <stop offset="100%" stopColor="#F0C050" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-7xl font-black animate-fade-in delay-500">{score}</span>
        <span className="text-xs font-mono text-muted-foreground tracking-widest mt-1">DOTIQ SCORE</span>
      </div>
    </div>
  )
}

function PillarCard({ category, score, delay = 0 }: { category: Category; score: number; delay?: number }) {
  const [animated, setAnimated] = useState(false)
  const info = categories[category]
  const letter = category === 'sportsiq' ? 'IQ' : category.charAt(0).toUpperCase()
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  
  return (
    <div 
      className="card-premium bg-card border border-border rounded-lg p-5 space-y-4 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-muted border-l-2 border-primary flex items-center justify-center">
          <span className="font-black text-lg">{letter}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] text-muted-foreground tracking-wider">BEHAVIORAL</div>
          <h3 className="font-bold text-sm truncate">{info.name.toUpperCase()}</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black">{score}</div>
          <div className="text-[10px] text-muted-foreground font-mono">/ 100</div>
        </div>
      </div>
      
      {/* Score bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-1000 ease-out"
          style={{ width: animated ? `${score}%` : '0%' }}
        />
      </div>
      
      <p className="text-xs text-muted-foreground leading-relaxed">{info.description}</p>
    </div>
  )
}

export function PreviewReport() {
  const { calculateScores, resetAssessment } = useAssessmentStore()
  const [showVerify, setShowVerify] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const scoreData = calculateScores()
  const scores = scoreData.categories
  const overallScore = scoreData.total
  
  // Determine top pillar
  const sortedPillars = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const topPillar = sortedPillars[0][0] as Category
  const growthPillar = sortedPillars[sortedPillars.length - 1][0] as Category
  
  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-8">
          {/* Status */}
          <div className={`space-y-2 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="font-mono text-xs text-primary inline-flex items-center gap-2">
              <span className="status-dot status-active" />
              ASSESSMENT COMPLETE
            </p>
            <h1 className="text-3xl md:text-5xl font-black">Your DOTIQ Score</h1>
          </div>
          
          {/* Score Ring */}
          <div className="flex justify-center">
            <ScoreRing score={overallScore} />
          </div>
          
          {/* Quick Stats */}
          <div className={`flex flex-wrap justify-center gap-4 text-sm transition-all duration-700 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <div className="px-4 py-2.5 bg-card border border-border rounded-lg">
              <span className="font-mono text-[10px] text-muted-foreground mr-2">[STRENGTH]</span>
              <span className="font-bold">{categories[topPillar].name}</span>
            </div>
            <div className="px-4 py-2.5 bg-card border border-border rounded-lg">
              <span className="font-mono text-[10px] text-muted-foreground mr-2">[GROWTH]</span>
              <span className="font-bold">{categories[growthPillar].name}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar Breakdown */}
      <section className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <h2 className="text-xl font-black">Pillar Breakdown</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {(Object.keys(scores) as Category[]).map((category, i) => (
            <PillarCard key={category} category={category} score={scores[category]} delay={i * 150} />
          ))}
        </div>
      </section>

      {/* Blurred Full Report Section */}
      <section className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black">Full Report</h2>
          <p className="text-sm text-muted-foreground">Detailed insights, action plans, and development resources</p>
        </div>
        
        {/* Blurred Content */}
        <div className="relative">
          <div className="blur-md pointer-events-none select-none space-y-4">
            {/* Fake detailed content */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 className="font-bold">Detailed Discipline Analysis</h3>
              <p className="text-muted-foreground text-sm">
                Your discipline score of {scores.discipline} indicates strong consistency in preparation and commitment. You demonstrate excellent habits in maintaining focus during practice and following through on commitments.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-xl font-black">8.5</div>
                  <div className="text-[10px] text-muted-foreground font-mono">PREPARATION</div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-xl font-black">7.8</div>
                  <div className="text-[10px] text-muted-foreground font-mono">CONSISTENCY</div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-xl font-black">8.2</div>
                  <div className="text-[10px] text-muted-foreground font-mono">FOCUS</div>
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 className="font-bold">Personalized Action Plan</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Weekly reset script for maintaining mental toughness</li>
                <li>• Daily ownership journal prompts</li>
                <li>• Game IQ visualization exercises</li>
              </ul>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 className="font-bold">Development Resources</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-sm font-bold">Mental Toughness Guide</div>
                  <div className="text-xs text-muted-foreground">12-week program</div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-sm font-bold">Leadership Playbook</div>
                  <div className="text-xs text-muted-foreground">For team captains</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Unlock Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background via-background/90 to-background/50">
            <div className="text-center space-y-6 p-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-glow-pulse">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black">Unlock Your Full Report</h3>
                <p className="text-muted-foreground max-w-md text-sm">
                  Get detailed analysis, personalized action plans, and development resources.
                </p>
              </div>
              <Link
                href="/purchase"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:scale-105 transition-all duration-300 animate-glow-pulse"
              >
                Unlock for $19.99
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Verify Your Score Section */}
      <section className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-card border border-border rounded-lg p-6 text-center space-y-4">
          <h3 className="text-lg font-black">Verify Your Score</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Get a verified badge by having 3 people evaluate you: a coach, a peer, and a mentor.
          </p>
          <button
            onClick={() => setShowVerify(true)}
            className="px-5 py-2.5 bg-muted text-foreground text-sm font-semibold rounded-lg hover:bg-muted/80 transition-colors border border-border"
          >
            Start Verification
          </button>
        </div>
      </section>

      {/* Actions */}
      <section className="max-w-3xl mx-auto px-6 py-8 flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => resetAssessment()}
          className="px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Retake Assessment
        </button>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
    
    // TODO: Implement actual SMS sending via API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-card border border-border rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">{'>> VERIFICATION'}</p>
            <h2 className="text-lg font-black">Send Evaluations</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-5">
          {success ? (
            <div className="text-center space-y-6 py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Requests Sent!</h3>
                <p className="text-muted-foreground text-sm">
                  SMS messages sent to your evaluators. You&apos;ll be notified when they complete their assessments.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-xs text-muted-foreground">
                Enter contact info for three evaluators. They&apos;ll receive an SMS with a link to evaluate you.
              </p>
              
              {/* Coach */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted border-l-2 border-orange-500 flex items-center justify-center font-bold text-sm">
                    C
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Coach</h4>
                    <p className="text-[10px] text-muted-foreground">A coach or instructor</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={evaluators.coach.name}
                    onChange={(e) => setEvaluators({ ...evaluators, coach: { ...evaluators.coach, name: e.target.value } })}
                    className="px-3 py-2.5 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={evaluators.coach.phone}
                    onChange={(e) => setEvaluators({ ...evaluators, coach: { ...evaluators.coach, phone: e.target.value } })}
                    className="px-3 py-2.5 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>
              
              {/* Peer */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted border-l-2 border-green-500 flex items-center justify-center font-bold text-sm">
                    P
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Peer</h4>
                    <p className="text-[10px] text-muted-foreground">A teammate or fellow athlete</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={evaluators.peer.name}
                    onChange={(e) => setEvaluators({ ...evaluators, peer: { ...evaluators.peer, name: e.target.value } })}
                    className="px-3 py-2.5 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={evaluators.peer.phone}
                    onChange={(e) => setEvaluators({ ...evaluators, peer: { ...evaluators.peer, phone: e.target.value } })}
                    className="px-3 py-2.5 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>
              
              {/* Mentor */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted border-l-2 border-purple-500 flex items-center justify-center font-bold text-sm">
                    M
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Mentor</h4>
                    <p className="text-[10px] text-muted-foreground">A trusted advisor or family member</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={evaluators.mentor.name}
                    onChange={(e) => setEvaluators({ ...evaluators, mentor: { ...evaluators.mentor, name: e.target.value } })}
                    className="px-3 py-2.5 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={evaluators.mentor.phone}
                    onChange={(e) => setEvaluators({ ...evaluators, mentor: { ...evaluators.mentor, phone: e.target.value } })}
                    className="px-3 py-2.5 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
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
