"use client"

import { useAssessmentStore } from "@/lib/assessment-store"
import { questions } from "@/lib/assessment-data"
import { ArrowLeft } from "lucide-react"

interface NavigationControlsProps {
  onComplete: () => void
}

export function NavigationControls({ onComplete }: NavigationControlsProps) {
  const { currentQuestion, answers, prevQuestion, completeAssessment } = useAssessmentStore()
  
  const isFirstQuestion = currentQuestion === 0
  const isLastQuestion = currentQuestion === questions.length - 1
  const allQuestionsAnswered = Object.keys(answers).length === questions.length

  return (
    <div className="flex items-center justify-between pt-6 border-t border-border/30">
      {/* Previous */}
      {!isFirstQuestion ? (
        <button
          onClick={prevQuestion}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      ) : (
        <div />
      )}
      
      {/* Complete button */}
      {isLastQuestion && allQuestionsAnswered && (
        <button
          onClick={() => {
            completeAssessment()
            onComplete()
          }}
          className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          See Results
        </button>
      )}
    </div>
  )
}
