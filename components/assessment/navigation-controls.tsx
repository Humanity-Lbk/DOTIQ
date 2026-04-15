"use client"

import { useAssessmentStore } from "@/lib/assessment-store"
import { questions } from "@/lib/assessment-data"
import { ChevronLeft } from "lucide-react"

interface NavigationControlsProps {
  onComplete: () => void
}

export function NavigationControls({ onComplete }: NavigationControlsProps) {
  const { currentQuestion, answers, prevQuestion, completeAssessment } = useAssessmentStore()
  
  const isFirstQuestion = currentQuestion === 0
  const isLastQuestion = currentQuestion === questions.length - 1
  const allQuestionsAnswered = Object.keys(answers).length === questions.length

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Previous button - only show if not first question */}
      {!isFirstQuestion ? (
        <button
          onClick={prevQuestion}
          className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-card/50"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
      ) : (
        <div /> // Spacer
      )}
      
      {/* Complete button - only show on last question when all answered */}
      {isLastQuestion && allQuestionsAnswered && (
        <button
          onClick={() => {
            completeAssessment()
            onComplete()
          }}
          className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
        >
          View My Results
        </button>
      )}
    </div>
  )
}
