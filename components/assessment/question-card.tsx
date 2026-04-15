"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { answerOptions, questions, type Question } from "@/lib/assessment-data"
import { useAssessmentStore } from "@/lib/assessment-store"
import { Check } from "lucide-react"

interface QuestionCardProps {
  question: Question
}

export function QuestionCard({ question }: QuestionCardProps) {
  const { answers, setAnswer, nextQuestion, currentQuestion, completeAssessment } = useAssessmentStore()
  const currentAnswer = answers[question.id]
  const isLastQuestion = currentQuestion === questions.length - 1
  const [advancing, setAdvancing] = useState(false)

  const handleSelect = (value: number) => {
    if (advancing) return
    setAnswer(question.id, value)
    setAdvancing(true)

    setTimeout(() => {
      if (isLastQuestion) {
        completeAssessment()
      } else {
        nextQuestion()
      }
      setAdvancing(false)
    }, 280)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Question number — no category label */}
      <p className="font-mono text-xs text-muted-foreground/50 tracking-widest">
        {currentQuestion + 1} / {questions.length}
      </p>

      {/* Question text */}
      <p className="text-xl sm:text-2xl font-bold text-foreground leading-relaxed">
        {question.text}
      </p>

      {/* Answer options */}
      <div className="flex flex-col gap-3">
        {answerOptions.map((option) => {
          const isSelected = currentAnswer === option.value
          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              disabled={advancing}
              className={cn(
                "group relative w-full px-6 py-4 rounded-xl border-2 text-left",
                "transition-all duration-200 ease-out",
                "hover:scale-[1.01] active:scale-[0.99]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isSelected
                  ? "border-primary bg-primary/10 shadow-[0_0_18px_rgba(0,0,0,0.15)]"
                  : "border-border/40 bg-card/30 hover:border-border hover:bg-card/50"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <span className={cn(
                  "text-base font-semibold transition-colors duration-150",
                  isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {option.label}
                </span>

                {/* Checkmark circle */}
                <div className={cn(
                  "shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-border/50 group-hover:border-primary/50"
                )}>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                  )}
                </div>
              </div>

              {/* Left accent bar */}
              <div className={cn(
                "absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-all duration-200",
                isSelected ? "bg-primary" : "bg-transparent"
              )} />
            </button>
          )
        })}
      </div>

      <p className="text-center text-[11px] text-muted-foreground/40 font-mono tracking-wider">
        TAP AN ANSWER TO CONTINUE
      </p>
    </div>
  )
}
