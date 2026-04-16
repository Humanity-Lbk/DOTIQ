export default function AssessmentsLoading() {
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
        <main className="max-w-5xl mx-auto px-6 py-10">
          {/* Header skeleton */}
          <div className="mb-8 space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-5 w-64 bg-muted/60 animate-pulse rounded" />
          </div>

          {/* Assessment list skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 bg-card border border-border rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-5 w-40 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-24 bg-muted/60 animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="h-10 w-28 bg-primary/20 animate-pulse rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
