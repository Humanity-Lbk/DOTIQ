"use client"

import { useState, useCallback, useEffect } from "react"
import { X, Check, FileText, Target, Zap, BookOpen, Share2 } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js"
import { startReportCheckoutSession, completeReportPurchase } from "@/app/actions/stripe"
import { useRouter } from "next/navigation"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  assessmentId: string
  score: number
  userEmail?: string | null
  onPurchaseComplete?: (assessmentId: string) => void
}

const reportFeatures = [
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Executive Summary",
    description: "High-level analysis of your athletic mindset"
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Pillar Deep Dive",
    description: "Detailed breakdown of all 4 DOTIQ pillars"
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Strengths & Pressure Points",
    description: "Your top behaviors and areas for growth"
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Action Plan",
    description: "Personalized habits and reset routines"
  },
  {
    icon: <Share2 className="w-5 h-5" />,
    title: "Shareable Link",
    description: "Share your report with coaches and mentors"
  },
]

export function PurchaseModal({ 
  isOpen, 
  onClose, 
  assessmentId,
  score,
  userEmail,
  onPurchaseComplete 
}: PurchaseModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<"overview" | "checkout" | "processing" | "complete">("overview")
  const [email, setEmail] = useState(userEmail || "")
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  
  // If user has email, skip email entry
  const hasUserEmail = !!userEmail

  // Reset state when modal closes or userEmail changes
  useEffect(() => {
    if (!isOpen) {
      setStep("overview")
      setEmail(userEmail || "")
      setError(null)
      setClientSecret(null)
    }
  }, [isOpen, userEmail])

  const startCheckout = useCallback(async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }
    
    setError(null)
    
    try {
      const secret = await startReportCheckoutSession({
        productId: "dotiq-full-report",
        assessmentId,
        email,
      })
      
      if (secret) {
        setClientSecret(secret)
        setStep("checkout")
      } else {
        setError("Unable to start checkout. Please try again.")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start checkout"
      // Make error message more user-friendly
      if (message.includes("not authenticated")) {
        setError("Please sign in to purchase a report")
      } else if (message.includes("not found")) {
        setError("Assessment not found. Please refresh and try again.")
      } else {
        setError(message)
      }
    }
  }, [email, assessmentId])

  const handleCheckoutComplete = useCallback(async () => {
    setStep("processing")
    setError(null)
    
    try {
      // Get the session ID from the client secret (format: cs_xxx_secret_xxx)
      const sessionId = clientSecret?.split('_secret_')[0]
      
      if (!sessionId) {
        throw new Error("Session not found")
      }
      
      // Call server to verify payment and update database
      const result = await completeReportPurchase(sessionId)
      
      if (result.success) {
        setStep("complete")
        onPurchaseComplete?.(assessmentId)
      } else {
        setError(result.error || "Failed to complete purchase")
        setStep("checkout") // Go back to checkout to retry
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to verify payment"
      setError(message)
      setStep("checkout")
    }
  }, [assessmentId, clientSecret, onPurchaseComplete])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <div>
            <h2 className="text-xl font-bold">Unlock Your Full Report</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Get personalized insights and action plans
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === "overview" && (
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Left: Report Overview */}
              <div className="p-6 space-y-6">
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4">
                    DOTIQ SCORE: {score.toFixed(1)}
                  </div>
                  <h3 className="text-2xl font-black mb-2">Your Detailed Report</h3>
                  <p className="text-muted-foreground">
                    A comprehensive analysis of your athletic mindset with AI-powered insights tailored specifically to you.
                  </p>
                </div>

                <div className="space-y-3">
                  {reportFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-500">Instant Delivery</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your report is generated immediately and emailed to you. You can also access it anytime from your dashboard.
                  </p>
                </div>
              </div>

              {/* Right: Email + Price */}
              <div className="p-6 flex flex-col">
                <div className="flex-1 space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-black mb-2">$9.99</div>
                    <p className="text-muted-foreground text-sm">One-time purchase</p>
                  </div>

                  {!hasUserEmail ? (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email for Report Delivery
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Your report will be sent to this email address
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Report will be sent to:</p>
                      <p className="font-medium">{email}</p>
                    </div>
                  )}

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Personalized AI-generated insights
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Actionable development plan
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Shareable with coaches
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Lifetime access
                    </li>
                  </ul>
                </div>

                <button
                  onClick={startCheckout}
                  disabled={!email || !email.includes('@')}
                  className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {step === "checkout" && clientSecret && (
            <div className="p-6">
              <button
                onClick={() => setStep("overview")}
                className="text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                ← Back
              </button>
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ 
                  clientSecret,
                  onComplete: handleCheckoutComplete,
                }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          )}

          {step === "processing" && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h3 className="text-xl font-bold mb-2">Processing Payment</h3>
              <p className="text-muted-foreground">Please wait while we confirm your purchase...</p>
            </div>
          )}

          {step === "complete" && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black mb-2">Purchase Complete!</h3>
              <p className="text-muted-foreground mb-6">
                Your detailed report is being generated. It will be sent to {email} and available on your dashboard.
              </p>
              <button
                onClick={() => {
                  onClose()
                  router.refresh()
                }}
                className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                View My Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
