'use client'

import { useState } from 'react'
import Link from 'next/link'
import { categories, type Category } from '@/lib/assessment-data'
import AppSidebar from '@/components/app-sidebar'
import { PurchaseModal } from '@/components/purchase/purchase-modal'
import type { User } from '@supabase/supabase-js'

interface Profile {
  full_name: string | null
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

interface Report {
  id: string
  assessment_id: string
  content: Record<string, unknown>
  share_token: string
}

interface AssessmentsContentProps {
  user: User
  profile: Profile | null
  assessments: Assessment[]
  verifications: Verification[]
  reports: Report[]
}

const pillarConfig: Record<Category, { letter: string; color: string; bg: string }> = {
  discipline: { letter: 'D', color: 'text-primary', bg: 'bg-primary' },
  ownership: { letter: 'O', color: 'text-emerald-400', bg: 'bg-emerald-400' },
  toughness: { letter: 'T', color: 'text-rose-400', bg: 'bg-rose-400' },
  sportsiq: { letter: 'IQ', color: 'text-cyan-400', bg: 'bg-cyan-400' },
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 10) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="text-primary transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black">{score.toFixed(1)}</span>
        <span className="text-[10px] text-muted-foreground">/ 10</span>
      </div>
    </div>
  )
}

export function AssessmentsContent({
  user,
  profile,
  assessments,
  verifications,
  reports,
}: AssessmentsContentProps) {
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null)
  const [selectedScore, setSelectedScore] = useState<number>(0)

  const getVerificationsForAssessment = (assessmentId: string) => {
    return verifications.filter(v => v.assessment_id === assessmentId)
  }

  const getReportForAssessment = (assessmentId: string) => {
    return reports.find(r => r.assessment_id === assessmentId)
  }

  const openPurchaseModal = (assessmentId: string, score: number) => {
    setSelectedAssessmentId(assessmentId)
    setSelectedScore(score)
    setPurchaseModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <AppSidebar />

      <div className="flex-1 ml-64">
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-sm text-foreground">Assessments</span>
          </div>
          <h1 className="text-3xl font-black">My Assessments</h1>
          <p className="text-muted-foreground mt-1">
            View all your DOTIQ assessments and reports
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-card/50 border border-border rounded-xl">
            <p className="text-xs text-muted-foreground font-medium">Total Assessments</p>
            <p className="text-2xl font-black text-primary mt-1">{assessments.length}</p>
          </div>
          <div className="p-4 bg-card/50 border border-border rounded-xl">
            <p className="text-xs text-muted-foreground font-medium">Reports Unlocked</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              {assessments.filter(a => a.purchased_at).length}
            </p>
          </div>
          <div className="p-4 bg-card/50 border border-border rounded-xl">
            <p className="text-xs text-muted-foreground font-medium">Verified Scores</p>
            <p className="text-2xl font-black text-cyan-400 mt-1">
              {assessments.filter(a => a.is_verified).length}
            </p>
          </div>
          <div className="p-4 bg-card/50 border border-border rounded-xl">
            <p className="text-xs text-muted-foreground font-medium">Highest Score</p>
            <p className="text-2xl font-black mt-1">
              {assessments.length > 0
                ? Math.max(...assessments.map(a => a.overall_score)).toFixed(1)
                : '-'}
            </p>
          </div>
        </div>

        {/* Assessments List */}
        {assessments.length === 0 ? (
          <div className="text-center py-16 bg-card/30 border border-border rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No assessments yet</h3>
            <p className="text-muted-foreground mb-6">Take your first assessment to discover your DOTIQ score</p>
            <Link
              href="/assessment"
              className="inline-flex px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Take Assessment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment, index) => {
              const isLatest = index === 0
              const assessmentVerifications = getVerificationsForAssessment(assessment.id)
              const completedVerifications = assessmentVerifications.filter(v => v.status === 'completed').length
              const report = getReportForAssessment(assessment.id)
              const displayScore = assessment.is_verified
                ? (assessment.verified_score ?? assessment.overall_score)
                : assessment.overall_score

              return (
                <div
                  key={assessment.id}
                  className={`p-6 bg-card/50 backdrop-blur-sm border-2 rounded-2xl transition-all duration-200 hover:border-primary/40 ${
                    isLatest ? 'border-primary/40' : 'border-border'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Score */}
                    <div className="shrink-0">
                      <ScoreRing score={displayScore} size={80} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {isLatest && (
                          <span className="px-2.5 py-1 bg-primary/15 text-primary text-[11px] font-bold rounded-full">
                            LATEST
                          </span>
                        )}
                        {assessment.is_verified && (
                          <span className="px-2.5 py-1 bg-emerald-400/15 text-emerald-400 text-[11px] font-bold rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            VERIFIED
                          </span>
                        )}
                        {assessment.purchased_at ? (
                          <span className="px-2.5 py-1 bg-cyan-400/15 text-cyan-400 text-[11px] font-bold rounded-full">
                            FULL REPORT
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-muted text-muted-foreground text-[11px] font-bold rounded-full">
                            PREVIEW
                          </span>
                        )}
                      </div>

                      <p className="font-semibold text-foreground">
                        {new Date(assessment.created_at).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(assessment.created_at).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>

                      {/* Pillar scores */}
                      {assessment.scores && (
                        <div className="flex flex-wrap gap-3 mt-3">
                          {(Object.keys(assessment.scores) as Category[]).map((cat) => {
                            const cfg = pillarConfig[cat]
                            return (
                              <div key={cat} className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold ${cfg.color}`}>{cfg.letter}</span>
                                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${cfg.bg}`}
                                    style={{ width: `${(assessment.scores[cat] / 10) * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">{assessment.scores[cat].toFixed(1)}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Verification progress */}
                      {assessmentVerifications.length > 0 && !assessment.is_verified && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Verification: {completedVerifications}/3 complete
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      {assessment.purchased_at ? (
                        <Link
                          href={`/report/${assessment.id}`}
                          className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors text-center"
                        >
                          View Full Report
                        </Link>
                      ) : (
                        <button
                          onClick={() => openPurchaseModal(assessment.id, displayScore)}
                          className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Unlock Full Report
                        </button>
                      )}
                      <Link
                        href={`/report/${assessment.id}`}
                        className="px-5 py-2.5 bg-muted hover:bg-muted/80 text-sm font-medium rounded-lg transition-colors text-center"
                      >
                        View Preview
                      </Link>
                      {report?.share_token && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/report/share/${report.share_token}`)
                          }}
                          className="px-5 py-2.5 bg-muted/50 hover:bg-muted/80 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Copy Share Link
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        assessmentId={selectedAssessmentId || ''}
        score={selectedScore}
        userEmail={user.email}
        onPurchaseComplete={() => {
          window.location.reload()
        }}
      />
      </div>
    </div>
  )
}
