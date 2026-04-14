'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/header'

const measurableMetrics = ['40-Yard Dash', 'Vertical Jump', 'Bat Speed', 'Spin Rate', 'Launch Angle']
const unknownMetrics = ['Discipline', 'Ownership', 'Toughness', 'Sports IQ']

const pillars = [
  {
    letter: 'D',
    title: 'DISCIPLINE',
    desc: 'Consistency in preparation, habits, standards, and execution when motivation fades.',
  },
  {
    letter: 'O',
    title: 'OWNERSHIP',
    desc: 'Responsibility and accountability for actions, outcomes, and continuous improvement.',
  },
  {
    letter: 'T',
    title: 'TOUGHNESS',
    desc: 'Mental, physical, and emotional resilience under pressure, adversity, and failure.',
  },
  {
    letter: 'IQ',
    title: 'SPORTS IQ',
    desc: 'Situational awareness, decision-making speed, and game intelligence.',
  },
]

const steps = [
  {
    num: '01',
    label: 'INTAKE',
    title: 'Complete the Assessment',
    desc: 'Answer 50 questions on a 1-10 scale. Be honest. This is your baseline.',
  },
  {
    num: '02',
    label: 'INTELLIGENCE',
    title: 'Get Your Report',
    desc: 'Instant scoring across all four pillars with strengths, pressure points, and narratives.',
  },
  {
    num: '03',
    label: 'EXECUTION',
    title: 'Take Action',
    desc: 'Your personalized action plan with reset scripts, weekly focus, and growth targets.',
  },
  {
    num: '04',
    label: 'RESOURCES',
    title: 'Resources',
    desc: 'Additional tools and materials to support your development journey.',
  },
]

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background grid-pattern">
      <Header />
      
      <main className="flex-1">
        {/* System Status Bar */}
        <div className={`border-b border-border py-3 px-6 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-xs font-mono text-muted-foreground">
            <span>SYS.INIT: DOTIQ_CORE</span>
            <span className="text-border">|</span>
            <span>V.2026.1.0</span>
            <span className="text-border">|</span>
            <span>STATUS: <span className="text-green-500">ACTIVE</span></span>
            <span className="text-border">|</span>
            <span>TARGET: ATHLETIC_INTELLIGENCE</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-6">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Tagline */}
            <p className={`font-mono text-sm text-muted-foreground tracking-widest transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {'>> DOT IN · BE IQ'}
            </p>
            
            {/* Main Headline */}
            <h1 className={`text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Building the Future of<br />
              <span className="text-primary animate-text-glow">Athletic Performance</span><br />
              Intelligence
            </h1>
            
            {/* Subhead */}
            <p className={`text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              The question isn&apos;t just what athletes can do — it&apos;s who they become when the lights come on. DOTIQ measures what the scoreboard can&apos;t.
            </p>
            
            {/* Predictive Accuracy Warning */}
            <p className={`font-mono text-xs text-muted-foreground tracking-wider transition-all duration-700 delay-400 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              {'>> PREDICTIVE_ACCURACY: '}<span className="text-destructive">LOW</span>{' WITHOUT INTANGIBLES'}
            </p>
            
            {/* Primary CTA */}
            <div className={`pt-4 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link 
                href="/assessment"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:scale-105 transition-all duration-300 animate-glow-pulse"
              >
                Take the DOTIQ Assessment
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                Free. Quick signup. About 10 minutes.
              </p>
            </div>
            
            {/* Secondary CTAs */}
            <div className={`flex items-center justify-center gap-4 pt-4 transition-all duration-700 delay-600 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              <Link 
                href="/evaluate"
                className="group flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-all"
              >
                Coach Assessment
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
              <span className="text-muted-foreground text-sm">or</span>
              <Link 
                href="/evaluate"
                className="group flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-all"
              >
                Peer Assessment
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Missing Data Section */}
        <section className="py-24 px-6 border-t border-border">
          <div className="max-w-6xl mx-auto space-y-16">
            {/* Error Header */}
            <div className="space-y-8">
              <p className="font-mono text-sm text-destructive tracking-wider animate-fade-in">
                ERR: MISSING_DATA
              </p>
              
              {/* Current Standard */}
              <div className="space-y-4">
                <p className="font-mono text-xs text-muted-foreground tracking-widest">
                  CURRENT STANDARD: &quot;WHAT THEY CAN DO&quot;
                </p>
                <div className="flex flex-wrap gap-3">
                  {measurableMetrics.map((metric, i) => (
                    <div 
                      key={metric}
                      className="px-4 py-2.5 border border-border rounded-lg text-sm animate-fade-in-up"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <span className="font-mono text-xs text-muted-foreground mr-2">[MEASURABLE]</span>
                      <span className="text-foreground">{metric}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* The Missing Link */}
              <div className="space-y-4 pt-8">
                <p className="font-mono text-xs text-primary tracking-widest">
                  {'>> THE MISSING LINK: "WHO THEY ARE"'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {unknownMetrics.map((metric, i) => (
                    <div 
                      key={metric}
                      className="px-4 py-3 bg-primary/10 border border-primary/30 rounded-lg animate-fade-in-up animate-border-glow"
                      style={{ animationDelay: `${(i + 5) * 100}ms` }}
                    >
                      <span className="font-mono text-xs text-primary mr-2">[UNKNOWN]</span>
                      <span className="text-foreground font-medium">{metric}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Quote */}
            <blockquote className="text-lg md:text-xl text-muted-foreground italic text-center max-w-4xl mx-auto leading-relaxed">
              &quot;Michael Jordan missed 26 game-winners. Steph Curry misses 58% of 3s. Failure is inherent. <span className="text-foreground font-medium">Resilience is the differentiator.</span>&quot;
            </blockquote>
          </div>
        </section>

        {/* "IT" Can Be Measured Section */}
        <section className="py-24 px-6 bg-card/30 border-t border-border">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="max-w-3xl space-y-4">
              <p className="font-mono text-xs text-muted-foreground tracking-widest">
                DATA_SOURCE: FOUNDER_EXPERIENCE
              </p>
              <h2 className="text-4xl md:text-5xl font-black leading-tight">
                &quot;IT&quot; Can Be Measured
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Elite performers share four measurable behavioral traits. These are not abstract concepts — they are observable, measurable, and developable.
              </p>
            </div>

            {/* Metric Type Header */}
            <div className="font-mono text-xs text-muted-foreground tracking-widest">
              {'>> METRIC_TYPE: BEHAVIORAL · STATUS: '}<span className="text-primary">QUANTIFIED</span>
            </div>

            {/* Four Pillars Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pillars.map((pillar, i) => (
                <div
                  key={pillar.letter}
                  className="card-premium bg-card border border-border rounded-lg p-6 space-y-4 animate-fade-in-up"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border-l-2 border-primary">
                      <span className="font-black text-lg text-foreground">{pillar.letter}</span>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground">BEHAVIORAL</p>
                      <h3 className="font-bold text-sm">{pillar.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Assessment Protocol Section */}
        <section className="py-24 px-6 border-t border-border">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="max-w-3xl space-y-4">
              <p className="font-mono text-xs text-muted-foreground tracking-widest">
                SYSTEM_ARCH: ASSESSMENT_PROTOCOL
              </p>
              <h2 className="text-4xl md:text-5xl font-black leading-tight">
                Turning Intangibles Into Insight
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The DOTIQ Assessment evaluates athletes behaviors and habits and turns them into clear, development-focused insights athletes can actually use.
              </p>
            </div>

            {/* Process Steps */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className="card-premium bg-card border border-border rounded-lg p-6 space-y-4 animate-fade-in-up"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-primary">{step.num}</span>
                    <span className="font-mono text-xs text-muted-foreground">// {step.label}</span>
                  </div>
                  <h3 className="font-bold text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="py-32 px-6 border-t border-border relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
          
          <div className="relative max-w-4xl mx-auto text-center space-y-8">
            <blockquote className="text-2xl md:text-4xl font-black leading-tight italic">
              &quot;Most training focuses on what an athlete can DO. <span className="text-primary">We develop who an athlete IS.</span>&quot;
            </blockquote>
            <p className="font-mono text-xs text-muted-foreground tracking-widest">
              {'>> JOIN THE MOVEMENT'}
            </p>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 px-6 border-t border-border">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <p className="font-mono text-xs text-muted-foreground tracking-widest">
              {'>> SYSTEM_STATUS: AWAITING_INPUT'}
            </p>
            <h2 className="text-4xl md:text-5xl font-black">
              The work starts now.
            </h2>
            <Link 
              href="/assessment"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:scale-105 transition-all duration-300 animate-glow-pulse"
            >
              Begin Assessment
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="block">
            <Image src="/logo.png" alt="DOTIQ" width={80} height={26} className="h-5 w-auto invert brightness-0" />
          </Link>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/assessment" className="hover:text-foreground transition-colors">Assessment</Link>
            <Link href="/auth/login" className="hover:text-foreground transition-colors">Sign In</Link>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            D · O · T · IQ
          </p>
        </div>
      </footer>
    </div>
  )
}
