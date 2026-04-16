export default function DashboardLoading() {
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
        <main className="max-w-5xl mx-auto px-6 py-12">
          {/* Header skeleton */}
          <div className="mb-10 space-y-3">
            <div className="h-4 w-20 bg-muted/50 animate-pulse rounded" />
            <div className="h-10 w-64 bg-muted animate-pulse rounded" />
            <div className="h-5 w-48 bg-muted/60 animate-pulse rounded" />
          </div>

          {/* Assessment cards skeleton */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-3 w-24 bg-muted/50 animate-pulse rounded" />
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-10 w-40 bg-primary/20 animate-pulse rounded-lg" />
            </div>
            
            {[1, 2].map((i) => (
              <div key={i} className="p-6 bg-card border border-border rounded-2xl">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-48 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-32 bg-muted/60 animate-pulse rounded" />
                    <div className="flex gap-2 mt-4">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="h-2 w-24 bg-muted/40 animate-pulse rounded-full" />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-10 w-32 bg-primary/20 animate-pulse rounded-lg" />
                    <div className="h-10 w-32 bg-muted/40 animate-pulse rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
