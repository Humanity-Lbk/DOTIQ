import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              About DOT IQ
            </h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                DOT IQ is a sports assessment and athlete development platform designed to measure and improve the intangibles that separate average players from elite competitors.
              </p>
              
              <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
                The Four Pillars
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Our assessment measures four core attributes that coaches and scouts consistently identify as indicators of elite athletic potential:
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex gap-3">
                  <span className="font-semibold text-chart-1">Discipline</span>
                  <span className="text-muted-foreground">- Consistency, preparation, and commitment to the process</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-chart-2">Ownership</span>
                  <span className="text-muted-foreground">- Accountability, leadership, and taking responsibility</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-chart-3">Toughness</span>
                  <span className="text-muted-foreground">- Mental resilience, grit, and composure under pressure</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-chart-4">Sports IQ</span>
                  <span className="text-muted-foreground">- Game awareness, decision-making, and adaptability</span>
                </li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                At its core is a 50-question assessment that generates a proprietary DOT IQ score. The system is designed to be validated through multi-party input from coaches, teammates, and peers, providing a well-rounded evaluation of an athlete&apos;s character and mindset.
              </p>
              
              <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
                Who Is It For?
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                DOT IQ targets athletes from late elementary through high school, with a strong emphasis on character development, ethical partnerships, and athlete growth. Our goal is to become the standard for measuring and developing the mindset behind athletic performance.
              </p>
            </div>
            
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Ready to find out your score?
              </h3>
              <Button asChild size="lg">
                <Link href="/assessment">Take the Assessment</Link>
              </Button>
            </div>
          </div>
        </div>
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
