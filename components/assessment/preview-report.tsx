'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAssessmentStore } from '@/lib/assessment-store'
import { categories, type Category } from '@/lib/assessment-data'

const pillarColors: Record<Category, string> = {
  discipline: 'from-green-500 to-emerald-600',
  ownership: 'from-purple-500 to-violet-600',
  toughness: 'from-orange-500 to-red-600',
  sportsiq: 'from-cyan-500 to-blue-600',
}

const pillarBorderColors: Record<Category, string> = {
  discipline: 'border-green-500/50',
  ownership: 'border-purple-500/50',
  toughness: 'border-orange-500/50',
  sportsiq: 'border-cyan-500/50',
}

function ScoreRing({ score, size = 200, strokeWidth = 12 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/30"
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
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#84cc16" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-black">{score}</span>
        <span className="text-sm text-muted-foreground font-medium">OVERALL</span>
      </div>
    </div>
  )
}

function PillarCard({ category, score, isBlurred = false }: { category: Category; score: number; isBlurred?: boolean }) {
  const info = categories[category]
  const letter = category === 'sportsiq' ? 'IQ' : category.charAt(0).toUpperCase()
  
  return (
    <div className={`bg-card border ${pillarBorderColors[category]} rounded-2xl p-6 space-y-4 ${isBlurred ? 'blur-sm' : ''}`}>
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pillarColors[category]} flex items-center justify-center text-white font-black text-xl shadow-lg`}>
          {letter}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{info.name}</h3>
          <p className="text-xs text-muted-foreground">{info.description}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black">{score}</div>
          <div className="text-xs text-muted-foreground">/ 100</div>
        </div>
      </div>
      
      {/* Score bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${pillarColors[category]} transition-all duration-1000`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

export function PreviewReport() {
  const { answers, getScores, reset } = useAssessmentStore()
  const [showVerify, setShowVerify] = useState(false)
  
  const scores = getScores()
  const overallScore = Math.round(
    (scores.discipline + scores.ownership + scores.toughness + scores.sportsiq) / 4
  )
  
  // Determine top pillar
  const sortedPillars = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const topPillar = sortedPillars[0][0] as Category
  const growthPillar = sortedPillars[sortedPillars.length - 1][0] as Category
  
  return (
    <div className="pb-24">
      {/* Hero Section with Gradient */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-fuchsia-800/20 to-cyan-700/10" />
        <div className="absolute top-0 right-0 w-[50%] h-[80%] bg-gradient-to-bl from-primary/20 via-purple-500/10 to-transparent blur-3xl" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="space-y-2">
            <p className="text-primary font-semibold text-sm tracking-wide">Assessment Complete</p>
            <h1 className="text-4xl md:text-5xl font-black">Your DOTIQ Score</h1>
          </div>
          
          <div className="flex justify-center">
            <ScoreRing score={overallScore} />
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="px-4 py-2 bg-card border border-border rounded-full">
              <span className="text-muted-foreground">Top Pillar: </span>
              <span className="font-bold text-foreground">{categories[topPillar].name}</span>
            </div>
            <div className="px-4 py-2 bg-card border border-border rounded-full">
              <span className="text-muted-foreground">Growth Area: </span>
              <span className="font-bold text-foreground">{categories[growthPillar].name}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar Breakdown - Visible */}
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black">Pillar Breakdown</h2>
          <p className="text-muted-foreground">Your scores across the four DOTIQ pillars</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {(Object.keys(scores) as Category[]).map((category) => (
            <PillarCard key={category} category={category} score={scores[category]} />
          ))}
        </div>
      </section>

      {/* Blurred Full Report Section */}
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black">Full Report</h2>
          <p className="text-muted-foreground">Detailed insights, action plans, and development resources</p>
        </div>
        
        {/* Blurred Content */}
        <div className="relative">
          <div className="blur-md pointer-events-none select-none space-y-6">
            {/* Fake detailed content */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-lg">Detailed Discipline Analysis</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your discipline score of {scores.discipline} indicates strong consistency in preparation and commitment. You demonstrate excellent habits in maintaining focus during practice and following through on commitments. Areas for potential growth include game film review and goal tracking methodology.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="text-2xl font-black">8.5</div>
                  <div className="text-xs text-muted-foreground">Preparation</div>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="text-2xl font-black">7.8</div>
                  <div className="text-xs text-muted-foreground">Consistency</div>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="text-2xl font-black">8.2</div>
                  <div className="text-xs text-muted-foreground">Focus</div>
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-lg">Personalized Action Plan</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">1</span>
                  <span>Weekly reset script for maintaining mental toughness during high-pressure situations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">2</span>
                  <span>Daily ownership journal prompts to strengthen accountability habits</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">3</span>
                  <span>Game IQ visualization exercises for improved decision-making</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-lg">Development Resources</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-bold">Mental Toughness Guide</div>
                  <div className="text-xs text-muted-foreground">12-week program</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-bold">Leadership Playbook</div>
                  <div className="text-xs text-muted-foreground">For team captains</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Unlock Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background via-background/80 to-transparent">
            <div className="text-center space-y-6 p-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black">Unlock Your Full Report</h3>
                <p className="text-muted-foreground max-w-md">
                  Get detailed analysis, personalized action plans, development resources, and more.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/purchase"
                  className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/25"
                >
                  Unlock for $19.99
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verify Your Score Section */}
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="bg-gradient-to-br from-purple-900/30 via-fuchsia-800/20 to-cyan-700/10 border border-border rounded-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black">Verify Your Score</h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Get a verified badge by having 3 people who know you well evaluate you: a coach, a peer, and a mentor. Your verified score will be the average of all evaluations.
            </p>
          </div>
          <button
            onClick={() => setShowVerify(true)}
            className="px-8 py-4 bg-card border border-border text-foreground font-bold rounded-full hover:bg-muted transition-colors"
          >
            Start Verification Process
          </button>
        </div>
      </section>

      {/* Actions */}
      <section className="max-w-4xl mx-auto px-6 py-8 flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-muted text-muted-foreground font-medium rounded-full hover:bg-muted/80 transition-colors"
        >
          Retake Assessment
        </button>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-card border border-border text-foreground font-medium rounded-full hover:bg-muted transition-colors"
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
  const [step, setStep] = useState(1)
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
      
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-black">Verify Your Score</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {success ? (
            <div className="text-center space-y-6 py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Verification Requests Sent!</h3>
                <p className="text-muted-foreground">
                  We&apos;ve sent SMS messages to your evaluators. Once all three complete their assessments, your score will be verified.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Enter the contact information for three people who can evaluate you. They&apos;ll receive an SMS with a link to complete a shorter version of the assessment about you.
              </p>
              
              {/* Coach */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">
                    C
                  </div>
                  <div>
                    <h4 className="font-bold">Coach</h4>
                    <p className="text-xs text-muted-foreground">A coach or instructor who has worked with you</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={evaluators.coach.name}
                    onChange={(e) => setEvaluators({ ...evaluators, coach: { ...evaluators.coach, name: e.target.value } })}
                    className="px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={evaluators.coach.phone}
                    onChange={(e) => setEvaluators({ ...evaluators, coach: { ...evaluators.coach, phone: e.target.value } })}
                    className="px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>
              
              {/* Peer */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                    P
                  </div>
                  <div>
                    <h4 className="font-bold">Peer</h4>
                    <p className="text-xs text-muted-foreground">A teammate or fellow athlete who knows you well</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={evaluators.peer.name}
                    onChange={(e) => setEvaluators({ ...evaluators, peer: { ...evaluators.peer, name: e.target.value } })}
                    className="px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={evaluators.peer.phone}
                    onChange={(e) => setEvaluators({ ...evaluators, peer: { ...evaluators.peer, phone: e.target.value } })}
                    className="px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>
              
              {/* Mentor */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                    M
                  </div>
                  <div>
                    <h4 className="font-bold">Mentor</h4>
                    <p className="text-xs text-muted-foreground">A parent, teacher, or trusted adult mentor</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={evaluators.mentor.name}
                    onChange={(e) => setEvaluators({ ...evaluators, mentor: { ...evaluators.mentor, name: e.target.value } })}
                    className="px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={evaluators.mentor.phone}
                    onChange={(e) => setEvaluators({ ...evaluators, mentor: { ...evaluators.mentor, phone: e.target.value } })}
                    className="px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
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
