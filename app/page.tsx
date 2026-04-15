'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/header'
import { TypewriterText } from '@/components/ui/typewriter-text'

const pillars = [
  { letter: 'D', title: 'Discipline', desc: 'Consistency when motivation fades' },
  { letter: 'O', title: 'Ownership', desc: 'Accountability for outcomes' },
  { letter: 'T', title: 'Toughness', desc: 'Resilience under pressure' },
  { letter: 'IQ', title: 'Sports IQ', desc: 'Decision-making speed' },
]

const steps = [
  { num: '01', title: 'Assess', desc: '50 questions. 10 minutes. Be honest.' },
  { num: '02', title: 'Score', desc: 'Instant results across all four pillars.' },
  { num: '03', title: 'Verify', desc: 'Get scored by coach, peer, mentor.' },
  { num: '04', title: 'Develop', desc: 'Personalized action plan.' },
]

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center px-6 grid-subtle">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Status Line */}
            <div className={`transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              <p className="font-mono text-xs text-muted-foreground tracking-wider inline-flex items-center gap-2">
                <span className="status-dot status-active" />
                <TypewriterText text="SYSTEM ACTIVE" delay={300} speed={40} showCursor={false} />
              </p>
            </div>
            
            {/* Main Headline */}
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              Measure What the<br />
              <span className="text-primary animate-text-glow">Scoreboard Can&apos;t</span>
            </h1>
            
            {/* Subhead */}
            <p className={`text-base sm:text-lg text-muted-foreground max-w-xl mx-auto transition-all duration-700 delay-200 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              The DOTIQ Assessment quantifies the intangibles that separate good athletes from great ones.
            </p>
            
            {/* CTA */}
            <div className={`pt-4 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link 
                href="/assessment"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:scale-105 transition-all duration-300 animate-glow-pulse"
              >
                Take the Assessment
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <p className="mt-3 text-xs text-muted-foreground">
                Free · 10 minutes · Instant results
              </p>
            </div>
          </div>
        </section>

        {/* The Four Pillars - Compact */}
        <section className="py-16 px-6 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <p className="font-mono text-xs text-primary mb-2">
                <TypewriterText text=">> FOUR PILLARS" delay={800} speed={30} showCursor={false} />
              </p>
              <h2 className="text-2xl sm:text-3xl font-black">What We Measure</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {pillars.map((pillar, i) => (
                <div
                  key={pillar.letter}
                  className={`card-hover bg-card border border-border rounded-lg p-4 text-center transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${400 + i * 100}ms` }}
                >
                  <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="font-black text-primary text-sm">{pillar.letter}</span>
                  </div>
                  <h3 className="font-bold text-sm mb-1">{pillar.title}</h3>
                  <p className="text-xs text-muted-foreground">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process - Compact */}
        <section className="py-16 px-6 bg-card/30 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <p className="font-mono text-xs text-primary mb-2">
                <TypewriterText text=">> HOW IT WORKS" delay={1200} speed={30} showCursor={false} />
              </p>
              <h2 className="text-2xl sm:text-3xl font-black">Simple Process</h2>
            </div>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className={`relative p-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${600 + i * 100}ms` }}
                >
                  <span className="text-3xl font-black text-primary/20">{step.num}</span>
                  <h3 className="font-bold mt-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quote - Minimal */}
        <section className="py-20 px-6 border-t border-border">
          <div className="max-w-2xl mx-auto text-center">
            <blockquote className="text-xl sm:text-2xl font-bold leading-relaxed">
              &quot;Most training focuses on what athletes can do.
              <span className="text-primary"> We measure who they are.</span>&quot;
            </blockquote>
          </div>
        </section>

        {/* Final CTA - Compact */}
        <section className="py-16 px-6 border-t border-border bg-card/30">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <p className="font-mono text-xs text-muted-foreground">
              <TypewriterText text=">> READY TO START" delay={1600} speed={30} showCursor={false} />
            </p>
            <h2 className="text-2xl sm:text-3xl font-black">Discover Your Score</h2>
            <Link 
              href="/assessment"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:scale-105 transition-all duration-300"
            >
              Begin Assessment
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer - Minimal */}
      <footer className="border-t border-border py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/">
            <Image src="/logo.png" alt="DOTIQ" width={80} height={26} className="h-5 w-auto invert brightness-0" />
          </Link>
          <p className="font-mono text-xs text-muted-foreground">
            D · O · T · IQ
          </p>
        </div>
      </footer>
    </div>
  )
}
