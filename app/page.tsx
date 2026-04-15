'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/header'
import { TypewriterText } from '@/components/ui/typewriter-text'

const pillars = [
  { letter: 'D', title: 'Discipline', desc: 'Consistency when motivation fades', color: 'text-neon-gold' },
  { letter: 'O', title: 'Ownership', desc: 'Accountability for outcomes', color: 'text-neon-lime' },
  { letter: 'T', title: 'Toughness', desc: 'Resilience under pressure', color: 'text-neon-pink' },
  { letter: 'IQ', title: 'Sports IQ', desc: 'Decision-making speed', color: 'text-neon-cyan' },
]

const steps = [
  { num: '01', title: 'Assess', desc: '50 questions. 10 minutes. Be honest.' },
  { num: '02', title: 'Score', desc: 'Instant results across all four pillars.' },
  { num: '03', title: 'Verify', desc: 'Get scored by coach, peer, mentor.' },
  { num: '04', title: 'Develop', desc: 'Personalized action plan.' },
]

const apparel = [
  { id: 1, name: 'Elite Cap', price: '$42', image: '/images/apparel/hat-gold.jpg', tag: 'NEW' },
  { id: 2, name: 'Neon Hoodie', price: '$85', image: '/images/apparel/hoodie-neon.jpg', tag: 'HOT' },
  { id: 3, name: 'Graphic Tee', price: '$38', image: '/images/apparel/tshirt-pattern.jpg', tag: null },
  { id: 4, name: 'Performance Socks', price: '$18', image: '/images/apparel/socks-bright.jpg', tag: null },
  { id: 5, name: 'Elite Joggers', price: '$72', image: '/images/apparel/joggers-elite.jpg', tag: 'NEW' },
  { id: 6, name: 'Varsity Jacket', price: '$145', image: '/images/apparel/jacket-varsity.jpg', tag: 'LIMITED' },
]

