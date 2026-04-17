import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'

import AppSidebar from '@/components/app-sidebar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Mobile top bar + drawer */}
      <header className="md:hidden sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
        <div className="h-14 px-4 flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <AppSidebar variant="sheet" />
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="DOTIQ"
              width={140}
              height={44}
              className="h-8 w-auto invert brightness-0"
              priority
            />
          </Link>

          <div className="w-10" />
        </div>
      </header>

      <div className="md:pl-64">
        {children}
      </div>
    </div>
  )
}

