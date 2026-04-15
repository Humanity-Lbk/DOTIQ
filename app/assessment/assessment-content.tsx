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
      
      {/* Grid background - subtle SaaS pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--border) 1px, transparent 1px),
              linear-gradient(to bottom, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px'
          }}
        />
        {/* Subtle gradient orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      </div>
      
      <main className="flex-1 flex flex-col">
        {!isComplete ? (
          <div className="flex-1 flex flex-col">
            {/* Top section with branding */}
            <div className="pt-12 pb-8 px-6">
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-medium text-primary">Assessment in progress</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  Discover what sets you apart
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  No right answers. Just honest ones.
                </p>
              </div>
            </div>
            
            {/* Assessment card area */}
            <div className="flex-1 flex items-start justify-center px-6 pb-12">
              <div className="w-full max-w-xl">
                <Assessment />
              </div>
            </div>
          </div>
        ) : (
          <PreviewReport />
        )}
      </main>
    </div>
  )
}
