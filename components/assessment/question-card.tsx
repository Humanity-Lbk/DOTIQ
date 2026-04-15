"use client"

import { cn } from "@/lib/utils"
import { answerOptions, questions, type Question } from "@/lib/assessment-data"
import { useAssessmentStore } from "@/lib/assessment-store"

interface QuestionCardProps {
  question: Question
  onAnswerSelected: (value: number) => void
  transitioning: boolean
  glowValue: number | null
}

export function QuestionCard({ question, onAnswerSelected, transitioning, glowValue }: QuestionCardProps) {
  const { answers, setAnswer, currentQuestion } = useAssessmentStore()
  const currentAnswer = answers[question.id]

  const handleSelect = (value: number) => {
    if (transitioning) return
    setAnswer(question.id, value)
    onAnswerSelected(value)
  }

  return (
    <div className="space-y-10">
      {/* Question */}
      <div className="space-y-6">
        <p className="text-2xl sm:text-3xl font-bold text-foreground leading-snug tracking-tight">
          {question.text}
        </p>
      </div>

      {/* Answer options - clean, minimal, SaaS-like */}
      <div className="space-y-3">
        {answerOptions.map((option) => {
          const isSelected = currentAnswer === option.value
          const isGlowing = glowValue === option.value
          
          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              disabled={transitioning}
              className={cn(
                "group relative w-full text-left transition-all duration-200",
                "px-5 py-4 rounded-xl border",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isSelected
                  ? "bg-primary/10 border-primary text-foreground"
                  : "bg-card/40 border-border/50 hover:bg-card/80 hover:border-border text-muted-foreground hover:text-foreground",
                transitioning && "pointer-events-none",
                isGlowing && "animate-neon-glow"
              )}
            >
              <div className="flex items-center gap-4">
                {/* Radio indicator */}
                <div className={cn(
                  "shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30 group-hover:border-muted-foreground/50"
                )}>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  )}
                </div>
                
                <span className="text-base font-medium">
                  {option.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
