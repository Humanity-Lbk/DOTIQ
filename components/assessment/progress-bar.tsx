"use client"

import { useAssessmentStore } from "@/lib/assessment-store"
import { questions, type Category } from "@/lib/assessment-data"
import { cn } from "@/lib/utils"

const categoryColors: Record<Category, { bg: string; glow: string }> = {
  discipline: { 
    bg: "bg-[var(--neon-gold)]", 
    glow: "shadow-[0_0_12px_rgba(255,200,50,0.5)]"
  },
  ownership: { 
    bg: "bg-[var(--neon-lime)]", 
    glow: "shadow-[0_0_12px_rgba(150,255,50,0.5)]"
  },
  toughness: { 
    bg: "bg-[var(--neon-pink)]", 
    glow: "shadow-[0_0_12px_rgba(255,100,150,0.5)]"
  },
  sportsiq: { 
    bg: "bg-[var(--neon-cyan)]", 
    glow: "shadow-[0_0_12px_rgba(100,220,255,0.5)]"
  },
}

export function ProgressBar() {
  const { currentQuestion, answers } = useAssessmentStore()
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length
  
  const currentCategory = questions[currentQuestion]?.category
  const colors = currentCategory ? categoryColors[currentCategory] : categoryColors.discipline

  // Calculate section progress (4 sections of ~12-13 questions each)
  const sections: Category[] = ['discipline', 'ownership', 'toughness', 'sportsiq']
  const sectionBoundaries = [0, 13, 25, 38, 50] // Question indices where sections start

  return (
    <div className="flex flex-col gap-4">
      {/* Section indicators */}
      <div className="flex items-center justify-between gap-2">
        {sections.map((section, idx) => {
          const sectionStart = sectionBoundaries[idx]
          const sectionEnd = sectionBoundaries[idx + 1]
          const isActive = currentQuestion >= sectionStart && currentQuestion < sectionEnd
          const isCompleted = currentQuestion >= sectionEnd
          const sectionColors = categoryColors[section]
          
          return (
            <div 
              key={section}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all duration-500",
                isCompleted 
                  ? cn(sectionColors.bg, sectionColors.glow)
                  : isActive 
                    ? "bg-muted overflow-hidden"
                    : "bg-muted/50"
              )}
            >
              {isActive && (
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    sectionColors.bg,
                    sectionColors.glow
                  )}
                  style={{ 
                    width: `${((currentQuestion - sectionStart + 1) / (sectionEnd - sectionStart)) * 100}%` 
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
      
      {/* Progress counter */}
      <div className="flex items-center justify-center">
        <div className="flex items-baseline gap-1 font-mono">
          <span className={cn("text-2xl font-black", `text-[var(--neon-${currentCategory === 'sportsiq' ? 'cyan' : currentCategory === 'toughness' ? 'pink' : currentCategory === 'ownership' ? 'lime' : 'gold'})]`)}>
            {currentQuestion + 1}
          </span>
          <span className="text-muted-foreground/50 text-sm">/ {questions.length}</span>
        </div>
      </div>
    </div>
  )
}
