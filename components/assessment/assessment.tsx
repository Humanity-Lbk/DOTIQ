"use client"

import { useAssessmentStore } from "@/lib/assessment-store"
import { questions } from "@/lib/assessment-data"
import { ProgressBar } from "./progress-bar"
import { QuestionCard } from "./question-card"
import { NavigationControls } from "./navigation-controls"
import { ResultsView } from "./results-view"

export function Assessment() {
  const { currentQuestion, isComplete, completeAssessment } = useAssessmentStore()
  const question = questions[currentQuestion]

  if (isComplete) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <ResultsView />
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <ProgressBar />
      <QuestionCard question={question} />
      <NavigationControls onComplete={completeAssessment} />
    </div>
  )
}
