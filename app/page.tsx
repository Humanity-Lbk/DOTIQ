'use client'

import Link from 'next/link'
import Header from '@/components/header'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section with Gradient */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-fuchsia-800/30 to-cyan-700/20" />
          <div className="absolute top-0 right-0 w-[60%] h-[80%] bg-gradient-to-bl from-fuchsia-600/30 via-purple-500/20 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[60%] bg-gradient-to-tr from-cyan-500/20 via-purple-500/10 to-transparent blur-3xl" />
          
          <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center space-y-8">
            <p className="text-primary font-semibold text-sm tracking-wide">
              Build better athletes
            </p>
            
            <h1 className="text-5xl md:text-7xl font-black leading-tight text-balance">
              Build slick{' '}
              <span className="text-primary">athletic performance.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
              DOTIQ measures what matters most: Discipline, Ownership, Toughness, and Sports IQ.{' '}
              <span className="text-primary">Unlock the intangibles.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Link 
                href="/assessment"
                className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/25"
              >
                Get started for free
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              DOTIQ is free to start. Join the movement.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-card/50">
          <div className="max-w-6xl mx-auto text-center space-y-16">
            <div className="space-y-4">
              <p className="text-primary font-semibold text-sm tracking-wide">The Assessment</p>
              <h2 className="text-4xl md:text-5xl font-black text-balance">
                Turning Intangibles Into Insight
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The DOTIQ Assessment evaluates athlete behaviors and habits, turning them into clear, development-focused insights you can actually use.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  num: '01',
                  title: 'Complete Assessment',
                  desc: 'Answer 50 questions on a 1-10 scale. Be honest. This is your baseline.',
                },
                {
                  num: '02',
                  title: 'Get Your Report',
                  desc: 'Instant scoring across all four pillars with strengths and growth areas.',
                },
                {
                  num: '03',
                  title: 'Verify Your Score',
                  desc: 'Send to a coach, peer, and mentor for multi-perspective validation.',
                },
                {
                  num: '04',
                  title: 'Take Action',
                  desc: 'Unlock your full report and personalized development resources.',
                },
              ].map((item) => (
                <div
                  key={item.num}
                  className="bg-card border border-border rounded-2xl p-6 space-y-4 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all text-left"
                >
                  <span className="text-primary font-mono text-sm font-bold">{item.num}</span>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="py-24 px-6 border-t border-border">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-destructive font-semibold text-sm tracking-wide">The Problem</p>
                <h2 className="text-4xl font-black">
                  Physical metrics miss the full picture
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  40-yard dash, vertical jump, bat speed, spin rate — these are easy to measure. But what about the traits that truly define champions? The intangibles that separate good athletes from elite performers?
                </p>
                
                <div className="flex flex-wrap gap-3">
                  {['40-Yard Dash', 'Vertical Jump', 'Bat Speed', 'Spin Rate'].map((metric) => (
                    <span key={metric} className="px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground">
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                <p className="text-primary font-semibold text-sm tracking-wide">The Solution</p>
                <h2 className="text-4xl font-black">
                  &quot;IT&quot; can be measured
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Elite performers share four measurable behavioral traits. These are not abstract concepts — they are observable, measurable, and developable.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  {['Discipline', 'Ownership', 'Toughness', 'Sports IQ'].map((trait) => (
                    <span key={trait} className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary font-medium">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Four Pillars Section */}
        <section className="py-24 px-6 bg-card/50 border-t border-border">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <p className="text-primary font-semibold text-sm tracking-wide">The Framework</p>
              <h2 className="text-4xl md:text-5xl font-black">The Four Pillars</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Every elite performer demonstrates these four behavioral traits. DOTIQ measures each one.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  letter: 'D',
                  title: 'Discipline',
                  desc: 'Consistency in preparation, habits, standards, and execution when motivation fades.',
                  color: 'from-green-500 to-emerald-600',
                },
                {
                  letter: 'O',
                  title: 'Ownership',
                  desc: 'Responsibility and accountability for actions, outcomes, and continuous improvement.',
                  color: 'from-purple-500 to-violet-600',
                },
                {
                  letter: 'T',
                  title: 'Toughness',
                  desc: 'Mental, physical, and emotional resilience under pressure, adversity, and failure.',
                  color: 'from-orange-500 to-red-600',
                },
                {
                  letter: 'IQ',
                  title: 'Sports IQ',
                  desc: 'Situational awareness, decision-making speed, and game intelligence.',
                  color: 'from-cyan-500 to-blue-600',
                },
              ].map((pillar) => (
                <div
                  key={pillar.letter}
                  className="bg-card border border-border rounded-2xl p-6 space-y-4 hover:border-primary/50 transition-colors group"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center text-white font-black text-2xl shadow-lg`}>
                    {pillar.letter}
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{pillar.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="py-24 px-6 border-t border-border">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <blockquote className="text-3xl md:text-4xl font-black leading-tight">
              &quot;Most training focuses on what an athlete can DO.{' '}
              <span className="text-primary">We develop who an athlete IS.</span>&quot;
            </blockquote>
            <p className="text-muted-foreground">
              Michael Jordan missed 26 game-winners. Steph Curry misses 58% of 3s. Failure is inherent. Resilience is the differentiator.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 px-6 overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-fuchsia-800/20 to-cyan-700/10" />
          
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-black">The work starts now.</h2>
            <p className="text-lg text-muted-foreground">
              Take the free assessment and discover your athletic mindset profile.
            </p>
            <Link 
              href="/assessment"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/25"
            >
              Begin Assessment
              <span>→</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm">D</span>
            </div>
            <span className="font-bold">DOTIQ</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/assessment" className="hover:text-foreground transition-colors">Assessment</Link>
            <Link href="/auth/login" className="hover:text-foreground transition-colors">Sign In</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Discipline · Ownership · Toughness · IQ
          </p>
        </div>
      </footer>
    </div>
  )
}
