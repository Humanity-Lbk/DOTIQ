"use client"

import Link from "next/link"

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full" />
          <span className="font-bold text-sm tracking-widest uppercase text-foreground">DOTIQ</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/purchase" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign Up
          </Link>
          <Link href="/purchase" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Assessment
          </Link>
        </div>
      </div>
    </header>
  )
}
