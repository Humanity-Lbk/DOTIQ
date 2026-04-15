'use client'

import { useEffect, useState } from 'react'
import Link from "next/link"
import Header from "@/components/header"

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

export default function AboutPage() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background grid-pattern">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-24 px-6 border-b border-border">
          <div className="max-w-4xl mx-auto space-y-6">
            <p className={`font-mono text-xs text-muted-foreground tracking-widest transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              {'>> SYSTEM_ARCH: ABOUT_DOTIQ'}
            </p>
            <h1 className={`text-5xl md:text-7xl font-black leading-tight transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Measuring What Truly Matters
            </h1>
            <p className={`text-xl text-muted-foreground max-w-2xl transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              DOTIQ is a sports assessment platform designed to quantify and improve the intangibles that separate average athletes from elite competitors. We measure what the scoreboard can&apos;t.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-24 px-6 border-b border-border">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16">
              <div className="space-y-4">
                <p className="font-mono text-xs text-muted-foreground tracking-widest">
                  {'>> MISSION_STATEMENT'}
                </p>
                <h2 className="text-3xl md:text-4xl font-black">
                  Building the Standard for Athletic Character
                </h2>
              </div>

              <div className="space-y-6 text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  Physical talent is measurable. Speed, strength, agility — these are easy to quantify. But what about the traits that truly define champions?
                </p>
                <p className="text-lg leading-relaxed">
                  DOTIQ exists to measure what coaches have always known matters: <span className="text-foreground font-medium">Discipline, Ownership, Toughness, and Sports IQ</span>. We&apos;re building who an athlete IS, not just what they can DO.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Framework */}
        <section className="py-24 px-6 bg-card/30 border-b border-border">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-4">
              <p className="font-mono text-xs text-muted-foreground tracking-widest">
                {'>> METRIC_TYPE: BEHAVIORAL · STATUS: '}<span className="text-primary">QUANTIFIED</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-black">The Four Pillars</h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Elite performers share four measurable behavioral traits. These are not abstract concepts — they are observable, measurable, and developable.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {pillars.map((pillar, i) => (
                <div
                  key={pillar.letter}
                  className="card-premium bg-card border border-border rounded-lg p-6 space-y-4 animate-fade-in-up"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-muted border-l-2 border-primary flex items-center justify-center">
                      <span className="font-black text-2xl">{pillar.letter}</span>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground tracking-wider">BEHAVIORAL</p>
                      <h3 className="font-bold">{pillar.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="py-24 px-6 border-b border-border">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16">
              <div className="space-y-4">
                <p className="font-mono text-xs text-muted-foreground tracking-widest">
                  {'>> TARGET_AUDIENCE'}
                </p>
                <h2 className="text-3xl md:text-4xl font-black">
                  Athletes at Every Level
                </h2>
                <p className="text-lg text-muted-foreground">
                  DOTIQ is designed for athletes from late elementary through high school and beyond.
                </p>
              </div>

              <ul className="space-y-3">
                {[
                  { label: 'Youth Athletes', desc: 'Building their foundation' },
                  { label: 'High School Athletes', desc: 'Preparing for recruitment' },
                  { label: 'Coaches', desc: 'Seeking deeper insight into their athletes' },
                  { label: 'Parents', desc: 'Investing in holistic development' },
                ].map((item, i) => (
                  <li 
                    key={item.label} 
                    className="flex items-start gap-4 bg-card border border-border rounded-lg p-4 card-premium animate-fade-in-up"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                    <div>
                      <span className="font-bold">{item.label}</span>
                      <span className="text-muted-foreground"> — {item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Quote */}
        <section className="py-32 px-6 border-b border-border">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <blockquote className="text-2xl md:text-4xl font-black leading-tight italic">
              &quot;Most training focuses on what an athlete can DO. <span className="text-primary">We develop who an athlete IS.</span>&quot;
            </blockquote>
            <p className="font-mono text-xs text-muted-foreground tracking-widest">
              {'>> JOIN THE MOVEMENT'}
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <p className="font-mono text-xs text-muted-foreground tracking-widest">
              {'>> SYSTEM_STATUS: AWAITING_INPUT'}
            </p>
            <h2 className="text-3xl md:text-4xl font-black">
              Ready to Discover Your DOTIQ?
            </h2>
            <p className="text-lg text-muted-foreground">
              Take the free assessment and unlock insights into the mental game that defines champions.
            </p>
            <Link 
              href="/assessment" 
              className="group inline-flex items-center gap-3 px-8 py-4 text-primary-foreground font-semibold rounded-lg hover:scale-105 transition-transform duration-300 animate-shimmer-sweep"
            >
              Get Started
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-bold text-sm tracking-wider">DOTIQ</span>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            D · O · T · IQ
          </p>
        </div>
      </footer>
    </div>
  )
}
