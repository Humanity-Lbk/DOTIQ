"use client"

import { Button } from "@/components/ui/button"
import { useAssessmentStore } from "@/lib/assessment-store"
import { categories, type Category } from "@/lib/assessment-data"
import { RefreshCw } from "lucide-react"

export function ResultsView() {
  const { calculateScores, resetAssessment } = useAssessmentStore()
  const scores = calculateScores()

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { label: "Elite", color: "text-chart-2" }
    if (score >= 75) return { label: "Strong", color: "text-chart-1" }
    if (score >= 60) return { label: "Developing", color: "text-chart-4" }
    return { label: "Emerging", color: "text-muted-foreground" }
  }

  const totalLevel = getScoreLevel(scores.total)

  return (
    <div className="flex flex-col gap-10">
      {/* Overall Score */}
      <div className="text-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
          Your DOT IQ Score
        </p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-7xl md:text-8xl font-bold text-foreground">
            {scores.total}
          </span>
        </div>
        <p className={`text-xl font-semibold mt-2 ${totalLevel.color}`}>
          {totalLevel.label}
        </p>
      </div>

      {/* Category Breakdown */}
      <div className="flex flex-col gap-6">
        <h3 className="text-lg font-semibold text-foreground">Category Breakdown</h3>
        
        <div className="grid gap-4">
          {(Object.keys(categories) as Category[]).map((category) => {
            const score = scores.categories[category]
            const level = getScoreLevel(score)
            const categoryColors: Record<Category, string> = {
              discipline: "bg-chart-1",
              ownership: "bg-chart-2",
              toughness: "bg-chart-3",
              sportsiq: "bg-chart-4",
            }

            return (
              <div key={category} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">
                      {categories[category].name}
                    </span>
                    <span className={`text-sm ${level.color}`}>{level.label}</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">{score}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${categoryColors[category]} transition-all duration-500 rounded-full`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {categories[category].description}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* What's Next */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">{"What's Next?"}</h3>
        <p className="text-muted-foreground mb-4">
          This is your baseline DOT IQ score. To unlock detailed reports and personalized development plans, create an account and invite coaches or teammates for peer validation.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1">
            Create Account
          </Button>
          <Button variant="outline" className="flex-1" onClick={resetAssessment}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retake Assessment
          </Button>
        </div>
      </div>
    </div>
  )
}
