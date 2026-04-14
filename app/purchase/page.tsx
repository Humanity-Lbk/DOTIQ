'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/header'
import Checkout from '@/components/checkout'
import { PRODUCTS } from '@/lib/products'

const features = [
  { 
    num: '01',
    label: 'ANALYSIS',
    title: 'Detailed Pillar Breakdown', 
    desc: 'Deep dive into each DOTIQ pillar with specific insights and sub-scores.',
  },
  { 
    num: '02',
    label: 'ACTION',
    title: 'Personalized Action Plan', 
    desc: 'Weekly focus areas, reset scripts, and growth targets tailored to you.',
  },
  { 
    num: '03',
    label: 'RESOURCES',
    title: 'Development Materials', 
    desc: 'Guides, exercises, and tools to support your development journey.',
  },
  { 
    num: '04',
    label: 'ACCESS',
    title: '30-Day Full Access', 
    desc: 'Complete access to your results, reports, and resources.',
  },
]

export default function PurchasePage() {
  const router = useRouter()
  const [showCheckout, setShowCheckout] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const product = PRODUCTS[0]

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePaymentComplete = useCallback(async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    router.push('/dashboard')
  }, [router])

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-background grid-pattern">
        <Header />
        <main className="pt-16 px-6 py-12">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setShowCheckout(false)}
              className="text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm flex items-center gap-2"
            >
              <span>←</span>
              Back to details
            </button>
            
            <div className="text-center mb-8 space-y-2">
              <p className="font-mono text-xs text-muted-foreground tracking-widest">{'>> CHECKOUT'}</p>
              <h1 className="text-3xl font-black">Complete Your Purchase</h1>
              <p className="text-muted-foreground text-sm">Secure checkout powered by Stripe</p>
            </div>

            {isProcessing ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-foreground font-medium">Processing payment...</p>
                <p className="text-muted-foreground text-sm mt-1">Unlocking your full report...</p>
              </div>
            ) : (
              <Checkout 
                productId={product.id} 
                onComplete={handlePaymentComplete}
              />
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col grid-pattern">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 px-6 border-b border-border">
          <div className="max-w-4xl mx-auto space-y-6">
            <p className={`font-mono text-xs text-muted-foreground tracking-widest transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              {'>> PRODUCT: FULL_REPORT_ACCESS'}
            </p>
            <h1 className={`text-5xl md:text-6xl font-black leading-tight transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Unlock Your Complete<br />
              <span className="text-primary">DOTIQ Analysis</span>
            </h1>
            <p className={`text-xl text-muted-foreground max-w-2xl transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Get detailed insights, personalized action plans, and development resources based on your assessment results.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-5 gap-12 items-start">
            {/* Features */}
            <div className="lg:col-span-3 space-y-8">
              <div className="space-y-2">
                <p className="font-mono text-xs text-muted-foreground tracking-widest">
                  {'>> PACKAGE_CONTENTS'}
                </p>
                <h2 className="text-2xl font-black">What&apos;s Included</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, i) => (
                  <div
                    key={feature.num}
                    className="card-premium bg-card border border-border rounded-lg p-5 space-y-3 animate-fade-in-up"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-primary">{feature.num}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">// {feature.label}</span>
                    </div>
                    <h3 className="font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>

              {/* Quote */}
              <div className="py-8 border-t border-border">
                <blockquote className="text-lg italic text-muted-foreground">
                  &quot;Most training focuses on what an athlete can DO. <span className="text-foreground font-medium">We develop who an athlete IS.</span>&quot;
                </blockquote>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 bg-card border border-border rounded-lg p-6 space-y-6 card-premium">
                <div className="space-y-1">
                  <p className="font-mono text-[10px] text-muted-foreground tracking-widest">{'>> PRICING'}</p>
                  <h2 className="font-bold">{product.name}</h2>
                </div>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black">
                    ${(product.priceInCents / 100).toFixed(0)}
                  </span>
                  <span className="text-muted-foreground">.{String(product.priceInCents % 100).padStart(2, '0')}</span>
                </div>
                <p className="text-sm text-muted-foreground">One-time payment</p>

                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:scale-[1.02] transition-all duration-300 animate-glow-pulse"
                >
                  Unlock Full Report →
                </button>

                <div className="space-y-2 pt-4 border-t border-border">
                  {[
                    'Instant access after payment',
                    'Secure checkout via Stripe',
                    '30-day access to full report',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-center text-muted-foreground pt-4 border-t border-border">
                  Haven&apos;t taken the assessment yet?{' '}
                  <Link href="/assessment" className="text-primary hover:underline">
                    Start free →
                  </Link>
                </p>
              </div>
            </div>
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
