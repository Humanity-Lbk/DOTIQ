import Link from "next/link"
import Header from "@/components/header"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-16 px-4">
        {/* Hero */}
        <section className="py-16 md:py-24 border-b border-border max-w-4xl mx-auto">
          <div className="space-y-4">
            <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
              {'>> SYSTEM_ARCH: ABOUT_DOTIQ'}
            </p>
            <h1 className="text-5xl md:text-6xl font-black">
              Measuring What Truly Matters
            </h1>
            <p className="text-lg text-muted-foreground">
              DOTIQ is a sports assessment platform designed to quantify and improve the intangibles that separate average athletes from elite competitors. We measure what the scoreboard can&apos;t.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 md:py-24 border-b border-border max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
                {'>> MISSION_STATEMENT'}
              </p>
              <h2 className="text-3xl md:text-4xl font-black">
                Building the Standard for Athletic Character
              </h2>
            </div>

            <div className="space-y-4 text-muted-foreground">
              <p className="text-lg leading-relaxed">
                Physical talent is measurable. Speed, strength, agility — these are easy to quantify. But what about the traits that truly define champions?
              </p>
              <p className="text-lg leading-relaxed">
                DOTIQ exists to measure what coaches have always known matters: Discipline, Ownership, Toughness, and Sports IQ. We&apos;re making the unmeasurable, measurable. We&apos;re building who an athlete IS, not just what they can DO.
              </p>
            </div>
          </div>
        </section>

        {/* The Framework */}
        <section className="py-16 md:py-24 border-b border-border max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
                {'>> METRIC_TYPE: BEHAVIORAL'}
              </p>
              <h2 className="text-3xl md:text-4xl font-black">
                The Four Pillars
              </h2>
              <p className="text-lg text-muted-foreground">
                Elite performers share four measurable behavioral traits. These are not abstract concepts — they are observable, measurable, and developable.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
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
                  letter: 'I',
                  title: 'SPORTS IQ',
                  desc: 'Situational awareness, decision-making speed, and game intelligence.',
                },
              ].map((pillar) => (
                <div
                  key={pillar.letter}
                  className="border-l-4 border-primary border-b border-r border-border rounded-lg p-6 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-4xl font-black text-primary">{pillar.letter}</div>
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">BEHAVIORAL</p>
                      <h3 className="font-bold text-sm">{pillar.title}</h3>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="py-16 md:py-24 border-b border-border max-w-4xl mx-auto">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
                {'>> TARGET_AUDIENCE'}
              </p>
              <h2 className="text-3xl md:text-4xl font-black">
                Athletes at Every Level
              </h2>
            </div>

            <p className="text-lg text-muted-foreground">
              DOTIQ is designed for athletes from late elementary through high school and beyond. Whether you&apos;re just starting your athletic journey or preparing for the next level, understanding your mental game is essential.
            </p>

            <ul className="space-y-3">
              {[
                'Youth athletes building their foundation',
                'High school athletes preparing for recruitment',
                'Coaches seeking deeper insight into their athletes',
                'Parents investing in holistic development',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 max-w-4xl mx-auto text-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-black">
              Ready to Discover Your DOTIQ?
            </h2>
            <p className="text-lg text-muted-foreground">
              Take the assessment and unlock insights into the mental game that defines champions.
            </p>
            <Link href="/purchase" className="inline-block px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all">
              Get Started →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 text-center">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          {'>> DOTIQ · DOT IN · BE IQ'}
        </p>
      </footer>
    </div>
  )
}
