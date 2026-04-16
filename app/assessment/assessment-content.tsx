"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from "@/components/header"
import { Assessment } from "@/components/assessment/assessment"
import { useAssessmentStore } from "@/lib/assessment-store"
import { PreviewReport } from "@/components/assessment/preview-report"
import { SignupPromptModal } from "@/components/assessment/signup-prompt-modal"

interface AssessmentContentProps {
  canTake: boolean
  nextEligibleDate: string | null
  daysTilEligible: number | null
  isGuest?: boolean
  userEmail?: string | null
  isSuperAdmin?: boolean
}

export function AssessmentContent({ 
  canTake, 
  nextEligibleDate, 
  daysTilEligible,
  isGuest = false,
  userEmail,
  isSuperAdmin = false,
}: AssessmentContentProps) {
  const { isComplete } = useAssessmentStore()
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [signedUp, setSignedUp] = useState(false)
  
  // Show signup modal for guests when assessment is complete
  useEffect(() => {
    if (isComplete && isGuest && !signedUp) {
      setShowSignupModal(true)
    }
  }, [isComplete, isGuest, signedUp])

  const handleSignupSuccess = () => {
    setSignedUp(true)
    setShowSignupModal(false)
  }

  // For guests who haven't signed up, show signup modal before results
  const shouldShowResults = isComplete && (!isGuest || signedUp)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Grid background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--border) 1px, transparent 1px),
              linear-gradient(to bottom, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <main className="flex-1 flex flex-col">
        {/* Locked state - only for logged in users */}
        {!canTake && !isGuest ? (
          <div className="flex-1 flex items-center justify-center px-6 py-20">
            <div className="w-full max-w-md text-center">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/50 border border-border flex items-center justify-center">
                <svg className="w-9 h-9 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 15v2m0 0v2m0-2h2m-2 0H10M8 11V7a4 4 0 018 0v4M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z"
                  />
                </svg>
              </div>

              {/* Label */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-400/10 border border-rose-400/20 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span className="text-xs font-medium text-rose-400">Assessment locked</span>
              </div>

              <h1 className="text-2xl font-black tracking-tight mb-3">
                Come back in {daysTilEligible} {daysTilEligible === 1 ? 'day' : 'days'}
              </h1>
              <p className="text-muted-foreground mb-2">
                Growth takes time to show up. Assessments are spaced 3 months apart so your scores reflect real change.
              </p>
              {nextEligibleDate && (
                <p className="text-sm text-muted-foreground/60 mb-8">
                  Unlocks on <span className="text-foreground font-medium">{nextEligibleDate}</span>
                </p>
              )}

              {/* Countdown grid */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { label: 'Days left', value: daysTilEligible ?? 0 },
                  { label: 'Months apart', value: 3 },
                  { label: 'Questions', value: 50 },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 bg-card/50 border border-border rounded-xl">
                    <p className="text-2xl font-black text-primary">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Back to Dashboard
                </Link>
                <Link
                  href="/report"
                  className="px-6 py-3 bg-muted hover:bg-muted/80 font-medium rounded-lg transition-colors"
                >
                  View Last Report
                </Link>
              </div>
            </div>
          </div>
        ) : !isComplete ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="pt-12 pb-8 px-6">
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-medium text-primary">Assessment in progress</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  Discover what sets you apart
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  No right answers. Just honest ones.
                </p>
              </div>
            </div>

            <div className="flex-1 flex items-start justify-center px-6 pb-12">
              <div className="w-full max-w-xl">
                <Assessment isSuperAdmin={isSuperAdmin} />
              </div>
            </div>
          </div>
        ) : shouldShowResults ? (
          <PreviewReport isGuest={isGuest && !signedUp} />
        ) : (
          // Show loading/transition state while signup modal is shown
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Preparing your results...</p>
            </div>
          </div>
        )}
      </main>

      {/* Signup Modal for guests */}
      <SignupPromptModal
        isOpen={showSignupModal}
        onClose={() => {
          // Allow them to continue as guest
          setSignedUp(true)
          setShowSignupModal(false)
        }}
        onSuccess={handleSignupSuccess}
      />
    </div>
  )
}
