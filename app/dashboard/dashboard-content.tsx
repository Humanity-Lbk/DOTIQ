'use client'

import Link from 'next/link'
import Image from 'next/image'
import { categories, type Category } from '@/lib/assessment-data'
import Header from '@/components/header'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role?: 'user' | 'admin' | 'super_admin'
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

const pillarConfig: Record<Category, { letter: string; color: string; bg: string; border: string; glow: string }> = {
  discipline: { letter: 'D', color: 'text-primary', bg: 'bg-primary/15', border: 'border-primary/50', glow: 'shadow-primary/20' },
  ownership: { letter: 'O', color: 'text-emerald-400', bg: 'bg-emerald-400/15', border: 'border-emerald-400/50', glow: 'shadow-emerald-400/20' },
  toughness: { letter: 'T', color: 'text-rose-400', bg: 'bg-rose-400/15', border: 'border-rose-400/50', glow: 'shadow-rose-400/20' },
  sportsiq: { letter: 'IQ', color: 'text-cyan-400', bg: 'bg-cyan-400/15', border: 'border-cyan-400/50', glow: 'shadow-cyan-400/20' },
}

const premiumVideos = [
  { id: 1, title: 'The Discipline Code', speaker: 'Marcus Thompson', duration: '18:42', image: '/images/videos/discipline-ep.jpg', color: 'border-primary/40' },
  { id: 2, title: 'Own Your Game', speaker: 'Coach Sarah Chen', duration: '24:15', image: '/images/videos/ownership-ep.jpg', color: 'border-emerald-400/40' },
  { id: 3, title: 'Built Different', speaker: 'Derek Williams', duration: '21:08', image: '/images/videos/toughness-ep.jpg', color: 'border-rose-400/40' },
  { id: 4, title: 'Read The Game', speaker: 'Tony Reyes', duration: '19:33', image: '/images/videos/sportsiq-ep.jpg', color: 'border-cyan-400/40' },
]

const programs = [
  { pillar: 'discipline', name: 'Discipline', desc: 'Build habits that outlast motivation', price: '$149', color: 'border-primary/50', bg: 'bg-primary/10', accent: 'text-primary' },
  { pillar: 'ownership', name: 'Ownership', desc: 'Take full accountability for outcomes', price: '$149', color: 'border-emerald-400/50', bg: 'bg-emerald-400/10', accent: 'text-emerald-400' },
  { pillar: 'toughness', name: 'Toughness', desc: 'Develop mental resilience', price: '$149', color: 'border-rose-400/50', bg: 'bg-rose-400/10', accent: 'text-rose-400' },
  { pillar: 'sportsiq', name: 'Sports IQ', desc: 'Sharpen decision-making speed', price: '$149', color: 'border-cyan-400/50', bg: 'bg-cyan-400/10', accent: 'text-cyan-400' },
]

const premiumApparel = [
  { id: 1, name: 'Elite Cap', price: '$42', image: '/images/apparel/hat-gold.jpg', tag: 'NEW', tagColor: 'bg-primary text-primary-foreground' },
  { id: 2, name: 'Neon Hoodie', price: '$85', image: '/images/apparel/hoodie-neon.jpg', tag: 'HOT', tagColor: 'bg-rose-500 text-white' },
  { id: 3, name: 'Graphic Tee', price: '$38', image: '/images/apparel/tshirt-pattern.jpg', tag: null, tagColor: '' },
  { id: 4, name: 'Performance Socks', price: '$18', image: '/images/apparel/socks-bright.jpg', tag: null, tagColor: '' },
]

