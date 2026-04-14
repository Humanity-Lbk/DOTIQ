import Link from "next/link"
import Header from "@/components/header"

export default function AboutPage() {
  const pillars = [
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
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero with Gradient */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-fuchsia-800/20 to-cyan-700/10" />
          <div className="absolute top-0 right-0 w-[50%] h-[80%] bg-gradient-to-bl from-primary/20 via-purple-500/10 to-transparent blur-3xl" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6">
            <p className="text-primary font-semibold text-sm tracking-wide">About DOTIQ</p>
            <h1 className="text-5xl md:text-6xl font-black text-balance">
              Measuring What Truly Matters
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              DOTIQ is a sports assessment platform designed to quantify and improve the intangibles that separate average athletes from elite competitors.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-24 px-6 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-primary font-semibold text-sm tracking-wide">Our Mission</p>
                <h2 className="text-3xl md:text-4xl font-black">
                  Building the Standard for Athletic Character
                </h2>
              </div>

              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  Physical talent is measurable. Speed, strength, agility — these are easy to quantify. But what about the traits that truly define champions?
                </p>
                <p className="text-lg leading-relaxed">
                  DOTIQ exists to measure what coaches have always known matters: Discipline, Ownership, Toughness, and Sports IQ. We&apos;re building who an athlete IS, not just what they can DO.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Framework */}
        <section className="py-24 px-6 bg-card/50 border-t border-border">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <p className="text-primary font-semibold text-sm tracking-wide">The Framework</p>
              <h2 className="text-3xl md:text-4xl font-black">The Four Pillars</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Elite performers share four measurable behavioral traits. These are not abstract concepts — they are observable, measurable, and developable.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {pillars.map((pillar) => (
                <div
                  key={pillar.letter}
                  className="bg-card border border-border rounded-2xl p-6 space-y-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                      {pillar.letter}
                    </div>
                    <h3 className="font-bold text-xl">{pillar.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="py-24 px-6 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="space-y-4">
                <p className="text-primary font-semibold text-sm tracking-wide">Who It&apos;s For</p>
                <h2 className="text-3xl md:text-4xl font-black">
                  Athletes at Every Level
                </h2>
                <p className="text-lg text-muted-foreground">
                  DOTIQ is designed for athletes from late elementary through high school and beyond.
                </p>
              </div>

              <ul className="space-y-4">
                {[
                  { label: 'Youth Athletes', desc: 'Building their foundation' },
                  { label: 'High School Athletes', desc: 'Preparing for recruitment' },
                  { label: 'Coaches', desc: 'Seeking deeper insight into their athletes' },
                  { label: 'Parents', desc: 'Investing in holistic development' },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-4 bg-card border border-border rounded-xl p-4">
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
        <section className="py-24 px-6 border-t border-border">
          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="text-3xl md:text-4xl font-black leading-tight">
              &quot;Most training focuses on what an athlete can DO.{' '}
              <span className="text-primary">We develop who an athlete IS.</span>&quot;
            </blockquote>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-24 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-fuchsia-800/20 to-cyan-700/10" />
          
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-black">
              Ready to Discover Your DOTIQ?
            </h2>
            <p className="text-lg text-muted-foreground">
              Take the free assessment and unlock insights into the mental game that defines champions.
            </p>
            <Link 
              href="/assessment" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/25"
            >
              Get Started
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
          <p className="text-sm text-muted-foreground">
            Discipline · Ownership · Toughness · IQ
          </p>
        </div>
      </footer>
    </div>
  )
}
