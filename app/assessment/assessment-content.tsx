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
      
      <main className="flex-1">
        {!isComplete ? (
          <div className="max-w-xl mx-auto px-6 py-8 sm:py-12">
            {/* Minimal Header */}
            <div className="mb-6 text-center">
              <p className="font-mono text-[10px] text-muted-foreground/60 tracking-wider">
                ANSWER HONESTLY · AUTO-SAVES
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