const videos = [
  { id: 1, title: 'The Discipline Code', speaker: 'Marcus Thompson', role: 'Former MLB Player', duration: '18:42', image: '/images/videos/discipline-ep.jpg', pillar: 'discipline', color: 'border-neon-gold' },
  { id: 2, title: 'Own Your Game', speaker: 'Coach Sarah Chen', role: 'D1 Head Coach', duration: '24:15', image: '/images/videos/ownership-ep.jpg', pillar: 'ownership', color: 'border-neon-lime' },
  { id: 3, title: 'Built Different', speaker: 'Derek Williams', role: 'Sports Psychologist', duration: '21:08', image: '/images/videos/toughness-ep.jpg', pillar: 'toughness', color: 'border-neon-pink' },
  { id: 4, title: 'Read The Game', speaker: 'Tony Reyes', role: 'Hitting Coach, MLB', duration: '19:33', image: '/images/videos/sportsiq-ep.jpg', pillar: 'sportsiq', color: 'border-neon-cyan' },
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
        <section className="relative py-10 md:py-16 flex items-center justify-center px-6 grid-subtle overflow-hidden min-h-[90vh]">
          {/* Layered ambient glows — gold center, neon flanks */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/3 left-[10%] w-[320px] h-[320px] bg-[var(--neon-lime)]/6 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-[8%] w-[280px] h-[280px] bg-[var(--neon-pink)]/6 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[15%] right-[15%] w-[180px] h-[180px] bg-[var(--neon-cyan)]/5 rounded-full blur-[80px] pointer-events-none" />

          {/* Decorative pillar letters — large, faded, positioned */}
          <span aria-hidden="true" className="absolute left-[4%] top-1/2 -translate-y-1/2 text-[180px] font-black text-neon-gold opacity-[0.04] select-none pointer-events-none leading-none">D</span>
          <span aria-hidden="true" className="absolute right-[3%] top-[30%] text-[140px] font-black text-neon-lime opacity-[0.04] select-none pointer-events-none leading-none">IQ</span>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            {/* System Status Bar */}
            <div className={`mb-8 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-card/60 border border-border/80 rounded-full backdrop-blur-sm">
                <span className="status-dot status-active" />
                <TypewriterText 
                  text="SYS.INIT: DOTIQ_CORE  V.2026.1.0  STATUS: ACTIVE" 
                  className="font-mono text-[10px] text-muted-foreground tracking-wider"
                  delay={200} 
                  speed={25} 
                  showCursor={false} 
                />
              </div>
            </div>
            
            {/* Main Headline */}
            <div className={`mb-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-black leading-[0.92] tracking-tight text-balance">
                Building the Future of{' '}
                <span className="gradient-text-gold animate-text-glow">Athletic Performance</span>{' '}
                Intelligence
              </h1>
            </div>
            
            {/* Pillar color chips */}
            <div className={`flex flex-wrap justify-center gap-2 mb-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              {[
                { label: 'DISCIPLINE', cls: 'text-neon-gold border-[var(--neon-gold)]/30 bg-[var(--neon-gold)]/5' },
                { label: 'OWNERSHIP',  cls: 'text-neon-lime  border-[var(--neon-lime)]/30  bg-[var(--neon-lime)]/5'  },
                { label: 'TOUGHNESS', cls: 'text-neon-pink  border-[var(--neon-pink)]/30  bg-[var(--neon-pink)]/5'  },
                { label: 'SPORTS IQ', cls: 'text-neon-cyan  border-[var(--neon-cyan)]/30  bg-[var(--neon-cyan)]/5'  },
              ].map(({ label, cls }) => (
                <span key={label} className={`font-mono text-[10px] tracking-widest px-3 py-1 rounded-full border ${cls}`}>
                  {label}
                </span>
              ))}
            </div>

            {/* Subhead */}
            <p className={`text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 transition-all duration-700 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              The question isn&apos;t just what athletes can do — it&apos;s who they become when the lights come on. DOTIQ measures what the scoreboard can&apos;t.
            </p>
            
            {/* System Message */}
            <div className={`mb-10 transition-all duration-700 delay-400 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              <TypewriterText 
                text=">> PREDICTIVE_ACCURACY: LOW WITHOUT INTANGIBLES" 
                className="font-mono text-xs text-muted-foreground"
                delay={1500} 
                speed={20} 
                showCursor={false} 
              />
            </div>
            
            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-3 justify-center transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link 
                href="/assessment"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-primary-foreground font-bold rounded-lg hover:scale-[1.03] transition-transform duration-300 animate-shimmer-sweep text-base"
              >
                Take the DOTIQ Assessment
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-card border border-border text-foreground font-semibold rounded-lg hover:border-primary/50 transition-all duration-300 text-base"
              >
                Sign In
              </Link>
            </div>
            <p className={`text-sm text-muted-foreground mt-4 transition-all duration-700 delay-600 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              Free. Quick signup. About 10 minutes.
            </p>
          </div>
        </section>

        {/* Missing Data Section */}
        <section className="py-20 px-6 border-t border-border bg-card/30">
          <div className="max-w-5xl mx-auto">
            <div className={`text-center mb-12 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              <TypewriterText 
                text="ERR: MISSING_DATA" 
                className="font-mono text-xs text-destructive mb-3 block"
                delay={2000} 
                speed={30} 
                showCursor={false} 
              />
              <p className="font-mono text-sm text-muted-foreground mb-8">
                CURRENT STANDARD: &quot;WHAT THEY CAN DO&quot;
              </p>
              
              {/* Measurable Pills */}
              <div className="flex flex-wrap justify-center gap-2 mb-10">
                {['40-Yard Dash', 'Vertical Jump', 'Bat Speed', 'Spin Rate', 'Launch Angle'].map((item) => (
                  <span key={item} className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground">
                    <span className="font-mono text-[10px] text-muted-foreground mr-2">[MEASURABLE]</span>
                    {item}
                  </span>
                ))}
              </div>
              
              <TypewriterText 
                text=">> THE MISSING LINK: &quot;WHO THEY ARE&quot;" 
                className="font-mono text-xs text-accent mb-6 block"
                delay={2500} 
                speed={25} 
                showCursor={false} 
              />
              
              {/* Unknown Pills - The Four Pillars */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                {pillars.map((pillar, i) => (
                  <div 
                    key={pillar.letter}
                    className={`px-4 py-3 bg-card border border-border rounded-lg text-left transition-all duration-500 card-hover ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${2600 + i * 100}ms` }}
                  >
                    <span className={`font-mono text-[10px] ${pillar.color}`}>[UNKNOWN]</span>
                    <span className="block font-bold mt-1">{pillar.title}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quote */}
            <blockquote className="text-center text-lg sm:text-xl italic text-muted-foreground max-w-3xl mx-auto">
              &quot;Michael Jordan missed 26 game-winners. Steph Curry misses 58% of 3s. 
              <span className="text-primary not-italic font-semibold"> Failure is inherent. Resilience is the differentiator.</span>&quot;
            </blockquote>
          </div>
        </section>

        {/* IT Can Be Measured */}
        <section className="py-20 px-6 border-t border-border">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <TypewriterText 
                text="DATA_SOURCE: FOUNDER_EXPERIENCE" 
                className="font-mono text-xs text-muted-foreground mb-2 block"
                delay={3000} 
                speed={25} 
                showCursor={false} 
              />
              <h2 className="text-4xl sm:text-5xl font-black mb-4">&quot;IT&quot; Can Be Measured</h2>
              <p className="text-muted-foreground max-w-2xl">
                Elite performers share four measurable behavioral traits. These are not abstract concepts — they are observable, measurable, and developable.
              </p>
            </div>
            
            <TypewriterText 
              text=">> METRIC_TYPE: BEHAVIORAL · STATUS: QUANTIFIED" 
              className="font-mono text-xs text-primary mb-6 block"
              delay={3500} 
              speed={20} 
              showCursor={false} 
            />
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {pillars.map((pillar, i) => (
                <div
                  key={pillar.letter}
                  className={`card-hover bg-card border border-border rounded-xl p-5 space-y-3 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${3600 + i * 150}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-muted border-l-4 ${pillar.color.replace('text-', 'border-')} flex items-center justify-center`}>
                      <span className={`font-black ${pillar.color}`}>{pillar.letter}</span>
                    </div>
                    <h3 className="font-bold text-lg">{pillar.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 px-6 bg-card/30 border-t border-border">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <TypewriterText 
                text="SYSTEM_ARCH: ASSESSMENT_PROTOCOL" 
                className="font-mono text-xs text-muted-foreground mb-2 block"
                delay={4000} 
                speed={25} 
                showCursor={false} 
              />
              <h2 className="text-3xl sm:text-4xl font-black mb-2">Turning Intangibles Into Insight</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                The DOTIQ Assessment evaluates athletes&apos; behaviors and habits and turns them into clear, development-focused insights.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className={`relative transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${4100 + i * 100}ms` }}
                >
                  <div className="bg-card border border-border rounded-xl p-5 h-full space-y-3">
                    <span className={`text-3xl font-black ${['text-neon-gold', 'text-neon-lime', 'text-neon-pink', 'text-neon-cyan'][i]}`}>{step.num}</span>
                    <span className="font-mono text-[10px] text-muted-foreground ml-2">// {['INTAKE', 'INTELLIGENCE', 'EXECUTION', 'RESOURCES'][i]}</span>
                    <h3 className="font-bold text-lg">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="py-24 px-6 border-t border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <blockquote className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug italic">
              &quot;Most training focuses on what an athlete can DO. <span className="text-primary not-italic">We develop who an athlete IS.</span>&quot;
            </blockquote>
            <TypewriterText 
              text=">> JOIN_THE_MOVEMENT" 
              className="font-mono text-xs text-muted-foreground mt-8 block"
              delay={4500} 
              speed={30} 
              showCursor={false} 
            />
          </div>
        </section>

        {/* DOTIQ TV - Netflix Style Video Section */}
        <section className="py-20 px-6 border-t border-border bg-card/30">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <TypewriterText 
                  text=">> DOTIQ_MEDIA : STREAM_AVAILABLE" 
                  className="font-mono text-xs text-muted-foreground mb-2 block"
                  delay={5000} 
                  speed={20} 
                  showCursor={false} 
                />
                <h2 className="text-3xl sm:text-4xl font-black">DOTIQ TV</h2>
                <p className="text-muted-foreground mt-1">Learn from the minds who&apos;ve mastered the intangibles.</p>
              </div>
              <Link href="#" className="hidden sm:flex items-center gap-2 text-sm text-primary hover:underline">
                Browse All <span>→</span>
              </Link>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {videos.map((video, i) => (
                <div 
                  key={video.id}
                  className={`group cursor-pointer transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${5100 + i * 100}ms` }}
                >
                  <div className={`relative aspect-video rounded-lg overflow-hidden border-2 ${video.color} mb-3`}>
                    <Image 
                      src={video.image} 
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="font-mono text-[10px] text-white/70">{video.duration}</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold group-hover:text-primary transition-colors">{video.title}</h3>
                  <p className="text-sm text-muted-foreground">{video.speaker}</p>
                  <p className="text-xs text-muted-foreground">{video.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Apparel Drops Section */}
        <section className="py-20 px-6 border-t border-border">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <TypewriterText 
                  text=">> APPAREL_DROP : NEW_COLLECTION" 
                  className="font-mono text-xs text-accent mb-2 block"
                  delay={5500} 
                  speed={20} 
                  showCursor={false} 
                />
                <h2 className="text-3xl sm:text-4xl font-black">Apparel Drops</h2>
                <p className="text-muted-foreground mt-1">Wear the mindset. Rep the movement.</p>
              </div>
              <Link href="#" className="hidden sm:flex items-center gap-2 text-sm text-primary hover:underline">
                Shop All <span>→</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {apparel.map((item, i) => (
                <div 
                  key={item.id}
                  className={`group cursor-pointer transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${5600 + i * 80}ms` }}
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-card border border-border group-hover:border-primary/50 transition-colors mb-2">
                    <Image 
                      src={item.image} 
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {item.tag && (
                      <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded ${
                        item.tag === 'NEW' ? 'bg-accent text-accent-foreground' :
                        item.tag === 'HOT' ? 'bg-destructive text-destructive-foreground' :
                        'bg-primary text-primary-foreground'
                      }`}>
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 border-t border-border bg-card/30 relative overflow-hidden">
          <div className="absolute inset-0 grid-subtle opacity-50" />
          <div className="max-w-xl mx-auto text-center space-y-6 relative z-10">
            <TypewriterText 
              text=">> SYSTEM_STATUS: AWAITING_INPUT" 
              className="font-mono text-xs text-muted-foreground block"
              delay={6000} 
              speed={25} 
              showCursor 
            />
            <h2 className="text-3xl sm:text-4xl font-black">The work starts now.</h2>
            <Link 
              href="/assessment"
              className="group inline-flex items-center gap-2 px-8 py-4 text-primary-foreground font-bold rounded-lg hover:scale-105 transition-transform duration-300 animate-shimmer-sweep"
            >
              Begin Assessment
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <Link href="/">
            <Image src="/logo.png" alt="DOTIQ" width={140} height={40} className="h-8 w-auto invert brightness-0" />
          </Link>
          <p className="font-mono text-xs text-muted-foreground">
            Discipline · Ownership · Toughness · IQ
          </p>
          <div className="flex gap-6">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shop</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
