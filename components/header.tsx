"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface Profile {
  full_name: string | null
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || user?.phone || 'User'

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
          {loading ? (
            <div className="w-20 h-4 bg-muted animate-pulse rounded" />
          ) : user ? (
            <>
              <Link 
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/assessment"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Assessment
              </Link>
              {/* Avatar dropdown */}
              <div className="relative group">
                <button className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:scale-105 transition-all duration-200 ring-2 ring-primary/30 hover:ring-primary/60">
                  {displayName.charAt(0).toUpperCase()}
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs text-muted-foreground font-mono">SIGNED IN AS</p>
                    <p className="text-sm font-semibold truncate mt-0.5">{displayName}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/assessment" className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                      Take Assessment
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted/50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
