"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import useSWR from "swr"

const supabase = createClient()

async function fetchUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  
  // Use same SWR cache key as sidebar for consistency
  const { data: user, isLoading } = useSWR("header-user", fetchUser, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-md border-b border-border' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <Image 
            src="/logo.png" 
            alt="DOTIQ" 
            width={180} 
            height={56} 
            className="h-11 w-auto invert brightness-0"
            priority
          />
        </Link>
        
        <nav className="flex items-center gap-6">
          {isLoading ? (
            <div className="w-20 h-4 bg-muted animate-pulse rounded" />
          ) : user ? (
            <Link 
              href="/dashboard"
              prefetch={true}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link 
                href="/auth/login"
                prefetch={true}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/sign-up"
                prefetch={true}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sign Up
              </Link>
              <Link 
                href="/assessment"
                prefetch={true}
                className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Assessment
                <span className="group-hover:translate-x-0.5 transition-transform duration-150">→</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
