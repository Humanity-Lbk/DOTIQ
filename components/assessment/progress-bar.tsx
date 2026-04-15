"use client"

import { useAssessmentStore } from "@/lib/assessment-store"
import { questions, categories, type Category } from "@/lib/assessment-data"

export function ProgressBar() {
  const { currentQuestion, answers } = useAssessmentStore()
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length
  
  const currentCategory = questions[currentQuestion]?.category
  const categoryInfo = currentCategory ? categories[currentCategory] : null

  return (
    <div className="flex flex-col gap-3">
      {/* Progress info */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-foreground">{currentQuestion + 1}</span>
          <span className="text-muted-foreground">/ {questions.length}</span>
        </div>
        <span className="text-muted-foreground">{answeredCount} answered</span>
      </div>
      
      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Category badge */}
      {categoryInfo && (
        <div className="flex items-center gap-2">
          <CategoryBadge category={currentCategory as Category} />
          <span className="text-xs text-muted-foreground truncate">{categoryInfo.description}</span>
        </div>
      )}
    </div>
  )
}

function CategoryBadge({ category }: { category: Category }) {
  const colors: Record<Category, string> = {
    discipline: "bg-primary/15 text-primary border-primary/25",
    ownership: "bg-accent/15 text-accent border-accent/25",
    toughness: "bg-chart-3/15 text-chart-3 border-chart-3/25",
    sportsiq: "bg-chart-4/15 text-chart-4 border-chart-4/25",
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[category]}`}>
      {categories[category].name}
    </span>
  )
}
