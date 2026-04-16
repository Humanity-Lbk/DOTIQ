"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  History,
  MessageSquare,
  LogOut,
  ChevronRight,
  LogIn,
  UserPlus,
} from "lucide-react"

interface Profile {
  full_name: string | null
  role: "user" | "admin" | "super_admin"
}

export default function AppSidebar() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single()
        setProfile(data)
      }
      setLoading(false)
    }
    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User"
  const role = profile?.role

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href))

  const linkClass = (href: string) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
      isActive(href)
        ? "bg-primary/10 text-primary font-medium"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    }`

  const authedNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/assessments", label: "My Assessments", icon: FileText },
    { href: "/assessment", label: "Take Assessment", icon: ClipboardList },
  ]

  const adminNavItems = [
    { href: "/requests", label: "Requests & Tickets", icon: MessageSquare },
    { href: "/client-updates", label: "Change Log", icon: History },
  ]

  const guestNavItems = [
    { href: "/assessment", label: "Take Assessment", icon: ClipboardList },
    { href: "/auth/login", label: "Sign In", icon: LogIn },
    { href: "/auth/sign-up", label: "Sign Up", icon: UserPlus },
  ]

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <Link href={user ? "/dashboard" : "/"}>
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
        {loading ? (
          <div className="space-y-2 px-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : user ? (
          <>
            {authedNavItems.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
                {isActive(item.href) && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
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
                  <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                    {isActive(item.href) && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                  </Link>
                ))}
                {role === "super_admin" && (
                  <Link href="/client-updates?view=internal" className={linkClass("/client-updates?view=internal")}>
                    <History className="w-4 h-4 shrink-0" />
                    Internal View
                    <span className="ml-auto text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono">
                      DEV
                    </span>
                  </Link>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {guestNavItems.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User profile + sign out */}
      {!loading && user && (
        <div className="p-3 border-t border-border shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground capitalize">{role || "user"}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  )
}
