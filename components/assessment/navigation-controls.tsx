"use client"

import { Button } from "@/components/ui/button"
import { useAssessmentStore } from "@/lib/assessment-store"
import { questions } from "@/lib/assessment-data"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface NavigationControlsProps {
  onComplete: () => void
}

export function NavigationControls({ onComplete }: NavigationControlsProps) {
  const { currentQuestion, answers, nextQuestion, prevQuestion } = useAssessmentStore()
  
  const isFirstQuestion = currentQuestion === 0
  const isLastQuestion = currentQuestion === questions.length - 1
  const currentQuestionAnswered = answers[questions[currentQuestion].id] !== undefined
  const allQuestionsAnswered = Object.keys(answers).length === questions.length

  const handleNext = () => {
    if (isLastQuestion && allQuestionsAnswered) {
      onComplete()
    } else {
      nextQuestion()
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        variant="outline"
        onClick={prevQuestion}
        disabled={isFirstQuestion}
        className="gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>
      
      <Button
        onClick={handleNext}
        disabled={!currentQuestionAnswered}
        className="gap-2"
      >
        {isLastQuestion ? (
          allQuestionsAnswered ? "View Results" : "Finish"
        ) : (
          <>
            Next
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  )
}
