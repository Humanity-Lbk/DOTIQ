import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 space-y-5 text-center">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-mono tracking-widest">{'>> 404'}</p>
          <h1 className="text-2xl font-black">Page not found</h1>
          <p className="text-sm text-muted-foreground">
            The page you’re looking for doesn’t exist or has moved.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/"
            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-center"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 px-4 py-2.5 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition-colors text-center"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

