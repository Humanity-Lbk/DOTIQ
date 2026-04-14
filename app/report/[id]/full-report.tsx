'use client'

import Link from 'next/link'
import { categories, type Category } from '@/lib/assessment-data'

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

interface FullReportProps {
  assessment: Assessment
  verifications: Verification[]
  userName: string
}

const pillarColors: Record<Category, string> = {
  discipline: 'from-green-500 to-emerald-600',
  ownership: 'from-purple-500 to-violet-600',
  toughness: 'from-orange-500 to-red-600',
  sportsiq: 'from-cyan-500 to-blue-600',
}

const getScoreLevel = (score: number): { label: string; color: string } => {
  if (score >= 90) return { label: 'Elite', color: 'text-primary' }
  if (score >= 80) return { label: 'Excellent', color: 'text-green-500' }
  if (score >= 70) return { label: 'Strong', color: 'text-cyan-500' }
  if (score >= 60) return { label: 'Developing', color: 'text-yellow-500' }
  return { label: 'Growth Area', color: 'text-orange-500' }
}

const actionPlanItems: Record<Category, string[]> = {
  discipline: [
    'Create a daily pre-practice routine checklist',
    'Set 3 specific weekly training goals and track completion',
    'Review game film for 15 minutes after each competition',
    'Establish a consistent sleep and nutrition schedule',
  ],
  ownership: [
    'After each mistake, verbalize what you will do differently',
    'Give one genuine compliment to a teammate daily',
    'Ask your coach for specific feedback weekly',
    'Lead a 5-minute team warm-up once per week',
  ],
  toughness: [
    'Practice the "3 breath reset" after errors (3 deep breaths, refocus)',
    'Create a personal mantra for pressure situations',
    'Visualize successful performances for 5 minutes daily',
    'Train in uncomfortable conditions intentionally once per week',
  ],
  sportsiq: [
    'Watch professional games and predict plays before they happen',
    'Ask "what if" questions about different game scenarios',
    'Study opponent tendencies before competitions',
    'Communicate more during practice - call out plays and situations',
  ],
}

function ScoreRing({ score, size = 180, strokeWidth = 10 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
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
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGradientFull" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#84cc16" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black">{score}</span>
        <span className="text-xs text-muted-foreground font-medium">OVERALL</span>
      </div>
    </div>
  )
}

