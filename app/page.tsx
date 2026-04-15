'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/header'

const pillars = [
  { letter: 'D', title: 'Discipline', desc: 'Consistency when motivation fades', color: 'text-primary', bg: 'bg-primary/10' },
  { letter: 'O', title: 'Ownership', desc: 'Accountability for outcomes', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { letter: 'T', title: 'Toughness', desc: 'Resilience under pressure', color: 'text-rose-400', bg: 'bg-rose-400/10' },
  { letter: 'IQ', title: 'Sports IQ', desc: 'Decision-making speed', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
]

const steps = [
  { num: '01', title: 'Assess', desc: '50 questions. 10 minutes. Be honest.' },
  { num: '02', title: 'Score', desc: 'Instant results across all four pillars.' },
  { num: '03', title: 'Verify', desc: 'Get scored by coach, peer, mentor.' },
  { num: '04', title: 'Develop', desc: 'Personalized action plan.' },
]

const videos = [
  { id: 1, title: 'The Discipline Code', speaker: 'Marcus Thompson', duration: '18:42', image: '/images/videos/discipline-ep.jpg', color: 'border-primary/40' },
  { id: 2, title: 'Own Your Game', speaker: 'Coach Sarah Chen', duration: '24:15', image: '/images/videos/ownership-ep.jpg', color: 'border-emerald-400/40' },
  { id: 3, title: 'Built Different', speaker: 'Derek Williams', duration: '21:08', image: '/images/videos/toughness-ep.jpg', color: 'border-rose-400/40' },
  { id: 4, title: 'Read The Game', speaker: 'Tony Reyes', duration: '19:33', image: '/images/videos/sportsiq-ep.jpg', color: 'border-cyan-400/40' },
]

const apparel = [
  { id: 1, name: 'Elite Cap', price: '$42', image: '/images/apparel/hat-gold.jpg', tag: 'NEW' },
  { id: 2, name: 'Neon Hoodie', price: '$85', image: '/images/apparel/hoodie-neon.jpg', tag: 'HOT' },
  { id: 3, name: 'Graphic Tee', price: '$38', image: '/images/apparel/tshirt-pattern.jpg', tag: null },
  { id: 4, name: 'Performance Socks', price: '$18', image: '/images/apparel/socks-bright.jpg', tag: null },
  { id: 5, name: 'Elite Joggers', price: '$72', image: '/images/apparel/joggers-elite.jpg', tag: 'NEW' },
  { id: 6, name: 'Varsity Jacket', price: '$145', image: '/images/apparel/jacket-varsity.jpg', tag: 'LIMITED' },
]

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Grid background */}
      <div className="fixed inset-0 grid-subtle pointer-events-none" />
      
      <main className="flex-1 relative">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 px-6 overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            {/* Status Pill */}
            <div className={`mb-8 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/60 border border-border rounded-full backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-muted-foreground font-medium">Now in beta</span>
              </div>
            </div>
            
            {/* Headline */}
            <h1 className={`text-5xl sm:text-6xl md:text-7xl font-black leading-[0.95] tracking-tight mb-6 text-balance transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              The scoreboard shows what you did.{' '}
              <span className="text-primary">We measure who you are.</span>
            </h1>
            
            {/* Subhead */}
            <p className={`text-xl text-muted-foreground max-w-2xl mx-auto mb-8 transition-all duration-700 delay-200 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              DOTIQ quantifies the intangibles that separate good athletes from great ones. 
              Discipline. Ownership. Toughness. Sports IQ.
            </p>
            
            {/* CTAs */}
            <div className={`flex flex-col sm:flex-row gap-3 justify-center transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link 
                href="/assessment"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Take the Assessment
                <span>→</span>
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-6 py-4 bg-card border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
              >
                Sign In
              </Link>
            </div>
            <p className={`text-sm text-muted-foreground mt-4 transition-all duration-700 delay-400 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              Free. 10 minutes. No credit card required.
            </p>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-20 px-6 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm text-muted-foreground mb-3">The problem</p>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                Stats tell you what. Not who.
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                40-yard dash. Vertical jump. Bat speed. Launch angle. 
                These metrics capture ability but miss the mindset that determines success under pressure.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {pillars.map((pillar, i) => (
                <div
                  key={pillar.letter}
                  className={`p-5 bg-card/50 backdrop-blur-sm border border-border rounded-xl hover:border-primary/30 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${400 + i * 100}ms` }}
                >
                  <div className={`w-10 h-10 rounded-lg ${pillar.bg} flex items-center justify-center mb-3`}>
                    <span className={`font-bold text-sm ${pillar.color}`}>{pillar.letter}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quote */}
        <section className="py-16 px-6 border-t border-border bg-card/30">
          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="text-2xl sm:text-3xl font-semibold italic leading-relaxed">
              &ldquo;Michael Jordan missed 26 game-winners. Steph Curry misses 58% of 3s. 
              <span className="text-primary not-italic"> Failure is inherent. Resilience is the differentiator.</span>&rdquo;
            </blockquote>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm text-muted-foreground mb-3">How it works</p>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                From assessment to action
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                A simple process that turns self-awareness into competitive advantage.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className={`p-5 bg-card/50 backdrop-blur-sm border border-border rounded-xl transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${600 + i * 100}ms` }}
                >
                  <span className="text-3xl font-black text-primary">{step.num}</span>
                  <h3 className="font-semibold mt-3 mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Quote */}
        <section className="py-20 px-6 border-t border-border bg-card/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <blockquote className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug">
              &ldquo;Most training focuses on what an athlete can do. 
              <span className="text-primary"> We develop who an athlete is.</span>&rdquo;
            </blockquote>
          </div>
        </section>

        {/* DOTIQ TV */}
        <section className="py-20 px-6 border-t border-border">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm text-muted-foreground mb-1">DOTIQ TV</p>
                <h2 className="text-2xl sm:text-3xl font-black">Learn from the best</h2>
              </div>
              <Link href="#" className="text-sm text-primary hover:underline">
                Browse All →
              </Link>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {videos.map((video, i) => (
                <div 
                  key={video.id}
                  className={`group cursor-pointer transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${800 + i * 100}ms` }}
                >
                  <div className={`relative aspect-video rounded-lg overflow-hidden border ${video.color} mb-3`}>
                    <Image 
                      src={video.image} 
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-xs text-white/80">{video.duration}</span>
                    {/* Premium Overlay */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mb-2">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="text-xs font-semibold text-primary">DOTIQ+</p>
                    </div>
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{video.title}</h3>
                  <p className="text-sm text-muted-foreground">{video.speaker}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Apparel */}
        <section className="py-20 px-6 border-t border-border bg-card/30">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Apparel</p>
                <h2 className="text-2xl sm:text-3xl font-black">Wear the mindset</h2>
              </div>
              <Link href="#" className="text-sm text-primary hover:underline">
                Shop All →
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {apparel.map((item, i) => (
                <div 
                  key={item.id}
                  className={`group cursor-pointer transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${900 + i * 80}ms` }}
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-card border border-border group-hover:border-primary/40 transition-colors mb-2">
                    <Image 
                      src={item.image} 
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.tag && (
                      <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded ${
                        item.tag === 'NEW' ? 'bg-primary text-primary-foreground' :
                        item.tag === 'HOT' ? 'bg-rose-500 text-white' :
                        'bg-amber-500 text-black'
                      }`}>
                        {item.tag}
                      </span>
                    )}
                    {/* Premium Overlay */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <div className="text-center">
                        <p className="text-xs font-semibold text-primary">DOTIQ+</p>
                        <p className="text-[10px] text-white/60">Members Only</p>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 border-t border-border relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="max-w-xl mx-auto text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Ready to see what sets you apart?</h2>
            <p className="text-muted-foreground mb-8">
              Take the assessment. Discover your score. Build your edge.
            </p>
            <Link 
              href="/assessment"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Start Your Assessment
              <span>→</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <Link href="/">
            <Image src="/logo.png" alt="DOTIQ" width={120} height={36} className="h-7 w-auto invert brightness-0" />
          </Link>
          <p className="text-xs text-muted-foreground">
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
