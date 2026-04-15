'use client'

import Link from 'next/link'
import { categories, type Category } from '@/lib/assessment-data'
import Header from '@/components/header'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
}

interface Assessment {
  id: string
  scores: Record<string, number>
  overall_score: number
  is_complete: boolean
  is_verified: boolean
  verified_score: number | null
  purchased_at: string | null
  created_at: string
}

interface Verification {
  id: string
  assessment_id: string
  evaluator_type: string
  evaluator_name: string | null
  status: string
  overall_score: number | null
}

interface DashboardContentProps {
  user: User
  profile: Profile | null
  assessments: Assessment[]
  verifications: Verification[]
}

const pillarColors: Record<Category, string> = {
  discipline: 'from-primary to-yellow-600',
  ownership: 'from-accent to-green-600',
  toughness: 'from-chart-3 to-red-600',
  sportsiq: 'from-chart-4 to-blue-600',
}

function ScoreRing({ score, size = 120, strokeWidth = 8 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  // Score is now 1-10 scale
  const percentage = (score / 10) * 100
  const offset = circumference - (percentage / 100) * circumference
  
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
          stroke="url(#dashboardGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="dashboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CD9B32" />
            <stop offset="100%" stopColor="#E8B95A" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black">{score.toFixed(1)}</span>
        <span className="text-[9px] text-muted-foreground font-mono">/ 10</span>
      </div>
    </div>
  )
}

export function DashboardContent({ user, profile, assessments, verifications }: DashboardContentProps) {
  const latestAssessment = assessments[0]
  const hasAssessments = assessments.length > 0
  
  const getVerificationsForAssessment = (assessmentId: string) => {
    return verifications.filter(v => v.assessment_id === assessmentId)
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <section className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-muted-foreground">
            {hasAssessments 
              ? 'Track your progress and view your DOTIQ scores'
              : 'Start your journey by taking the DOTIQ Assessment'
            }
          </p>
        </section>

        {hasAssessments ? (
          <>
            {/* Latest Assessment Summary */}
            <section className="mb-12">
              <div className="bg-gradient-to-br from-purple-900/30 via-fuchsia-800/20 to-cyan-700/10 border border-border rounded-2xl p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <ScoreRing score={latestAssessment.is_verified ? (latestAssessment.verified_score || latestAssessment.overall_score) : latestAssessment.overall_score} />
                  
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <h2 className="text-2xl font-black">Latest DOTIQ Score</h2>
                        {latestAssessment.is_verified && (
                          <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-xs text-primary font-bold flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Taken on {new Date(latestAssessment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      {latestAssessment.purchased_at ? (
                        <Link
                          href={`/report/${latestAssessment.id}`}
                          className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:scale-105 transition-transform"
                        >
                          View Full Report
                        </Link>
                      ) : (
                        <Link
                          href="/purchase"
                          className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:scale-105 transition-transform"
                        >
                          Unlock Full Report
                        </Link>
                      )}
                      <Link
                        href="/assessment"
                        className="px-6 py-3 bg-card border border-border font-medium rounded-full hover:bg-muted transition-colors"
                      >
                        Retake Assessment
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Pillar Scores */}
            <section className="mb-12">
              <h2 className="text-xl font-black mb-6">Pillar Breakdown</h2>
              <div className="grid md:grid-cols-4 gap-4">
                {(Object.keys(latestAssessment.scores || {}) as Category[]).map((category) => {
                  const score = latestAssessment.scores[category]
                  const letter = category === 'sportsiq' ? 'IQ' : category.charAt(0).toUpperCase()
                  
                  const percentage = (score / 10) * 100
                  return (
                    <div key={category} className="bg-card border border-border rounded-2xl p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pillarColors[category]} flex items-center justify-center text-white font-bold text-sm`}>
                          {letter}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{categories[category].name}</h3>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black">{score.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">/ 10</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${pillarColors[category]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Verification Status */}
            <section className="mb-12">
              <h2 className="text-xl font-black mb-6">Verification Status</h2>
              <div className="bg-card border border-border rounded-2xl p-6">
                {(() => {
                  const latestVerifications = getVerificationsForAssessment(latestAssessment.id)
                  const completedCount = latestVerifications.filter(v => v.status === 'completed').length
                  
                  if (latestAssessment.is_verified) {
                    return (
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold">Score Verified</h3>
                          <p className="text-sm text-muted-foreground">
                            All 3 evaluations completed. Your verified score is {latestAssessment.verified_score?.toFixed(1)}.
                          </p>
                        </div>
                      </div>
                    )
                  }
                  
                  if (latestVerifications.length === 0) {
                    return (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold">Not Started</h3>
                            <p className="text-sm text-muted-foreground">
                              Get your score verified by 3 people who know you well.
                            </p>
                          </div>
                        </div>
                        <button className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors">
                          Start Verification
                        </button>
                      </div>
                    )
                  }
                  
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold">In Progress</h3>
                          <p className="text-sm text-muted-foreground">
                            {completedCount} of 3 evaluations completed
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-primary">{completedCount}/3</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {['coach', 'peer', 'mentor'].map((type) => {
                          const verification = latestVerifications.find(v => v.evaluator_type === type)
                          const isComplete = verification?.status === 'completed'
                          
                          return (
                            <div key={type} className={`p-4 rounded-xl text-center ${isComplete ? 'bg-primary/10' : 'bg-muted'}`}>
                              <p className="font-bold capitalize text-sm">{type}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {isComplete ? 'Complete' : verification ? 'Pending' : 'Not sent'}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
              </div>
            </section>

            {/* Assessment History */}
            {assessments.length > 1 && (
              <section>
                <h2 className="text-xl font-black mb-6">Assessment History</h2>
                <div className="space-y-4">
                  {assessments.slice(1).map((assessment) => (
                    <div key={assessment.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center font-black text-lg">
                          {assessment.overall_score.toFixed(1)}
                        </div>
                        <div>
                          <p className="font-medium">{new Date(assessment.created_at).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {assessment.purchased_at ? 'Full report unlocked' : 'Preview only'}
                          </p>
                        </div>
                      </div>
                      {assessment.purchased_at && (
                        <Link
                          href={`/report/${assessment.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          View Report
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          /* No Assessments State */
          <section className="text-center py-16">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-black">Take Your First Assessment</h2>
              <p className="text-muted-foreground">
                Discover your DOTIQ score and unlock insights into your athletic mindset across all four pillars.
              </p>
              <Link
                href="/assessment"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:scale-105 transition-transform"
              >
                Start Assessment
                <span>→</span>
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 mt-12">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <p className="font-mono text-xs text-muted-foreground">D · O · T · IQ</p>
        </div>
      </footer>
    </div>
  )
}
