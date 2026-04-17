'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { categories, type Category } from '@/lib/assessment-data'
import { RequestVerificationModal } from '@/components/verification/request-verification-modal'
import { PurchaseModal } from '@/components/purchase/purchase-modal'
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

interface SubmittedEvaluation {
  id: string
  assessment_id: string
  evaluator_type: string
  athlete_name: string | null
  status: string
  overall_score: number | null
  completed_at: string | null
  scores: Record<string, number> | null
}

interface DashboardContentProps {
  user: User
  profile: Profile | null
  latestAssessment: Assessment | null
  verifications: Verification[]
  submittedEvaluations: SubmittedEvaluation[]
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
  { pillar: 'discipline', name: 'Discipline', desc: 'Build habits that outlast motivation', price: '$10', color: 'border-primary/50', bg: 'bg-primary/10', accent: 'text-primary' },
  { pillar: 'ownership', name: 'Ownership', desc: 'Take full accountability for outcomes', price: '$10', color: 'border-emerald-400/50', bg: 'bg-emerald-400/10', accent: 'text-emerald-400' },
  { pillar: 'toughness', name: 'Toughness', desc: 'Develop mental resilience', price: '$10', color: 'border-rose-400/50', bg: 'bg-rose-400/10', accent: 'text-rose-400' },
  { pillar: 'sportsiq', name: 'Sports IQ', desc: 'Sharpen decision-making speed', price: '$10', color: 'border-cyan-400/50', bg: 'bg-cyan-400/10', accent: 'text-cyan-400' },
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

export function DashboardContent({ user, profile, latestAssessment, verifications, submittedEvaluations }: DashboardContentProps) {
  const router = useRouter()
  const [verificationModalOpen, setVerificationModalOpen] = useState(false)
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null)
  const [selectedAssessmentScore, setSelectedAssessmentScore] = useState<number>(0)

  const hasAssessments = !!latestAssessment
  const hasSubmittedEvaluations = submittedEvaluations.length > 0
  
