import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import { Target, Users, TrendingUp, Brain, ArrowRight, BarChart3, Zap, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-24 md:py-40 overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          
          <div className="relative max-w-7xl mx-auto px-6">
            <div className="max-w-4xl">
              <p className="text-primary font-medium mb-4 tracking-wide uppercase text-sm">
                Athletic Performance Intelligence
              </p>
              <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight mb-6 leading-[1.1]">
                Building the Future of Athletic Performance
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-2xl">
                DOTIQ measures what matters most: the intangibles that separate good athletes from elite competitors.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-base h-12 px-8">
                  <Link href="/purchase">
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base h-12 px-8 border-border hover:bg-secondary">
                  <Link href="#how-it-works">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border bg-card/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
              {[
                { value: "50", label: "Assessment Questions" },
                { value: "4", label: "Core Pillars" },
                { value: "10", label: "Minutes to Complete" },
                { value: "100%", label: "Data-Driven" },
              ].map((stat) => (
                <div key={stat.label} className="py-8 md:py-12 px-4 md:px-8 text-center">
                  <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Pillars Section */}
        <section id="pillars" className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <p className="text-primary font-medium mb-4 tracking-wide uppercase text-sm">
                The Framework
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
                Four Pillars of Athletic Excellence
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl">
                DOTIQ evaluates the foundational traits that coaches, scouts, and athletic directors value most.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-5xl font-bold text-muted/30">D</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Discipline</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Consistency, preparation, and unwavering commitment to the daily process of improvement. The foundation of all athletic achievement.
                </p>
              </div>
              
              <div className="group bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-5xl font-bold text-muted/30">O</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Ownership</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Accountability, leadership, and taking full responsibility for your actions and outcomes. True competitors own every moment.
                </p>
              </div>
              
              <div className="group bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-5xl font-bold text-muted/30">T</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Toughness</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Mental resilience, grit, and the ability to maintain composure under pressure. The difference maker in high-stakes moments.
                </p>
              </div>
              
              <div className="group bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Brain className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-5xl font-bold text-muted/30">IQ</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Sports IQ</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Game awareness, quick decision-making, and the ability to read and adapt to any situation. See the game before it happens.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 md:py-32 bg-card/50 border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16 text-center">
              <p className="text-primary font-medium mb-4 tracking-wide uppercase text-sm">
                Simple Process
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                How It Works
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div className="hidden md:block h-px flex-1 bg-border" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Take the Assessment</h3>
                <p className="text-muted-foreground">
                  Complete our 50-question assessment designed by sports psychologists and performance experts.
                </p>
              </div>
              
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div className="hidden md:block h-px flex-1 bg-border" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Get Your Score</h3>
                <p className="text-muted-foreground">
                  Receive your personalized DOTIQ score with detailed breakdowns across all four pillars.
                </p>
              </div>
              
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Elevate Your Game</h3>
                <p className="text-muted-foreground">
                  Use data-driven insights to identify growth areas and develop the mental edge that defines champions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6">
                <BarChart3 className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Data-Driven Insights</h3>
                <p className="text-muted-foreground text-sm">
                  Quantify the intangibles with our proprietary scoring methodology.
                </p>
              </div>
              
              <div className="p-6">
                <Zap className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Quick Assessment</h3>
                <p className="text-muted-foreground text-sm">
                  Complete your assessment in just 10 minutes with instant results.
                </p>
              </div>
              
              <div className="p-6">
                <TrendingUp className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Track Progress</h3>
                <p className="text-muted-foreground text-sm">
                  Monitor your development over time and see your growth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-6">
                Ready to Discover Your DOTIQ?
              </h2>
              <p className="text-xl text-muted-foreground mb-10">
                Join the next generation of athletes measuring what truly matters.
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
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg text-foreground">DOTIQ</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Building the Future of Athletic Performance Intelligence
            </p>
            <div className="flex items-center gap-6">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
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
