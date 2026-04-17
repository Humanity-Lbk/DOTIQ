"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import useSWR from "swr"
import { fetchUserAndProfile, type Profile, USER_PROFILE_CACHE_KEY } from "@/lib/auth/user-profile"
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  History,
  MessageSquare,
  LogOut,
  ChevronRight,
} from "lucide-react"

export default function AppSidebar({ variant = "fixed" }: { variant?: "fixed" | "sheet" }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isInternalActive, setIsInternalActive] = useState(false)
  
  // SWR caches this globally - won't refetch on every page navigation
  const { data, mutate } = useSWR(USER_PROFILE_CACHE_KEY, fetchUserAndProfile, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 1 minute deduplication
  })
  
  const user = data?.user ?? null
  const profile = data?.profile as Profile | null

  const handleSignOut = useCallback(async () => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    mutate({ user: null, profile: null }, false) // Clear cache immediately
    router.push("/")
    router.refresh()
  }, [mutate, router])

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User"
  const role = profile?.role

  const isActive = useCallback((href: string) => {
    // Only exact match - no partial matching to prevent multiple highlights
    return pathname === href
  }, [pathname])

  const navItems = useMemo(() => [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/assessments", label: "My Assessments", icon: FileText },
    { href: "/assessment", label: "Take Assessment", icon: ClipboardList },
  ], [])

  const adminNavItems = useMemo(() => [
    { href: "/requests", label: "Requests & Tickets", icon: MessageSquare },
    { href: "/client-updates", label: "Change Log", icon: History },
  ], [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const view = new URLSearchParams(window.location.search).get("view")
    setIsInternalActive(pathname === "/client-updates" && view === "internal")
  }, [pathname])

  const asideClassName =
    variant === "fixed"
      ? "fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col z-50 will-change-transform"
      : "h-full w-full bg-card border-r border-border flex flex-col"

  return (
    <aside className={asideClassName}>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <Link href="/dashboard" className="transition-opacity hover:opacity-80">
          <Image
            src="/logo.png"
            alt="DOTIQ"
            width={160}
            height={48}
            className="h-9 w-auto invert brightness-0"
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
              isActive(item.href)
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
            {isActive(item.href) && <ChevronRight className="w-3.5 h-3.5 ml-auto transition-transform" />}
          </Link>
        ))}

        {(role === "admin" || role === "super_admin") && (
          <>
            <div className="pt-5 pb-1.5">
              <p className="px-3 text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">
                Admin
              </p>
            </div>
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
                {isActive(item.href) && <ChevronRight className="w-3.5 h-3.5 ml-auto transition-transform" />}
              </Link>
            ))}
            {role === "super_admin" && (
              <Link
                href="/client-updates?view=internal"
                prefetch={true}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isInternalActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <History className="w-4 h-4 shrink-0" />
                Internal View
                <span className="ml-auto text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono">
                  DEV
                </span>
              </Link>
            )}
          </>
        )}
      </nav>

      {/* User profile + sign out */}
      <div className="p-3 border-t border-border shrink-0">
        {!data ? (
          // Skeleton loading state
          <div className="animate-pulse">
            <div className="flex items-center gap-3 px-3 py-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-3 w-12 bg-muted/60 rounded" />
              </div>
            </div>
            <div className="h-9 w-full bg-muted/40 rounded-lg mt-1" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-3 py-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground capitalize">{role || "User"}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sign Out
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