  const openVerificationModal = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId)
    setVerificationModalOpen(true)
  }
  
  const openPurchaseModal = (assessmentId: string, score: number) => {
    setSelectedAssessmentId(assessmentId)
    setSelectedAssessmentScore(score)
    setPurchaseModalOpen(true)
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Grid background */}
      <div className="fixed inset-0 grid-subtle pointer-events-none" />

      <main className="relative max-w-5xl mx-auto px-6 md:px-8 lg:px-12 py-10 md:py-12">
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

        {hasAssessments && latestAssessment ? (
          <>
            {/* Latest Assessment */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs text-primary font-medium tracking-wider">ASSESSMENTS</span>
                  <h2 className="text-lg font-semibold">Latest Assessment</h2>
                </div>
                {(() => {
                  const THREE_MONTHS_MS = 1000 * 60 * 60 * 24 * 90
                  const lastDate = new Date(latestAssessment.created_at).getTime()
                  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin' || user.email === 'trey@gethumanity.ai'
                  const canRetake = isAdmin || (Date.now() - lastDate >= THREE_MONTHS_MS)
                  const nextEligible = new Date(lastDate + THREE_MONTHS_MS)
                  return canRetake ? (
                    <Link
                      href="/assessment"
                      className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Take New Assessment
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                      <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10M8 11V7a4 4 0 018 0v4M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z" />
                      </svg>
                      <span className="text-xs text-muted-foreground font-medium">
                        Unlocks {nextEligible.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )
                })()}
              </div>

              {(() => {
                const completedVerifications = verifications.filter(v => v.status === 'completed').length
                const displayScore = latestAssessment.is_verified
                  ? (latestAssessment.verified_score ?? latestAssessment.overall_score)
                  : latestAssessment.overall_score

                return (
                  <Link
                    href={`/report/${latestAssessment.id}`}
                    className="block p-6 bg-card/50 backdrop-blur-sm border-2 border-primary/40 rounded-2xl transition-all duration-200 hover:bg-card/70 cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                      <div className="shrink-0">
                        <ScoreRing score={displayScore} size={96} strokeWidth={7} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-2.5 py-1 bg-primary/15 text-primary text-[11px] font-bold rounded-full">
                            LATEST
                          </span>
                          {latestAssessment.is_verified && (
                            <span className="px-2.5 py-1 bg-emerald-400/15 text-emerald-400 text-[11px] font-bold rounded-full flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              VERIFIED
                            </span>
                          )}
                          {!latestAssessment.purchased_at && (
                            <span className="px-2.5 py-1 bg-muted text-muted-foreground text-[11px] font-bold rounded-full">
                              PREVIEW
                            </span>
                          )}
                        </div>

                        <p className="font-semibold text-foreground">
                          {new Date(latestAssessment.created_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {new Date(latestAssessment.created_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>

                        {latestAssessment.scores && (
                          <div className="grid grid-cols-4 gap-2 mt-4">
                            {(Object.keys(latestAssessment.scores) as Category[]).map((cat) => {
                              const cfg = pillarConfig[cat]
                              const score = latestAssessment.scores[cat]
                              return (
                                <div key={cat} className="group relative cursor-pointer">
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-card border border-border rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                                    <p className={`text-sm font-bold ${cfg.color}`}>{categories[cat].name}</p>
                                    <p className="text-lg font-black">{score.toFixed(1)} <span className="text-xs text-muted-foreground font-normal">/ 10</span></p>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                                      <div className="w-2 h-2 bg-card border-r border-b border-border rotate-45" />
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`text-xs font-bold ${cfg.color} group-hover:scale-110 transition-transform`}>{cfg.letter}</span>
                                    <span className="text-xs text-muted-foreground font-medium">{score.toFixed(1)}</span>
                                  </div>
                                  <div className="h-2 bg-muted rounded-full overflow-hidden group-hover:h-2.5 transition-all">
                                    <div
                                      className={`h-full rounded-full transition-all group-hover:brightness-110 ${
                                        cat === 'discipline' ? 'bg-primary' :
                                        cat === 'ownership' ? 'bg-emerald-400' :
                                        cat === 'toughness' ? 'bg-rose-400' : 'bg-cyan-400'
                                      }`}
                                      style={{ width: `${(score / 10) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex sm:flex-col gap-2 shrink-0">
                        {latestAssessment.purchased_at ? (
                          <span className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap">
                            View Report
                          </span>
                        ) : (
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openPurchaseModal(latestAssessment.id, displayScore); }}
                            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
                          >
                            Unlock Report
                          </button>
                        )}
                        {!latestAssessment.is_verified && (
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openVerificationModal(latestAssessment.id); }}
                            className="px-4 py-2 bg-muted hover:bg-muted/80 text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                          >
                            Get Verified
                          </button>
                        )}
                      </div>
                    </div>

                    {verifications.length > 0 && !latestAssessment.is_verified && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground font-medium">Verification progress</span>
                          <span className="text-xs font-bold text-primary">{completedVerifications}/3</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {['coach', 'peer', 'mentor'].map((type) => {
                            const v = verifications.find(v => v.evaluator_type === type)
                            const done = v?.status === 'completed'
                            return (
                              <div key={type} className={`p-2 rounded-lg text-center text-xs font-medium ${done ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                <span className="capitalize">{type}</span>
                                <p className="text-[10px] font-normal mt-0.5 opacity-70">
                                  {done ? 'Done' : v ? 'Pending' : 'Not sent'}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-border flex justify-end">
                      <Link
                        href="/assessments"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        View all assessments →
                      </Link>
                    </div>
                  </Link>
                )
              })()}
            </section>
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

        {/* Submitted Evaluations for Others */}
        {hasSubmittedEvaluations && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs text-emerald-400 font-medium tracking-wider">EVALUATIONS</span>
                <h2 className="text-lg font-semibold">Athletes You&apos;ve Evaluated</h2>
              </div>
              <span className="text-sm text-muted-foreground">{submittedEvaluations.length} total</span>
            </div>
            
            <div className="space-y-3">
              {submittedEvaluations.map((evaluation) => (
                <div
                  key={evaluation.id}
                  className="p-4 bg-card/50 backdrop-blur-sm border border-border rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-400/15 flex items-center justify-center">
                      <span className="text-lg font-black text-emerald-400">
                        {evaluation.overall_score?.toFixed(1) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {evaluation.athlete_name || 'Unknown Athlete'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="capitalize">{evaluation.evaluator_type}</span>
                        <span>•</span>
                        <span>
                          {evaluation.completed_at 
                            ? new Date(evaluation.completed_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'Pending'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {evaluation.scores && (
                    <div className="hidden sm:flex items-center gap-2">
                      {(Object.keys(evaluation.scores) as Category[]).map((cat) => {
                        const cfg = pillarConfig[cat]
                        return (
                          <div
                            key={cat}
                            className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}
                            title={categories[cat].name}
                          >
                            <span className={`text-xs font-bold ${cfg.color}`}>
                              {evaluation.scores?.[cat].toFixed(0)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Verification Modal */}
      <RequestVerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        assessmentId={selectedAssessmentId || ''}
        athleteName={profile?.full_name || 'Athlete'}
        onSuccess={() => {
          router.refresh()
        }}
      />

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        assessmentId={selectedAssessmentId || ''}
        score={selectedAssessmentScore}
        userEmail={user.email}
        onPurchaseComplete={() => {
          // Page will refresh after purchase completes
        }}
      />
    </div>
  )
}
