"use client"

import Header from "@/components/header"
import { Assessment } from "@/components/assessment/assessment"
import { useAssessmentStore } from "@/lib/assessment-store"

export function AssessmentContent() {
  const { isComplete } = useAssessmentStore()
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-16 py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6">
          {!isComplete && (
            <div className="mb-10 text-center">
              <p className="text-primary font-medium mb-3 tracking-wide uppercase text-sm">
                Assessment
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
                DOTIQ Assessment
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Answer each question honestly based on how you typically behave, not how you think you should behave.
              </p>
            </div>
          )}
          
          {isComplete && (
            <div className="mb-10 text-center">
              <p className="text-primary font-medium mb-3 tracking-wide uppercase text-sm">
                Complete
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
                Your DOTIQ Results
              </h1>
              <p className="text-muted-foreground">
                Here&apos;s your breakdown based on your responses.
              </p>
            </div>
          )}
          
          <Assessment />
        </div>
      </main>
    </div>
  )
}
