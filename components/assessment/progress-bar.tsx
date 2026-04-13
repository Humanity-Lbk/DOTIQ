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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Question</span>
          <span className="font-bold text-foreground">{currentQuestion + 1}</span>
          <span className="text-muted-foreground">of {questions.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{answeredCount} answered</span>
        </div>
      </div>
      
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {categoryInfo && (
        <div className="flex items-center gap-2">
          <CategoryBadge category={currentCategory as Category} />
          <span className="text-sm text-muted-foreground">{categoryInfo.description}</span>
        </div>
      )}
    </div>
  )
}

function CategoryBadge({ category }: { category: Category }) {
  const colors: Record<Category, string> = {
    discipline: "bg-chart-1/20 text-chart-1 border-chart-1/30",
    ownership: "bg-chart-2/20 text-chart-2 border-chart-2/30",
    toughness: "bg-chart-3/20 text-chart-3 border-chart-3/30",
    sportsiq: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${colors[category]}`}>
      {categories[category].name}
    </span>
  )
}
