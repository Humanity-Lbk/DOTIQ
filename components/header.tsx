"use client"

import Link from "next/link"

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-black text-sm">D</span>
          </div>
          <span className="font-bold text-foreground">DOTIQ</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/assessment" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Assessment
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/auth/login" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/assessment" 
            className="px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}
