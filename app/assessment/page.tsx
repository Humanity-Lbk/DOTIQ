"use client"

import { Header } from "@/components/header"
import { Assessment } from "@/components/assessment/assessment"
import { useAssessmentStore } from "@/lib/assessment-store"

export default function AssessmentPage() {
  const { isComplete } = useAssessmentStore()
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {!isComplete && (
            <div className="max-w-2xl mx-auto mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                DOT IQ Assessment
              </h1>
              <p className="text-muted-foreground">
                Answer each question honestly based on how you typically behave, not how you think you should behave.
              </p>
            </div>
          )}
          
          {isComplete && (
            <div className="max-w-2xl mx-auto mb-8 text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Your Results
              </h1>
              <p className="text-muted-foreground">
                {"Here's your DOT IQ breakdown based on your responses."}
              </p>
            </div>
          )}
          
          <Assessment />
        </div>
      </main>
    </div>
  )
}
