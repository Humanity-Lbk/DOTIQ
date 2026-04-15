"use client"

import { useState, useCallback } from "react"
import { useAssessmentStore } from "@/lib/assessment-store"
import { questions } from "@/lib/assessment-data"
import { ProgressBar } from "./progress-bar"
import { QuestionCard } from "./question-card"
import { NavigationControls } from "./navigation-controls"
import { ResultsView } from "./results-view"
import { cn } from "@/lib/utils"

// 3-phase transition: idle → glow → exit → (swap) → enter
type Phase = "idle" | "glow" | "exit" | "enter"

export function Assessment() {
  const { currentQuestion, isComplete, completeAssessment, nextQuestion } = useAssessmentStore()
  const [phase, setPhase] = useState<Phase>("idle")
  const [displayedQuestion, setDisplayedQuestion] = useState(currentQuestion)
  const [glowValue, setGlowValue] = useState<number | null>(null)

  const handleAnswerSelected = useCallback((value: number) => {
    if (phase !== "idle") return
    const isLast = displayedQuestion === questions.length - 1

    // Phase 1: glow blooms on the selected option only (900ms)
    setGlowValue(value)
    setPhase("glow")
    setTimeout(() => {
      setGlowValue(null)

      // Phase 2: card fades out (300ms)
      setPhase("exit")
      setTimeout(() => {

        // Swap question
        if (isLast) {
          completeAssessment()
        } else {
          nextQuestion()
          setDisplayedQuestion((q) => q + 1)
        }

        // Phase 3: new card fades in (400ms)
        setPhase("enter")
        setTimeout(() => {
          setPhase("idle")
        }, 400)

      }, 300)
    }, 900)
  }, [phase, displayedQuestion, completeAssessment, nextQuestion])

  if (isComplete) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <ResultsView />
      </div>
    )
  }

  const question = questions[displayedQuestion]

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <ProgressBar />

      {/* Question fade in/out wrapper */}
      <div
        className={cn(
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
