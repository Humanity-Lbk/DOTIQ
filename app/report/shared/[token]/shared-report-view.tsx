'use client'

import Link from 'next/link'
import Image from 'next/image'
import { categories, type Category } from '@/lib/assessment-data'
import { Share2, Download, Lock, ChevronRight, Mail, Zap, Target, Brain, Trophy, TrendingUp, Flame } from 'lucide-react'

interface Assessment {
  id: string
  user_id: string
  name: string
  is_complete: boolean
  scores: Record<string, number>
  created_at: string
  profiles: {
    full_name: string | null
    role: string
  }
}

interface ShareRecord {
  id: string
  assessment_id: string
  shared_at: string
}

interface SharedReportViewProps {
  assessment: Assessment
  shareRecord: ShareRecord
}

export default function SharedReportView({ assessment, shareRecord }: SharedReportViewProps) {
  const scores = assessment.scores || {}
  const dotiScore = scores.overall || 7.0
  const categoryScores = categories.reduce((acc, cat) => {
    acc[cat.key] = scores[cat.key] || 0
    return acc
  }, {} as Record<string, number>)

  const userName = assessment.profiles?.full_name || 'Athlete'

  return (
    <div className="min-h-screen bg-background">
      {/* Public header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="DOTIQ"
              width={160}
              height={48}
              className="h-9 w-auto invert brightness-0"
            />
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            Public Share
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-subtle pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Score Circle */}
            <div className="flex-shrink-0">
              <div className="w-64 h-64 rounded-full border-4 border-primary/30 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-transparent">
                <span className="text-7xl font-bold text-primary">{dotiScore.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground mt-2">DOTIQ SCORE</span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="mb-4 inline-block px-3 py-1 bg-primary/10 rounded-full">
                <span className="text-sm font-medium text-primary">Assessment Report</span>
              </div>
              <h1 className="text-5xl font-bold mb-2">
                <span className="text-primary">{userName}&apos;s</span> Athletic Profile
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                {userName} shows exceptional dedication and potential across your athletic performance metrics.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mt-8">
                {categories.slice(0, 4).map((cat) => (
                  <div key={cat.key} className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                    <cat.icon className="w-6 h-6 text-primary mb-2" />
                    <p className="text-2xl font-bold">{categoryScores[cat.key].toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">{cat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Breakdown */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12">Performance Breakdown</h2>
        
        <div className="space-y-6">
          {categories.map((category) => {
            const score = categoryScores[category.key]
            const progress = (score / 10) * 100
            
            return (
              <div key={category.key} className="group p-6 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <category.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{category.label}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{score.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">/10</p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 mt-16 bg-card/50">
        <div className="max-w-6xl mx-auto px-6 text-center text-muted-foreground">
          <p className="text-sm">
            This report was shared by {userName} on {new Date(shareRecord.shared_at).toLocaleDateString()}
          </p>
          <p className="text-xs mt-2">
            © DOTIQ — Building the Future of Athletic Performance Intelligence
          </p>
        </div>
      </footer>
    </div>
  )
}
