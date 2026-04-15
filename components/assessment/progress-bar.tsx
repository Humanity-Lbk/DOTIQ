"use client"

import { useAssessmentStore } from "@/lib/assessment-store"
import { questions } from "@/lib/assessment-data"

export function ProgressBar() {
  const { currentQuestion } = useAssessmentStore()
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="w-full h-1 bg-muted/40 rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
