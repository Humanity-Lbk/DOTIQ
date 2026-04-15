"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface Profile {
  full_name: string | null
  role: 'user' | 'admin' | 'super_admin'
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
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
              {/* Avatar dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:scale-105 transition-all duration-200 ring-2 ring-primary/30 hover:ring-primary/60"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {displayName.charAt(0).toUpperCase()}
                </button>
                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-xs text-muted-foreground font-mono">SIGNED IN AS</p>
                      <p className="text-sm font-semibold truncate mt-0.5">{displayName}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/assessment"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        Take Assessment
                      </Link>
                      {/* Admin/Super Admin section */}
                      {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
                        <>
                          <div className="border-t border-border my-1" />
                          <p className="px-4 py-1 text-[10px] font-mono text-muted-foreground/60">ADMIN</p>
                          
                          {/* Requests - visible to both admin and super_admin */}
                          <Link
                            href="/requests"
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                          >
                            Requests & Tickets
                          </Link>
                          
                          {/* Change Log (external) - visible to both */}
                          <Link
                            href="/client-updates"
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                          >
                            Change Log
                          </Link>
                          
                          {/* Internal Change Log - super_admin only */}
                          {profile?.role === 'super_admin' && (
                            <Link
                              href="/client-updates?view=internal"
                              onClick={() => setDropdownOpen(false)}
                              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            >
                              Change Log
                              <span className="ml-2 text-[10px] text-neon-gold font-mono">INTERNAL</span>
                            </Link>
                          )}
                        </>
                      )}
                      <div className="border-t border-border my-1" />
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted/50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
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
