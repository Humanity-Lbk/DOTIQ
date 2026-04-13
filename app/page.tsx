'use client'

import Link from 'next/link'
import Header from '@/components/header'

const SystemLabel = ({ text, color = 'text-muted-foreground' }: { text: string; color?: string }) => (
  <p className={`text-xs uppercase tracking-widest font-mono mb-4 ${color}`}>
    {`>> ${text}`}
  </p>
)

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 py-20 border-b border-border">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                SYS.INIT: DOTIQ_CORE | V.2026.1.0 | STATUS: ACTIVE | TARGET: ATHLETIC_INTELLIGENCE
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm uppercase tracking-widest text-primary font-mono">
                {'>> DOT IN : BE IQ'}
              </p>
              <h1 className="text-5xl md:text-7xl font-black leading-tight">
                Building the Future of{' '}
                <span className="text-primary">Athletic Performance</span>
                <br />
                Intelligence
              </h1>
            </div>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The question isn&apos;t just what athletes can do — it&apos;s who they become when the lights come on. DOTIQ measures what the scoreboard can&apos;t.
            </p>

            <p className="text-sm font-mono text-red-500">
              {'>> PREDICTIVE ACCURACY: LOW WITHOUT INTANGIBLES'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 group">
                Take the DOTIQ Assessment
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            <p className="text-sm text-muted-foreground pt-2">
              Free. Quick signup. About 10 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 text-sm">
              <button className="px-6 py-2 border border-primary rounded-lg text-primary hover:bg-primary/10 transition-colors">
                Coach Assessment
              </button>
              <span className="text-muted-foreground">or</span>
              <button className="px-6 py-2 border border-primary rounded-lg text-primary hover:bg-primary/10 transition-colors">
                Peer Assessment
              </button>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-24 px-4 border-b border-border">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="space-y-4">
              <SystemLabel text="SYSTEM_ARCH: ASSESSMENT_PROTOCOL" />
              <h2 className="text-4xl md:text-5xl font-black">
                Turning Intangibles Into Insight
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                The DOTIQ Assessment evaluates athletes behaviors and habits and turns them into clear, development-focused insights athletes can actually use.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
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
              ].map((item) => (
                <div
                  key={item.num}
                  className="border border-border rounded-lg p-6 space-y-4 hover:border-primary/50 transition-colors"
                >
                  <p className="text-primary font-mono text-sm font-bold">
                    {item.num} {`// ${item.label}`}
                  </p>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center border-t border-b border-border py-12">
              <p className="text-2xl font-black italic text-white">
                &quot;Most training focuses on what an athlete can DO. We develop who an athlete IS.&quot;
              </p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mt-6">
                {'>> JOIN THE MOVEMENT'}
              </p>
            </div>
          </div>
        </section>

        {/* Missing Data Section */}
        <section className="py-24 px-4 border-b border-border">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="space-y-4">
              <p className="text-red-500 font-mono text-sm font-bold">ERR: MISSING_DATA</p>
              <p className="text-muted-foreground font-mono text-sm">CURRENT STANDARD: &quot;WHAT THEY CAN DO&quot;</p>
            </div>

            <div className="flex flex-wrap gap-3 mb-12">
              {[
                '40-Yard Dash',
                'Vertical Jump',
                'Bat Speed',
                'Spin Rate',
                'Launch Angle',
              ].map((metric) => (
                <div
                  key={metric}
                  className="px-4 py-2 border border-border rounded text-sm font-mono text-primary"
                >
                  {`[MEASURABLE] ${metric}`}
                </div>
              ))}
            </div>

            <p className="text-muted-foreground font-mono text-sm mb-12">
              {'>> THE MISSING LINK: "WHO THEY ARE"'}
            </p>

            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {[
                { label: 'Discipline' },
                { label: 'Ownership' },
                { label: 'Toughness' },
                { label: 'Sports IQ' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="px-4 py-2 border border-border rounded text-sm font-mono text-primary"
                >
                  {`[UNKNOWN] ${item.label}`}
                </div>
              ))}
            </div>

            <blockquote className="text-center text-lg italic text-muted-foreground border-l-4 border-primary pl-6 py-6">
              &quot;Michael Jordan missed 26 game-winners. Steph Curry misses 58% of 3s. Failure is inherent. Resilience is the differentiator.&quot;
            </blockquote>
          </div>
        </section>

        {/* Pillars Section */}
        <section className="py-24 px-4 border-b border-border">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="space-y-4">
              <SystemLabel text="DATA_SOURCE: FOUNDER_EXPERIENCE" />
              <h2 className="text-4xl md:text-5xl font-black">
                &quot;IT&quot; Can Be Measured
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Elite performers share four measurable behavioral traits. These are not abstract concepts — they are observable, measurable, and developable.
              </p>
              <p className="text-sm font-mono text-primary pt-4">
                {'>> METRIC_TYPE: BEHAVIORAL • STATUS: QUANTIFIED'}
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  letter: 'D',
                  title: 'DISCIPLINE',
                  desc: 'Consistency in preparation, habits, standards, and execution when motivation fades.',
                },
                {
                  letter: 'O',
                  title: 'OWNERSHIP',
                  desc: 'Responsibility and accountability for actions, outcomes, and continuous improvement to become a leader.',
                },
                {
                  letter: 'T',
                  title: 'TOUGHNESS',
                  desc: 'Mental, physical, and emotional resilience under pressure, adversity, and failure.',
                },
                {
                  letter: 'I',
                  title: 'SPORTS IQ',
                  desc: 'Situational awareness, decision-making speed, and game intelligence.',
                },
              ].map((pillar) => (
                <div
                  key={pillar.letter}
                  className="border-l-4 border-primary border-b border-r border-border rounded-lg p-6 space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-black text-primary">{pillar.letter}</div>
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">BEHAVIORAL METRIC</p>
                      <h3 className="text-lg font-bold">{pillar.title}</h3>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 border-b border-border text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <SystemLabel text="SYSTEM_STATUS: AWAITING_INPUT" />
            <h2 className="text-4xl md:text-5xl font-black">The work starts now.</h2>
            <button className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2 group mx-auto">
              Begin Assessment
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </section>


      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-8 text-sm">
          <div className="flex items-center gap-2 font-mono">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span>DOTIQ · DOT IN · BE IQ</span>
          </div>
          <div className="flex gap-6 text-muted-foreground">
            <span>DISCIPLINE</span>
            <span>·</span>
            <span>OWNERSHIP</span>
            <span>·</span>
            <span>TOUGHNESS</span>
            <span>·</span>
            <span>IQ</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
