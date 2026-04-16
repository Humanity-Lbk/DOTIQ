export default function ClientUpdatesLoading() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar skeleton */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col z-50">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="h-9 w-28 bg-muted animate-pulse rounded" />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-muted/40 animate-pulse rounded-lg" />
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-3 w-12 bg-muted/60 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content skeleton */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 h-16 bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="h-6 w-28 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-8 w-20 bg-muted/40 animate-pulse rounded-lg" />
        </header>

        <main className="max-w-4xl mx-auto px-8 py-8">
          {/* Hero skeleton */}
          <div className="mb-8 space-y-2">
            <div className="h-3 w-24 bg-muted/40 animate-pulse rounded" />
            <div className="h-9 w-72 bg-muted animate-pulse rounded" />
            <div className="h-5 w-96 bg-muted/60 animate-pulse rounded" />
          </div>

          {/* Stats card skeleton */}
          <div className="mb-8 p-6 bg-card/50 border border-border rounded-2xl">
            <div className="flex items-end justify-between">
              <div className="space-y-2">
                <div className="h-3 w-36 bg-muted/40 animate-pulse rounded" />
                <div className="h-10 w-24 bg-muted animate-pulse rounded" />
              </div>
              <div className="space-y-1 text-right">
                <div className="h-7 w-12 bg-muted animate-pulse rounded ml-auto" />
                <div className="h-3 w-24 bg-muted/40 animate-pulse rounded" />
              </div>
            </div>
          </div>

          {/* Update items skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-5 bg-card/50 border border-border rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted/40 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-5 w-40 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-64 bg-muted/60 animate-pulse rounded" />
                      <div className="h-3 w-24 bg-muted/40 animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-12 bg-muted/40 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