export function FullReport({ assessment, verifications, userName }: FullReportProps) {
  const scores = assessment.scores as Record<Category, number>
  const sortedPillars = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const topPillar = sortedPillars[0][0] as Category
  const growthPillar = sortedPillars[sortedPillars.length - 1][0] as Category
  
  const completedVerifications = verifications.filter(v => v.status === 'completed')
  const displayScore = assessment.is_verified ? (assessment.verified_score || assessment.overall_score) : assessment.overall_score
  
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm">D</span>
            </div>
            <span className="font-bold">DOTIQ</span>
          </Link>
          <Link 
            href="/dashboard" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>
      
      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-fuchsia-800/20 to-cyan-700/10" />
        <div className="absolute top-0 right-0 w-[50%] h-[80%] bg-gradient-to-bl from-primary/20 via-purple-500/10 to-transparent blur-3xl" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="space-y-2">
            <p className="text-primary font-semibold text-sm tracking-wide">Full Report</p>
            <h1 className="text-4xl md:text-5xl font-black">{userName}&apos;s DOTIQ Report</h1>
            <p className="text-muted-foreground">
              Generated on {new Date(assessment.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex justify-center">
            <ScoreRing score={displayScore} />
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-4 py-2 bg-card border border-border rounded-full text-sm">
              <span className="text-muted-foreground">Top Pillar: </span>
              <span className="font-bold">{categories[topPillar].name}</span>
            </div>
            <div className="px-4 py-2 bg-card border border-border rounded-full text-sm">
              <span className="text-muted-foreground">Growth Area: </span>
              <span className="font-bold">{categories[growthPillar].name}</span>
            </div>
            {assessment.is_verified && (
              <div className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary font-bold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verified Score
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Detailed Pillar Analysis */}
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <h2 className="text-2xl font-black text-center">Detailed Pillar Analysis</h2>
        
        <div className="space-y-6">
          {(Object.keys(scores) as Category[]).map((category) => {
            const score = scores[category]
            const level = getScoreLevel(score)
            const letter = category === 'sportsiq' ? 'IQ' : category.charAt(0).toUpperCase()
            
            return (
              <div key={category} className="bg-card border border-border rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${pillarColors[category]} flex items-center justify-center text-white font-black text-2xl shadow-lg`}>
                    {letter}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold">{categories[category].name}</h3>
                      <span className={`text-sm font-semibold ${level.color}`}>{level.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{categories[category].description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black">{score}</div>
                    <div className="text-xs text-muted-foreground">/ 100</div>
                  </div>
                </div>
                
                {/* Score bar */}
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${pillarColors[category]} transition-all duration-1000`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                
                {/* Analysis text */}
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {score >= 80 ? (
                      <>Your {categories[category].name.toLowerCase()} score of {score} indicates exceptional strength in this area. You consistently demonstrate the behaviors and habits that define elite performers. Continue to refine and maintain these strengths while helping teammates develop in this area.</>
                    ) : score >= 60 ? (
                      <>Your {categories[category].name.toLowerCase()} score of {score} shows solid development with room for growth. You have a good foundation but can elevate to the next level by focusing on consistency and pushing through comfort zones.</>
                    ) : (
                      <>Your {categories[category].name.toLowerCase()} score of {score} highlights a significant growth opportunity. This pillar represents your biggest potential for improvement. Focus your development efforts here for maximum impact on your overall performance.</>
                    )}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Action Plan */}
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black">Your Personalized Action Plan</h2>
          <p className="text-muted-foreground">Based on your scores, focus on these development areas</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {(Object.keys(actionPlanItems) as Category[]).map((category) => {
            const score = scores[category]
            const isPriority = category === growthPillar
            
            return (
              <div 
                key={category} 
                className={`bg-card border rounded-2xl p-6 space-y-4 ${isPriority ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border'}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{categories[category].name}</h3>
                  {isPriority && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded">
                      Priority
                    </span>
                  )}
                </div>
                
                <ul className="space-y-3">
                  {actionPlanItems[category].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      {/* Verification Status */}
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black">Verification Status</h2>
          <p className="text-muted-foreground">
            {assessment.is_verified 
              ? 'Your score has been verified by 3 evaluators'
              : `${completedVerifications.length} of 3 evaluations completed`
            }
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {['coach', 'peer', 'mentor'].map((type) => {
            const verification = verifications.find(v => v.evaluator_type === type)
            const isComplete = verification?.status === 'completed'
            
            return (
              <div key={type} className="bg-card border border-border rounded-2xl p-6 text-center space-y-3">
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
                  <div className="text-2xl font-black text-primary">{verification.overall_score}</div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Resources */}
      <section className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black">Development Resources</h2>
          <p className="text-muted-foreground">Tools to support your athletic journey</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-900/30 via-fuchsia-800/20 to-cyan-700/10 border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg">Mental Toughness Guide</h3>
            <p className="text-sm text-muted-foreground">
              A 12-week program designed to build mental resilience, focus, and composure under pressure.
            </p>
            <button className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm">
              Coming Soon
            </button>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/30 via-emerald-800/20 to-cyan-700/10 border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg">Leadership Playbook</h3>
            <p className="text-sm text-muted-foreground">
              Develop ownership and leadership skills with exercises designed for team captains.
            </p>
            <button className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm">
              Coming Soon
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 bg-card/30 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm">D</span>
            </div>
            <span className="font-bold">DOTIQ</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Discipline · Ownership · Toughness · IQ
          </p>
        </div>
      </footer>
    </div>
  )
}
