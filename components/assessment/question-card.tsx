"use client"

import { cn } from "@/lib/utils"
import { answerOptions, type Question } from "@/lib/assessment-data"
import { useAssessmentStore } from "@/lib/assessment-store"

interface QuestionCardProps {
  question: Question
}

export function QuestionCard({ question }: QuestionCardProps) {
  const { answers, setAnswer } = useAssessmentStore()
  const currentAnswer = answers[question.id]

  return (
    <div className="flex flex-col gap-8">
      <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
        {question.text}
      </p>
      
      <div className="flex flex-col gap-3">
        {answerOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setAnswer(question.id, option.value)}
            className={cn(
              "w-full px-6 py-4 rounded-lg border text-left transition-all duration-200",
              "hover:border-primary/50 hover:bg-primary/5",
              currentAnswer === option.value
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground"
            )}
          >
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
