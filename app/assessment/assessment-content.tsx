"use client"

import Header from "@/components/header"
import { Assessment } from "@/components/assessment/assessment"
import { useAssessmentStore } from "@/lib/assessment-store"
import { PreviewReport } from "@/components/assessment/preview-report"
import { TypewriterText } from "@/components/ui/typewriter-text"

export function AssessmentContent() {
  const { isComplete } = useAssessmentStore()
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {!isComplete ? (
          <div className="max-w-2xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="mb-8 text-center space-y-3">
              <p className="font-mono text-xs text-primary">
                <TypewriterText text=">> ASSESSMENT ACTIVE" delay={100} speed={30} showCursor={false} />
              </p>
              <h1 className="text-3xl sm:text-4xl font-black">
                DOTIQ Assessment
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Answer honestly based on how you actually behave, not how you want to behave.
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
