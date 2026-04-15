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

  const handleAnswerSelected = useCallback(() => {
    if (phase !== "idle") return
    const isLast = displayedQuestion === questions.length - 1

    // Phase 1: neon glow blooms around the card (600ms)
    setPhase("glow")
    setTimeout(() => {

      // Phase 2: card fades + slides up (300ms)
      setPhase("exit")
      setTimeout(() => {

        // Swap the actual question data
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
    }, 600)
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

      {/* Glow wrapper — neon bloom fires on "glow" phase */}
      <div
        className={cn(
          "rounded-2xl transition-shadow duration-300",
          phase === "glow" && "animate-neon-glow"
        )}
      >
        {/* Question card fade in/out */}
        <div
          className={cn(
            phase === "enter" && "animate-question-in",
            phase === "exit" && "animate-question-out",
            phase === "idle" || phase === "glow" ? "opacity-100" : ""
          )}
        >
          <QuestionCard
            key={displayedQuestion}
            question={question}
            onAnswerSelected={handleAnswerSelected}
            transitioning={phase !== "idle"}
          />
        </div>
      </div>

      <NavigationControls onComplete={completeAssessment} />
    </div>
  )
}
