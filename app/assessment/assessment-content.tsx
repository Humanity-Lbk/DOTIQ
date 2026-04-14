"use client"

import Header from "@/components/header"
import { Assessment } from "@/components/assessment/assessment"
import { useAssessmentStore } from "@/lib/assessment-store"
import { PreviewReport } from "@/components/assessment/preview-report"

export function AssessmentContent() {
  const { isComplete } = useAssessmentStore()
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-16">
        {!isComplete ? (
          <div className="max-w-3xl mx-auto px-6 py-12">
            <div className="mb-10 text-center space-y-4">
              <p className="text-primary font-semibold text-sm tracking-wide">
                The Assessment
              </p>
              <h1 className="text-4xl md:text-5xl font-black">
                DOTIQ Assessment
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Answer each question honestly based on how you typically behave, not how you think you should behave.
              </p>
            </div>
            
            <Assessment />
          </div>
        ) : (
          <PreviewReport />
        )}
      </main>
    </div>
  )
}
