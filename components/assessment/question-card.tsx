"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { answerScale, type Question } from "@/lib/assessment-data"
import { useAssessmentStore } from "@/lib/assessment-store"

interface QuestionCardProps {
  question: Question
  onAnswerSelected: (value: number) => void
  transitioning: boolean
  glowValue: number | null
  // For third-party evaluations
  isThirdPerson?: boolean
  athleteName?: string
}

export function QuestionCard({ 
  question, 
  onAnswerSelected, 
  transitioning, 
  glowValue,
  isThirdPerson = false,
  athleteName
}: QuestionCardProps) {
  const { answers, setAnswer, currentQuestion } = useAssessmentStore()
  const currentAnswer = answers[question.id]
  const [sliderValue, setSliderValue] = useState(currentAnswer || 5)
  const [hasInteracted, setHasInteracted] = useState(!!currentAnswer)

  // Reset slider when question changes
  useEffect(() => {
    setSliderValue(currentAnswer || 5)
    setHasInteracted(!!currentAnswer)
  }, [question.id, currentAnswer])

  const handleSliderChange = (value: number) => {
    setSliderValue(value)
    setHasInteracted(true)
  }

  const handleConfirm = useCallback(() => {
    if (transitioning || !hasInteracted) return
    setAnswer(question.id, sliderValue)
    onAnswerSelected(sliderValue)
  }, [transitioning, hasInteracted, question.id, sliderValue, setAnswer, onAnswerSelected])

  // Get the question text based on mode
  const questionText = isThirdPerson 
    ? question.textThirdPerson.replace(/They|Their|Them/g, (match) => {
        if (athleteName) {
          if (match === 'They') return athleteName
          if (match === 'Their') return `${athleteName}'s`
          if (match === 'Them') return athleteName
        }
        return match
      })
    : question.text

  // Allow clicking anywhere on the track area to jump to that value
  const handleTrackClick = (e: React.PointerEvent<HTMLDivElement>) => {
    if (transitioning) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = Math.min(Math.max(x / rect.width, 0), 1)
    const value = Math.round(ratio * 9) + 1
    handleSliderChange(value)
  }

  return (
    <div className="space-y-10">
      {/* Question */}
      <div className="space-y-4">
        {isThirdPerson && athleteName && (
          <p className="text-sm text-primary font-medium">
            Evaluating: {athleteName}
          </p>
        )}
        <p className="text-xl sm:text-2xl font-bold text-foreground leading-snug tracking-tight">
          {questionText}
        </p>
      </div>

      {/* Sliding Scale */}
      <div className={cn(
        "space-y-6 p-6 rounded-2xl border-2 transition-all duration-300",
        hasInteracted 
          ? "bg-card/60 border-primary/30" 
          : "bg-card/40 border-border/50",
        glowValue && "animate-neon-glow"
      )}>
        {/* Value display */}
        <div className="flex items-center justify-center">
          <div className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300",
            hasInteracted ? "bg-primary/15" : "bg-muted/50"
          )}>
            <span className={cn(
              "text-4xl font-black transition-colors duration-300",
              hasInteracted ? "text-primary" : "text-muted-foreground"
            )}>
              {sliderValue}
            </span>
          </div>
        </div>

        {/* Slider */}
        <div className="relative px-2">
          {/* Clickable track zone — full height for easy tapping */}
          <div
            className="absolute inset-x-2 top-0 bottom-0 cursor-pointer z-20"
            onPointerDown={handleTrackClick}
          />

          {/* Track background */}
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-3 bg-muted/50 rounded-full" />
          
          {/* Filled track — single primary color */}
          <div 
            className="absolute left-2 top-1/2 -translate-y-1/2 h-3 rounded-full bg-primary transition-all duration-150"
            style={{ width: `${((sliderValue - 1) / 9) * 100}%` }}
          />

          {/* Actual slider input */}
          <input
            type="range"
            min={answerScale.min}
            max={answerScale.max}
            value={sliderValue}
            onChange={(e) => handleSliderChange(parseInt(e.target.value))}
            disabled={transitioning}
            className={cn(
              "relative w-full h-8 appearance-none bg-transparent cursor-pointer z-10",
              "focus:outline-none",
              "[&::-webkit-slider-thumb]:appearance-none",
              "[&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7",
              "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white",
              "[&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-primary",
              "[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab",
              "[&::-webkit-slider-thumb]:active:cursor-grabbing",
              "[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110",
              "[&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7",
              "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white",
              "[&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-primary",
              "[&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-grab",
              transitioning && "opacity-50 pointer-events-none"
            )}
          />

          {/* Number indicators */}
          <div className="flex justify-between mt-3 px-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => handleSliderChange(num)}
                disabled={transitioning}
                className={cn(
                  "w-6 h-6 rounded-full text-xs font-semibold transition-all duration-200",
                  "hover:bg-primary/20 hover:text-primary",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30",
                  sliderValue === num 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground"
                )}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between text-sm px-1">
          <span className="text-muted-foreground">Never</span>
          <span className="text-muted-foreground">Sometimes</span>
          <span className="text-muted-foreground">Always</span>
        </div>
      </div>

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={!hasInteracted || transitioning}
        className={cn(
          "w-full py-4 rounded-xl font-semibold text-base transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
          hasInteracted
            ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        {hasInteracted ? "Next Question" : "Slide to answer"}
      </button>
    </div>
  )
}
