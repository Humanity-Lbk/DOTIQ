"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { answerOptions, questions, categories, type Question, type Category } from "@/lib/assessment-data"
import { useAssessmentStore } from "@/lib/assessment-store"
import { Check } from "lucide-react"

interface QuestionCardProps {
  question: Question
}

const categoryColors: Record<Category, { border: string; bg: string; text: string; glow: string }> = {
  discipline: { 
    border: "border-[var(--neon-gold)]", 
    bg: "bg-[var(--neon-gold)]", 
    text: "text-[var(--neon-gold)]",
    glow: "shadow-[0_0_20px_rgba(255,200,50,0.3)]"
  },
  ownership: { 
    border: "border-[var(--neon-lime)]", 
    bg: "bg-[var(--neon-lime)]", 
    text: "text-[var(--neon-lime)]",
    glow: "shadow-[0_0_20px_rgba(150,255,50,0.3)]"
  },
  toughness: { 
    border: "border-[var(--neon-pink)]", 
    bg: "bg-[var(--neon-pink)]", 
    text: "text-[var(--neon-pink)]",
    glow: "shadow-[0_0_20px_rgba(255,100,150,0.3)]"
  },
  sportsiq: { 
    border: "border-[var(--neon-cyan)]", 
    bg: "bg-[var(--neon-cyan)]", 
    text: "text-[var(--neon-cyan)]",
    glow: "shadow-[0_0_20px_rgba(100,220,255,0.3)]"
  },
}

export function QuestionCard({ question }: QuestionCardProps) {
  const { answers, setAnswer, nextQuestion, currentQuestion, completeAssessment } = useAssessmentStore()
  const currentAnswer = answers[question.id]
  const isLastQuestion = currentQuestion === questions.length - 1
  const colors = categoryColors[question.category]
  const categoryInfo = categories[question.category]
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationDirection, setAnimationDirection] = useState<'enter' | 'exit'>('enter')
  
  // Trigger enter animation when question changes
  useEffect(() => {
    setAnimationDirection('enter')
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 400)
    return () => clearTimeout(timer)
  }, [currentQuestion])

  const handleSelect = (value: number) => {
    setAnswer(question.id, value)
    
    // Animate out and advance
    setAnimationDirection('exit')
    setIsAnimating(true)
    
    setTimeout(() => {
      if (isLastQuestion) {
        // Check if all questions are answered
        const allAnswered = Object.keys(answers).length === questions.length - 1 // -1 because current answer not yet in store
        if (allAnswered || Object.keys(answers).length >= questions.length - 1) {
          completeAssessment()
        }
      } else {
        nextQuestion()
      }
    }, 250)
  }

  return (
    <div 
      className={cn(
        "flex flex-col gap-8 transition-all duration-300 ease-out",
        isAnimating && animationDirection === 'enter' && "animate-slide-in-right",
        isAnimating && animationDirection === 'exit' && "opacity-0 translate-x-[-20px]"
      )}
    >
      {/* Category indicator */}
      <div className="flex items-center gap-3">
        <div className={cn("w-3 h-3 rounded-full", colors.bg)} />
        <span className={cn("font-mono text-xs uppercase tracking-wider", colors.text)}>
          {categoryInfo.name}
        </span>
        <span className="text-muted-foreground/40 font-mono text-xs">
          Question {currentQuestion + 1} of {questions.length}
        </span>
      </div>
      
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
              className={cn(
                "group relative w-full px-6 py-4 rounded-xl border-2 text-left transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98]",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
                isSelected
                  ? cn(colors.border, colors.glow, "bg-card")
                  : "border-border/50 bg-card/30 hover:border-border hover:bg-card/60"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-base font-semibold transition-colors",
                  isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {option.label}
                </span>
                
                {/* Selection indicator */}
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                  isSelected 
                    ? cn(colors.border, colors.bg)
                    : "border-border/50 group-hover:border-border"
                )}>
                  {isSelected && (
                    <Check className="w-4 h-4 text-background" strokeWidth={3} />
                  )}
                </div>
              </div>
              
              {/* Subtle value indicator */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-200",
                isSelected ? colors.bg : "bg-transparent"
              )} />
            </button>
          )
        })}
      </div>
      
      {/* Hint text */}
      <p className="text-center text-xs text-muted-foreground/60 font-mono">
        TAP TO SELECT · AUTO-ADVANCES
      </p>
    </div>
  )
}
