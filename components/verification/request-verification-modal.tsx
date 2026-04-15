"use client"

import { useState } from "react"
import { X, Send, Phone, User, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface RequestVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  assessmentId: string
  athleteName: string
  onSuccess?: () => void
}

type EvaluatorType = "coach" | "parent" | "peer" | "mentor"

const evaluatorTypes: { type: EvaluatorType; label: string; description: string; icon: React.ReactNode }[] = [
  { type: "coach", label: "Coach", description: "Your current or former coach", icon: <Users className="w-5 h-5" /> },
  { type: "parent", label: "Parent", description: "A parent or guardian", icon: <User className="w-5 h-5" /> },
  { type: "peer", label: "Peer", description: "A teammate or fellow athlete", icon: <Users className="w-5 h-5" /> },
  { type: "mentor", label: "Mentor", description: "A trainer or advisor", icon: <User className="w-5 h-5" /> },
]

export function RequestVerificationModal({ 
  isOpen, 
  onClose, 
  assessmentId, 
  athleteName,
  onSuccess 
}: RequestVerificationModalProps) {
  const [step, setStep] = useState<"select" | "details" | "sending" | "success">("select")
  const [selectedType, setSelectedType] = useState<EvaluatorType | null>(null)
  const [evaluatorName, setEvaluatorName] = useState("")
  const [evaluatorPhone, setEvaluatorPhone] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSendRequest = async () => {
    if (!selectedType || !evaluatorName || !evaluatorPhone) {
      setError("Please fill in all fields")
      return
    }

    // Basic phone validation
    const cleanPhone = evaluatorPhone.replace(/\D/g, "")
    if (cleanPhone.length < 10) {
      setError("Please enter a valid phone number")
      return
    }

    setStep("sending")
    setError(null)

    try {
      const response = await fetch("/api/verification/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          evaluatorType: selectedType,
          evaluatorName,
          evaluatorPhone: cleanPhone,
          athleteName,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send verification request")
      }

      setStep("success")
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request")
      setStep("details")
    }
  }

  const resetAndClose = () => {
    setStep("select")
    setSelectedType(null)
    setEvaluatorName("")
    setEvaluatorPhone("")
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={resetAndClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold">Request Verification</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Get your score verified by someone who knows you well
            </p>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "select" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Select the type of evaluator you want to request:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {evaluatorTypes.map(({ type, label, description, icon }) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type)
                      setStep("details")
                    }}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all duration-200",
                      "hover:border-primary/50 hover:bg-primary/5",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {icon}
                      </div>
                      <span className="font-semibold">{label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "details" && selectedType && (
            <div className="space-y-5">
              <button
                onClick={() => setStep("select")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to selection
              </button>

              <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
                <p className="text-sm">
                  <span className="font-semibold text-primary capitalize">{selectedType}</span> will receive a text message with a link to evaluate{" "}
                  <span className="font-semibold">{athleteName}</span>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Evaluator&apos;s Name
                  </label>
                  <input
                    type="text"
                    value={evaluatorName}
                    onChange={(e) => setEvaluatorName(e.target.value)}
                    placeholder="Enter their full name"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </div>
                  </label>
                  <input
                    type="tel"
                    value={evaluatorPhone}
                    onChange={(e) => setEvaluatorPhone(e.target.value)}
                    placeholder="(555) 555-5555"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    They&apos;ll receive an SMS with a link to complete the evaluation
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <button
                  onClick={handleSendRequest}
                  className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Verification Request
                </button>
              </div>
            </div>
          )}

          {step === "sending" && (
            <div className="py-12 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Sending verification request...</p>
            </div>
          )}

          {step === "success" && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Request Sent!</h3>
              <p className="text-muted-foreground mb-6">
                {evaluatorName} will receive a text message with a link to evaluate you.
              </p>
              <button
                onClick={resetAndClose}
                className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
