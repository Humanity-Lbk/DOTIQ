"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-md border-b border-border' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-2.5 h-2.5 rounded-full bg-primary group-hover:animate-glow-pulse transition-all" />
          <span className="font-bold text-sm tracking-widest text-foreground">DOTIQ</span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link 
            href="/auth/login" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/auth/sign-up" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign Up
          </Link>
          <Link 
            href="/assessment"
            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Assessment
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
