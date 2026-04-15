"use client"

import { useAssessmentStore } from "@/lib/assessment-store"
import { questions } from "@/lib/assessment-data"

export function ProgressBar() {
  const { currentQuestion } = useAssessmentStore()
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const answered = currentQuestion + 1
  const total = questions.length

  return (
    <div className="space-y-3">
      {/* Progress info */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Question <span className="text-foreground font-semibold">{answered}</span> of {total}
        </span>
        <span className="text-sm font-medium text-primary">
          {Math.round(progress)}%
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
