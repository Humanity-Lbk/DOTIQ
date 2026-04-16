"use client"

import { useState, useCallback } from "react"
import { useAssessmentStore } from "@/lib/assessment-store"
import { questions } from "@/lib/assessment-data"
import { ProgressBar } from "./progress-bar"
import { QuestionCard } from "./question-card"
import { NavigationControls } from "./navigation-controls"
import { ResultsView } from "./results-view"
import { cn } from "@/lib/utils"
import { Zap } from "lucide-react"

type Phase = "idle" | "glow" | "exit" | "enter"

interface AssessmentProps {
  isSuperAdmin?: boolean
}

export function Assessment({ isSuperAdmin = false }: AssessmentProps) {
  const { currentQuestion, isComplete, completeAssessment, nextQuestion, setAnswer } = useAssessmentStore()
  const [phase, setPhase] = useState<Phase>("idle")
  const [displayedQuestion, setDisplayedQuestion] = useState(currentQuestion)
  const [glowValue, setGlowValue] = useState<number | null>(null)
  const [filling, setFilling] = useState(false)

  // Generate a random-but-realistic score profile (not purely random noise)
  const handleQuickFill = useCallback(() => {
    if (filling) return
    setFilling(true)

    // Pick a random archetype bias so scores feel like a real athlete profile
    // Each category gets a base between 4–9, then each answer varies ±2
    const bases: Record<string, number> = {
      discipline: Math.floor(Math.random() * 6) + 4,
      ownership:  Math.floor(Math.random() * 6) + 4,
      toughness:  Math.floor(Math.random() * 6) + 4,
      sportsiq:   Math.floor(Math.random() * 6) + 4,
    }

    questions.forEach((q) => {
      const base = bases[q.category]
      const jitter = Math.floor(Math.random() * 5) - 2   // –2 to +2
      const value = Math.min(10, Math.max(1, base + jitter))
      setAnswer(q.id, value)
    })

    setFilling(false)
    completeAssessment()
  }, [filling, setAnswer, completeAssessment])

  const handleAnswerSelected = useCallback((value: number) => {
    if (phase !== "idle") return
    const isLast = displayedQuestion === questions.length - 1

    // Phase 1: glow on selected option (900ms)
    setGlowValue(value)
    setPhase("glow")
    setTimeout(() => {
      setGlowValue(null)

      // Phase 2: fade out (300ms)
      setPhase("exit")
      setTimeout(() => {
        if (isLast) {
          completeAssessment()
        } else {
          nextQuestion()
          setDisplayedQuestion((q) => q + 1)
        }

        // Phase 3: fade in (400ms)
        setPhase("enter")
        setTimeout(() => {
          setPhase("idle")
        }, 400)

      }, 300)
    }, 900)
  }, [phase, displayedQuestion, completeAssessment, nextQuestion])

  if (isComplete) {
    return <ResultsView />
  }

  const question = questions[displayedQuestion]

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8 space-y-8">
      <ProgressBar />

      {/* Super admin quick fill — testing only */}
      {isSuperAdmin && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">Super Admin</span>
            <span className="text-xs text-muted-foreground">— Testing mode</span>
          </div>
          <button
            onClick={handleQuickFill}
            disabled={filling}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-bold rounded-lg transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            {filling ? "Filling..." : "Quick Fill"}
          </button>
        </div>
      )}

      {/* Question area with transitions */}
      <div
        className={cn(
          "min-h-[320px]",
          phase === "enter" && "animate-question-in",
          phase === "exit" && "animate-question-out",
          (phase === "idle" || phase === "glow") && "opacity-100"
        )}
      >
        <QuestionCard
          key={displayedQuestion}
          question={question}
          onAnswerSelected={handleAnswerSelected}
          transitioning={phase !== "idle"}
          glowValue={glowValue}
        />
      </div>

      <NavigationControls onComplete={completeAssessment} />
    </div>
  )
}
