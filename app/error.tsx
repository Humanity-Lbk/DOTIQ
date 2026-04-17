'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-mono tracking-widest">{'>> ERROR'}</p>
          <h1 className="text-2xl font-black">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            Try again. If this keeps happening, head back home and restart the flow.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
          <Link
            href="/"
            className="flex-1 px-4 py-2.5 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition-colors text-center"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}

