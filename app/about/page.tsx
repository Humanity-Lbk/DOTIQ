import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import { ArrowRight, Target, Users, Shield, Brain } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="py-24 md:py-32 border-b border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl">
              <p className="text-primary font-medium mb-4 tracking-wide uppercase text-sm">
                About DOTIQ
              </p>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-6 leading-[1.1]">
                Measuring What Truly Matters in Athletics
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                DOTIQ is a sports assessment and athlete development platform designed to quantify and improve the intangibles that separate average players from elite competitors.
              </p>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-primary font-medium mb-4 tracking-wide uppercase text-sm">
                  Our Mission
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-6">
                  Building the Standard for Athletic Character Assessment
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Physical talent is measurable. Speed, strength, agility - these are easy to quantify. But what about the traits that truly define champions?
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  DOTIQ exists to measure what coaches have always known matters: discipline, ownership, toughness, and sports IQ. We&apos;re making the unmeasurable, measurable.
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-8 md:p-12">
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Data-Driven</h3>
                      <p className="text-sm text-muted-foreground">Proprietary scoring methodology backed by sports psychology</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Multi-Party Validation</h3>
                      <p className="text-sm text-muted-foreground">Input from coaches, teammates, and peers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Character First</h3>
                      <p className="text-sm text-muted-foreground">Emphasis on ethical development and growth</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Framework */}
        <section className="py-24 md:py-32 bg-card/50 border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <p className="text-primary font-medium mb-4 tracking-wide uppercase text-sm">
                The Framework
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-6">
                Four Pillars That Define Athletic Excellence
              </h2>
              <p className="text-lg text-muted-foreground">
                Our assessment measures the core attributes that coaches and scouts consistently identify as indicators of elite athletic potential.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-background border border-border rounded-lg p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Discipline</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Consistency, preparation, and unwavering commitment to the daily process of improvement. The foundation upon which all athletic achievement is built.
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Ownership</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Accountability, leadership, and taking full responsibility for your actions and outcomes. True competitors own every moment, win or lose.
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Toughness</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Mental resilience, grit, and the ability to maintain composure under pressure. The difference maker when everything is on the line.
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Sports IQ</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Game awareness, quick decision-making, and the ability to read and adapt to any situation. See the game before it happens.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl">
              <p className="text-primary font-medium mb-4 tracking-wide uppercase text-sm">
                Who It&apos;s For
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-6">
                Athletes at Every Level
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                DOTIQ is designed for athletes from late elementary through high school and beyond. Whether you&apos;re just starting your athletic journey or preparing for the next level, understanding your mental game is essential.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground">Youth athletes building their foundation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground">High school athletes preparing for recruitment</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground">Coaches seeking deeper insight into their athletes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground">Parents investing in holistic development</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 md:py-32 border-t border-border bg-card/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-6">
                Ready to Discover Your DOTIQ?
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                Take the assessment and unlock insights into the mental game that defines champions.
              </p>
              <Button asChild size="lg" className="text-base h-12 px-8">
                <Link href="/purchase">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="font-bold text-lg text-foreground">DOTIQ</span>
            <p className="text-sm text-muted-foreground">
              Building the Future of Athletic Performance Intelligence
            </p>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/purchase" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Assessment
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
