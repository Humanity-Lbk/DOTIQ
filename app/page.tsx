import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import { Target, Users, TrendingUp, Brain } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-6 text-balance">
                Measure the Mindset Behind Athletic Performance
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed text-pretty">
                Discover your DOT IQ score and unlock the intangibles that separate average players from elite competitors.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-base">
                  <Link href="/purchase">Take the Assessment</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* What is DOT IQ */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
                What is DOT IQ?
              </h2>
              <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                DOT IQ measures the four pillars of athletic character that coaches and scouts value most.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-background border border-border rounded-lg p-6">
                  <div className="w-12 h-12 rounded-lg bg-chart-1/20 flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-chart-1" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Discipline</h3>
                  <p className="text-muted-foreground">
                    Consistency, preparation, and unwavering commitment to the process of improvement.
                  </p>
                </div>
                
                <div className="bg-background border border-border rounded-lg p-6">
                  <div className="w-12 h-12 rounded-lg bg-chart-2/20 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-chart-2" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Ownership</h3>
                  <p className="text-muted-foreground">
                    Accountability, leadership, and taking full responsibility for your actions and outcomes.
                  </p>
                </div>
                
                <div className="bg-background border border-border rounded-lg p-6">
                  <div className="w-12 h-12 rounded-lg bg-chart-3/20 flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-chart-3" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Toughness</h3>
                  <p className="text-muted-foreground">
                    Mental resilience, grit, and the ability to maintain composure under pressure.
                  </p>
                </div>
                
                <div className="bg-background border border-border rounded-lg p-6">
                  <div className="w-12 h-12 rounded-lg bg-chart-4/20 flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 text-chart-4" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Sports IQ</h3>
                  <p className="text-muted-foreground">
                    Game awareness, quick decision-making, and the ability to adapt to any situation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
                How It Works
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Take the Assessment</h3>
                  <p className="text-muted-foreground">
                    Complete our 50-question assessment that evaluates your athletic mindset across four key areas.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Get Your Score</h3>
                  <p className="text-muted-foreground">
                    Receive your personalized DOT IQ score with detailed breakdowns for each category.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Develop Your Game</h3>
                  <p className="text-muted-foreground">
                    Access tailored development resources to strengthen your weakest areas and elevate your game.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Discover Your DOT IQ?
              </h2>
              <p className="text-muted-foreground mb-8">
                Take the assessment and find out where you stand. It only takes about 10 minutes.
              </p>
              <Button asChild size="lg" className="text-base">
                <Link href="/purchase">Start Assessment</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">D</span>
              </div>
              <span className="font-semibold text-foreground">DOT IQ</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Measuring the mindset behind athletic performance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
