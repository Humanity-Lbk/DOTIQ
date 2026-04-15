"use client"

import { useState, useCallback } from "react"
import { useAssessmentStore } from "@/lib/assessment-store"
import { questions } from "@/lib/assessment-data"
import { ProgressBar } from "./progress-bar"
import { QuestionCard } from "./question-card"
import { NavigationControls } from "./navigation-controls"
import { ResultsView } from "./results-view"
import { cn } from "@/lib/utils"

type Phase = "idle" | "glow" | "exit" | "enter"

export function Assessment() {
  const { currentQuestion, isComplete, completeAssessment, nextQuestion } = useAssessmentStore()
  const [phase, setPhase] = useState<Phase>("idle")
  const [displayedQuestion, setDisplayedQuestion] = useState(currentQuestion)
  const [glowValue, setGlowValue] = useState<number | null>(null)

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