function ScoreRing({ score, size = 120, strokeWidth = 8 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
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
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.6)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black">{score.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">/ 10</span>
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

      {/* Grid background */}
      <div className="fixed inset-0 grid-subtle pointer-events-none" />

      <main className="relative max-w-5xl mx-auto px-6 py-12">
        {/* Welcome */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">Dashboard</span>
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-lg text-muted-foreground">
            {hasAssessments 
              ? 'Your athletic intelligence at a glance.'
              : 'Begin your journey to understanding what sets you apart.'
            }
          </p>
        </section>

        {hasAssessments ? (
          <>
            {/* Score Card */}
            <section className="mb-10">
              <div className="p-8 bg-card/50 backdrop-blur-sm border border-border rounded-2xl">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <ScoreRing score={latestAssessment.is_verified ? (latestAssessment.verified_score || latestAssessment.overall_score) : latestAssessment.overall_score} />
                  
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                      <h2 className="text-2xl font-black">Your DOTIQ Score</h2>
                      {latestAssessment.is_verified && (
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Assessed on {new Date(latestAssessment.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      {latestAssessment.purchased_at ? (
                        <Link
                          href={`/report/${latestAssessment.id}`}
                          className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          View Full Report
                        </Link>
                      ) : (
                        <Link
                          href="/purchase"
                          className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Unlock Full Report
                        </Link>
                      )}
                      <Link
                        href="/assessment"
                        className="px-5 py-2.5 bg-muted hover:bg-muted/80 font-medium rounded-lg transition-colors"
                      >
                        Retake Assessment
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Pillar Breakdown */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold mb-4">Pillar Breakdown</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(Object.keys(latestAssessment.scores || {}) as Category[]).map((category) => {
                  const score = latestAssessment.scores[category]
                  const config = pillarConfig[category]
                  const percentage = (score / 10) * 100
                  
                  return (
                    <div key={category} className={`p-5 ${config.bg} border ${config.border} hover:shadow-lg ${config.glow} rounded-xl transition-all duration-300`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center`}>
                          <span className={`font-bold text-sm ${config.color}`}>{config.letter}</span>
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${config.color}`}>{categories[category].name}</p>
                          <p className="text-xl font-black">{score.toFixed(1)}</p>
                        </div>
                      </div>
                      <div className="h-2 bg-background/30 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            category === 'discipline' ? 'bg-primary' :
                            category === 'ownership' ? 'bg-emerald-400' :
                            category === 'toughness' ? 'bg-rose-400' : 'bg-cyan-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Verification Status */}
            <section className="mb-10">
              <h2 className="text-lg font-semibold mb-4">Verification</h2>
              <div className="p-6 bg-card/50 backdrop-blur-sm border border-border rounded-xl">
                {(() => {
                  const latestVerifications = getVerificationsForAssessment(latestAssessment.id)
                  const completedCount = latestVerifications.filter(v => v.status === 'completed').length
                  
                  if (latestAssessment.is_verified) {
                    return (
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold">Score Verified</p>
                          <p className="text-sm text-muted-foreground">
                            All 3 evaluations complete. Verified score: {latestAssessment.verified_score?.toFixed(1)}
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
                            <p className="font-semibold">Not Started</p>
                            <p className="text-sm text-muted-foreground">
                              Get your score verified by 3 people who know you well.
                            </p>
                          </div>
                        </div>
                        <button className="px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors">
                          Start Verification
                        </button>
                      </div>
                    )
                  }
                  
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">In Progress</p>
                          <p className="text-sm text-muted-foreground">{completedCount} of 3 evaluations completed</p>
                        </div>
                        <span className="text-2xl font-black text-primary">{completedCount}/3</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {['coach', 'peer', 'mentor'].map((type) => {
                          const verification = latestVerifications.find(v => v.evaluator_type === type)
                          const isComplete = verification?.status === 'completed'
                          
                          return (
                            <div key={type} className={`p-3 rounded-lg text-center ${isComplete ? 'bg-primary/10' : 'bg-muted'}`}>
                              <p className="font-medium capitalize text-sm">{type}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
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
              <section className="mb-10">
                <h2 className="text-lg font-semibold mb-4">History</h2>
                <div className="space-y-2">
                  {assessments.slice(1).map((assessment) => (
                    <div key={assessment.id} className="p-4 bg-card/50 backdrop-blur-sm border border-border rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center font-black">
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
                        <Link href={`/report/${assessment.id}`} className="text-sm text-primary hover:underline">
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
          /* Empty State */
          <section className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-black mb-3">Take Your First Assessment</h2>
              <p className="text-muted-foreground mb-6">
                Discover your DOTIQ score and unlock insights into your athletic mindset.
              </p>
              <Link
                href="/assessment"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Start Assessment
                <span>→</span>
              </Link>
            </div>
          </section>
        )}

        {/* Premium Content - Available to ALL users */}
        <>
          {/* Programs */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs text-primary font-medium">DOTIQ+</span>
                  <h2 className="text-lg font-semibold">8-Week Programs</h2>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {programs.map((program) => (
                  <div key={program.pillar} className={`p-5 ${program.bg} border-2 ${program.color} rounded-xl hover:scale-[1.02] hover:shadow-lg transition-all cursor-pointer group`}>
                    <div className={`w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center mb-3`}>
                      <span className={`font-bold text-xs ${program.accent}`}>
                        {program.pillar === 'sportsiq' ? 'IQ' : program.name.charAt(0)}
                      </span>
                    </div>
                    <p className={`text-sm font-semibold mb-1 ${program.accent}`}>{program.name}</p>
                    <p className="text-xs text-muted-foreground mb-3">{program.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">8 weeks</span>
                      <span className={`font-bold ${program.accent}`}>{program.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Videos */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs text-muted-foreground font-medium">DOTIQ TV</span>
                  <h2 className="text-lg font-semibold">Premium Content</h2>
                </div>
                <Link href="#" className="text-sm text-primary hover:underline">Browse All →</Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {premiumVideos.map((video) => (
                  <div key={video.id} className="group cursor-pointer">
                    <div className={`relative aspect-video rounded-lg overflow-hidden border ${video.color} mb-2`}>
                      <Image 
                        src={video.image} 
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className="absolute bottom-2 left-2 text-xs text-white/80">{video.duration}</span>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                          <svg className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{video.speaker}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Apparel */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs text-rose-400 font-medium">SHOP</span>
                  <h2 className="text-lg font-semibold">DOTIQ Apparel</h2>
                </div>
                <Link href="#" className="text-sm text-primary hover:underline">Shop All →</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {premiumApparel.map((item) => (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-card border border-border group-hover:border-primary/50 transition-colors mb-2">
                      <Image 
                        src={item.image} 
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.tag && (
                        <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded ${item.tagColor}`}>
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.price}</p>
                  </div>
                ))}
              </div>
            </section>
        </>
      </main>
    </div>
  )
}
