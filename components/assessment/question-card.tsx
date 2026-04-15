"use client"

import { cn } from "@/lib/utils"
import { answerOptions, questions, type Question } from "@/lib/assessment-data"
import { useAssessmentStore } from "@/lib/assessment-store"

interface QuestionCardProps {
  question: Question
}

export function QuestionCard({ question }: QuestionCardProps) {
  const { answers, setAnswer, nextQuestion, currentQuestion } = useAssessmentStore()
  const currentAnswer = answers[question.id]
  const isLastQuestion = currentQuestion === questions.length - 1

  const handleSelect = (value: number) => {
    setAnswer(question.id, value)
    // Auto-advance after a short delay, but not on last question
    if (!isLastQuestion) {
      setTimeout(() => {
        nextQuestion()
      }, 300)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <p className="text-lg sm:text-xl font-semibold text-foreground leading-relaxed">
        {question.text}
      </p>
      
      <div className="flex flex-col gap-2">
        {answerOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={cn(
              "w-full px-5 py-3.5 rounded-lg border text-left transition-all duration-200",
              "hover:border-primary/50 hover:bg-primary/5",
              "focus:outline-none focus:ring-2 focus:ring-primary/30",
              currentAnswer === option.value
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card/50 text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="text-sm font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
